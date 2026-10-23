#!/usr/bin/env node
// Usage: node record.mjs <spec.mjs|spec.json> [--only slug1,slug2] [--out DIR] [--list] [--review-every N]
//        [--no-voice] [--check-voice] [--voice-only] [--voice-samples] [--no-music] [--music-samples] [--remux]
// Records every happy path in the spec (or the ones named by --only) as an MP4
// with a cursor, captions, narration when the spec has a voice, and title/end
// cards, and music under it when the spec has music, writes review stills and
// a storyboard (one still per card and per caption) for each, and keeps a
// README.txt index in the output folder.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { Recorder, template, sleep, ffmpeg, duration, frameAt } from "../lib/recorder.mjs";
import { Voice, checkClips } from "../lib/voice.mjs";
import { MUSIC_PRESETS, musicOptions, renderMusic } from "../lib/music.mjs";
import { loadSpec, outDirOf, mmss } from "../lib/spec.mjs";

function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--only") out.only = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--list") out.list = true;
    else if (a === "--review-every") out.reviewEvery = Number(argv[++i]);
    else if (a === "--no-voice") out.noVoice = true;
    else if (a === "--check-voice") out.checkVoice = true;
    else if (a === "--voice-only") out.voiceOnly = out.checkVoice = true;
    else if (a === "--voice-samples") out.voiceSamples = true;
    else if (a === "--remux") out.remux = true;
    else if (a === "--no-music") out.noMusic = true;
    else if (a === "--music-samples") out.musicSamples = true;
    else out._.push(a);
  }
  return out;
}

function reviewStills(mp4, dir, every) {
  const bin = ffmpeg();
  if (!bin) return [];
  const out = path.join(dir, "review");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  // From the title card on, then the last seconds: the end of a path is where a failed save would show.
  const d = duration(mp4) || 0;
  for (let t = 1, i = 1; t < d; t += every, i++) frameAt(mp4, t, path.join(out, `t${String(i).padStart(3, "0")}.jpg`));
  if (d) frameAt(mp4, d - 4.5, path.join(out, "zz-end.jpg"));
  return fs.readdirSync(out).sort().map((f) => path.join(out, f));
}

// One still per caption, taken just before the caption changes, or where a step
// held it for reading, so each still shows the result of the steps it describes
// beside the words that describe it. Each card (title, mid and end) gets a
// still too, once it has faded in, so its design can be checked.
function storyboard(mp4, dir, segments, cards = []) {
  if (!ffmpeg() || (!segments?.length && !cards.length)) return null;
  const out = path.join(dir, "storyboard");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const d = duration(mp4) || 0;
  const shots = [
    ...cards.map((c) => ({ at: Math.min(c.t + 1.2, Math.max(0, d - 1)), line: (t) => `${t}  [card] ${[c.kicker, c.title].filter(Boolean).join(", ")}` })),
    ...(segments || []).filter((s) => s.text && s.to - s.from >= 0.5).map((s) => ({
      at: Math.max(s.from, s.heldAt !== undefined ? s.heldAt - 0.3 : s.to - 0.35),
      line: (t) => `${t} to ${mmss(s.to)}  ${s.who ? `[${s.who.replace(/\n/g, ", ")}] ` : ""}${s.text}`,
      from: s.from,
    })),
  ].sort((x, y) => (x.from ?? x.at) - (y.from ?? y.at));
  const lines = [];
  shots.forEach((s, i) => {
    const name = `${String(i + 1).padStart(2, "0")}.jpg`;
    frameAt(mp4, s.at, path.join(out, name));
    lines.push(`${name}  ${s.line(mmss(s.from ?? s.at))}`);
  });
  fs.writeFileSync(path.join(out, "storyboard.txt"), lines.join("\n") + "\n");
  return out;
}

// ---- declarative steps ------------------------------------------------------
async function runSteps(r, steps, ctx) {
  for (const [i, raw] of steps.entries()) {
    const s = typeof raw === "string" ? { caption: raw } : raw;
    const action = s.action || (s.caption !== undefined && Object.keys(s).length === 1 ? "caption" : undefined);
    if (s.who !== undefined && action !== "who") await r.who(s.who);
    if (s.caption !== undefined && action !== "caption") await r.caption(s.caption);
    if (s.say !== undefined && action !== "say") await r.say(s.say);
    // hold: let the caption on screen be read before this step changes what it describes.
    if (s.hold) await r.holdForReading(true);
    const label = `${ctx.slug} step ${i + 1} (${action}${typeof s.target === "string" ? " " + s.target : s.target ? " locator" : ""})`;
    switch (action) {
      case "caption": await r.caption(s.caption ?? s.text); break;
      case "who": await r.who(s.who ?? s.text); break;
      case "say": await r.say(s.say ?? s.text); break;
      case "none": break; // the path's opening goto, already done under the title card
      case "goto": await r.goto(s.url); break;
      case "click": await r.click(s.target, s); break;
      case "hover": await r.hover(s.target, s); break;
      case "type": await r.type(s.target, s.value, s); break;
      case "keys": await r.keys(s.value, s); break;
      case "select": await r.select(s.target, s.value, s); break;
      case "press": await r.press(s.key, s); break;
      case "upload": await r.upload(s.target, s.file, s); break;
      case "scroll": await r.scroll(s.by ?? 600, s.steps); break;
      case "pause": await r.pause(s.ms ?? 2000); break;
      case "wait": case "expect-text": await r.waitFor({ target: s.target, text: s.text, url: s.url, timeoutMs: s.timeoutMs }); break;
      case "card": await r.card(s.kicker, s.title, s.sub, s.ms); break;
      case "uncard": await r.uncard(); break;
      case "shot": await r.shot(s.name || `step-${i + 1}`); break;
      case "signout": await r.signOut(); break;
      case "login": await login(r, s.as, ctx); break;
      case undefined: if (s.expect !== undefined || s.who !== undefined || s.say !== undefined || s.pause) break; // a check, a label or a hold on its own
      // falls through
      default: throw new Error(`${label}: unknown action "${action}"`);
    }
    if (s.expect !== undefined) await r.expectVisible(s.expect, label, s.expectTimeoutMs);
    if (s.pause) await sleep(s.pause);
    await r.checkpoint(label);
  }
}

async function login(r, userKey, ctx) {
  const user = ctx.spec.users?.[userKey];
  if (!user) throw new Error(`login: no user "${userKey}" in spec.users`);
  const how = ctx.spec.login;
  if (typeof how === "function") return how(r, user, userKey);
  if (!Array.isArray(how)) throw new Error("spec.login must be a function or a steps array");
  const steps = how.map((s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, template(v, { user, key: userKey })])));
  await runSteps(r, steps, ctx);
}

// ---- main ---------------------------------------------------------------------
const a = args(process.argv.slice(2));
if (!a._[0]) { console.error("usage: record.mjs <spec> [--only slug,...] [--out DIR] [--list] [--review-every N] [--no-voice] [--check-voice] [--voice-only] [--voice-samples] [--no-music] [--music-samples] [--remux]"); process.exit(2); }
const spec = await loadSpec(a._[0]);
const outDir = outDirOf(spec, a.out);
const takesDir = path.join(outDir, ".takes");
const reviewEvery = a.reviewEvery || spec.reviewEverySeconds || 10;

if (a.list) { for (const [i, p] of spec.paths.entries()) console.log(`${String(i + 1).padStart(2, "0")}  ${p.slug}  ${p.title}`); process.exit(0); }

const selected = spec.paths.map((p, i) => ({ p, n: i + 1 })).filter(({ p }) => !a.only || a.only.includes(p.slug));
if (a.only) for (const s of a.only) if (!spec.paths.some((p) => p.slug === s)) throw new Error(`--only: no path "${s}"`);
if (!ffmpeg()) console.log("! ffmpeg not found on PATH or in this skill's node_modules: takes stay WebM, without captions in band mode");

fs.mkdirSync(takesDir, { recursive: true });
// A bad music preset or a missing logo fails here, before anything is recorded.
for (const { p } of selected) new Recorder(spec, p, { takesDir, music: !a.noMusic });

// ---- narration ------------------------------------------------------------------
// Every line is synthesised before recording starts, so the take never waits on
// the model, and kept in .takes/.voice, so a retake reuses the same clips.
const voice = spec.voice && !a.noVoice ? new Voice(spec.voice, path.join(takesDir, ".voice")) : null;
const linesOf = (p) => [p.say, p.endSay, ...(p.steps || []).map((s) => (typeof s === "object" ? s.say ?? (s.action === "say" ? s.text : undefined) : undefined)), ...(p.lines || [])].filter((t) => typeof t === "string" && t.trim());
if (voice) {
  const lines = selected.flatMap(({ p }) => linesOf(p));
  const made = await voice.synthAll(lines, (m) => process.stdout.write(`\r  ${m}   `));
  if (made) console.log(`\r  synthesised ${made} new line${made === 1 ? "" : "s"} with ${voice.o.voice}`);
  if (a.checkVoice) {
    console.log("  reading every line back with Whisper...");
    const results = await checkClips(lines.map((t) => voice.file(t)), voice.o.checkModel, voice.o.lexicon);
    const report = results.map((x) => `${x.score.toFixed(2)}  ${x.said}\n      heard: ${x.heard}`).join("\n");
    fs.writeFileSync(path.join(takesDir, "voice-check.txt"), report + "\n");
    const doubtful = results.filter((x) => x.score < 0.9);
    console.log(`  ${results.length - doubtful.length} of ${results.length} lines read back cleanly; full report in ${path.join(takesDir, "voice-check.txt")}`);
    for (const x of doubtful) console.log(`  ? ${x.score.toFixed(2)}  ${x.said}\n           heard: ${x.heard}`);
  }
}
if (a.voiceSamples) {
  // The first path's opening line in each candidate voice, so a person can choose by ear.
  const line = linesOf(spec.paths[0])[0] || spec.paths[0].title;
  const voices = spec.voice?.samples || ["bf_emma", "bf_isabella", "bf_alice", "bf_lily", "bm_george", "bm_fable", "bm_lewis", "bm_daniel"];
  const dir = path.join(outDir, "voice-samples");
  fs.mkdirSync(dir, { recursive: true });
  for (const name of voices) {
    const v = new Voice({ ...(spec.voice || {}), voice: name }, path.join(takesDir, ".voice"));
    const clip = await v.synth(line);
    await v.dispose();
    fs.copyFileSync(clip.file, path.join(dir, `${name}.wav`));
    console.log(`  ${name}: ${path.join(dir, `${name}.wav`)}`);
  }
}
if (a.musicSamples) {
  // Half a minute of each preset with the spec's seed and level, so a person can choose by ear.
  const base = musicOptions(spec.music || true);
  const dir = path.join(outDir, "music-samples");
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const preset of Object.keys(MUSIC_PRESETS)) {
      const bed = await renderMusic(browser, { ...base, preset }, 30, path.join(takesDir, ".music"));
      const file = path.join(dir, `${preset}.wav`);
      if (ffmpeg()) execFileSync(ffmpeg(), ["-y", "-loglevel", "error", "-i", bed, "-af", "afade=t=in:st=0:d=1.5,afade=t=out:st=27:d=3", file]);
      else fs.copyFileSync(bed, file);
      console.log(`  ${preset}: ${file}  (${MUSIC_PRESETS[preset]})`);
    }
  } finally { await browser.close(); }
}
// The voice-only and sample modes end here. They return rather than call process.exit,
// because onnxruntime aborts a process that exits while its threads are alive.
const recording = !(a.voiceOnly || a.voiceSamples || a.musicSamples);
if (recording) await recordAll();

async function recordAll() {

  const manifestFile = path.join(outDir, ".manifest.json");
  const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : {};
  let failures = 0;

  for (const { p, n } of selected) {
    const r = new Recorder(spec, p, { takesDir, voice, music: !a.noMusic });
    let ok = true, error = null, res;
    if (a.remux) {
      // Re-encodes the last take of this path, for a change to the band, the fades or the audio mix.
      const takeFile = path.join(r.dir, "take.json");
      if (!fs.existsSync(takeFile)) { console.log(`! ${p.slug}: no take to remux`); continue; }
      if (JSON.parse(fs.readFileSync(takeFile, "utf8")).ok === false) { console.log(`! ${p.slug}: the last take failed, so it is not remuxed; record it again`); failures++; continue; }
      res = await r.remux();
    } else {
      await r.start();
      const ctx = { spec, slug: p.slug };
      try {
        // A path that opens with a goto loads the app under the title card, which then fades into it.
        const first = p.steps?.[0];
        const opening = first && typeof first === "object" && first.action === "goto" ? first : null;
        await r.titleCard(p.kicker ?? spec.brand ?? "", p.title, p.subtitle, p.titleMs, p.say, opening?.url);
        if (p.steps) await runSteps(r, opening ? [{ ...opening, action: "none" }, ...p.steps.slice(1)] : p.steps, ctx);
        else await p.run(r, { login: (k) => login(r, k, ctx), steps: (s) => runSteps(r, s, ctx) });
        await r.endCard(p.endTitle ?? p.title, p.summary, p.endMs, p.endSay);
      } catch (e) {
        ok = false; error = e.message.split("\n").slice(0, 3).join(" ");
        await r.page.screenshot({ path: path.join(r.dir, "failure.png") }).catch(() => {});
      }
      const onScreen = r.problems.filter((x) => x.startsWith("error on screen"));
      if (ok && onScreen.length && spec.failOnVisibleErrors !== false) { ok = false; error = onScreen.join("; "); }
      res = await r.finish({ ok });
    }
    const name = `${String(n).padStart(2, "0")} ${p.title.replace(/[\\/:*?"<>|]/g, "-")}`;
    if (!ok) {
      failures++;
      console.log(`✗ ${p.slug}: ${error}\n  raw take: ${res.raw}\n  failure screenshot: ${path.join(r.dir, "failure.png")}`);
    } else if (!res.mp4) {
      console.log(`! ${p.slug}: ${res.note}\n  raw take: ${res.raw}`);
    } else {
      const final = path.join(outDir, `${name}.mp4`);
      for (const f of fs.readdirSync(outDir)) if (f.endsWith(".mp4") && f.startsWith(String(n).padStart(2, "0") + " ")) fs.rmSync(path.join(outDir, f));
      fs.copyFileSync(res.mp4, final);
      const d = duration(final);
      const stills = reviewStills(final, r.dir, reviewEvery);
      const board = storyboard(final, r.dir, res.segments, res.cards);
      manifest[p.slug] = { n, file: path.basename(final), title: p.title, roles: p.roles || [], summary: p.summary || "", duration: d };
      console.log(`✓ ${p.slug}: ${final} (${mmss(d)})`);
      console.log(`  review stills (${stills.length}): ${path.dirname(stills[0] || r.dir)}`);
      if (board) console.log(`  storyboard, one still per card and caption: ${board}`);
      if (r.music) console.log(`  music: ${r.music.preset}, seed ${r.music.seed}, ${r.music.volumeDb} dB${r.music.duck ? ", ducked under the voice" : ""}`);
    }
    if (r.problems.length) console.log(`  noted: ${r.problems.join("\n         ")}`);
  }

  // Re-read before writing, so runs of different paths side by side (--only) keep each other's entries.
  const merged = { ...(fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : {}) };
  for (const { p } of selected) if (manifest[p.slug]) merged[p.slug] = manifest[p.slug];
  fs.writeFileSync(manifestFile, JSON.stringify(merged, null, 2));
  // The wording comes from the spec as it is now, and only the file and its length from the take.
  const entries = spec.paths.filter((p) => merged[p.slug]).map((p) => ({ ...merged[p.slug], title: p.title, roles: p.roles || [], summary: p.summary || "" })).sort((x, y) => x.n - y.n);
  const readme = [
    spec.readmeTitle || `${spec.brand ? spec.brand + " " : ""}happy-path recordings`,
    "=".repeat(40), "",
    spec.readmeIntro || "Short screen recordings of the main everyday flows, with plain-language captions. Each video opens with a title card and ends with a summary card.",
    "", ...entries.flatMap((e) => [
      `${e.file}  (${mmss(e.duration)})`,
      ...(e.roles.length ? [`   Roles: ${e.roles.join(", ")}`] : []),
      ...(e.summary ? [`   ${e.summary}`] : []), ""]),
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "README.txt"), readme);
  console.log(`\n${selected.length - failures} of ${selected.length} recorded → ${outDir}`);
  process.exitCode = failures ? 1 : 0;
}
