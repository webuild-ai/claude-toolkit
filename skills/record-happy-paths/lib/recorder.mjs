// Records one happy path of a web app as a narrated screen video: a visible
// cursor, captions, title and end cards, then an H.264 MP4. App-agnostic:
// everything about the app under test (URL, sign-in, selectors, wording) comes
// from the spec file.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync, spawnSync } from "node:child_process";
import { mixTrack } from "./voice.mjs";
import { musicOptions, renderMusic, duckFilter, MUSIC_RATE } from "./music.mjs";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DEFAULT_THEME = {
  accent: "#ef4444", // cursor dot and click ripple
  captionBg: "rgba(15,23,42,.88)", // overlay captions
  captionFg: "#ffffff",
  bandBg: "#0f172a", // the caption band under the app, a hex colour
  bandFg: "#ffffff",
  bandLabelFg: "#cbd5e1", // the "who" label at the left of the band
  cardBg: "linear-gradient(135deg,#0f172a 0%,#1e293b 55%,#334155 100%)", // any CSS background; when the spec sets it, it wins over cardColours
  cardFg: "#ffffff",
  font: 'Inter,-apple-system,"Segoe UI",Roboto,sans-serif',
  fontCss: "", // @font-face rules for `font`, so the band and the cards can use the app's own typeface
  // The card design. Left at these values, a card is the plain gradient above with centred text.
  cardColours: null, // [from, to] or [from, via, to]: a gradient between brand colours, used when cardBg is not given
  cardAngle: 135, // degrees, for cardColours
  cardTexture: "none", // "grid", "dots" or "noise", drawn faintly in cardFg over the background
  cardAccent: "", // a colour for the short rule above the kicker and for cardShape; empty for neither
  cardShape: "none", // "glow" (a soft light in one corner) or "ring" (a thin arc in one corner), in cardAccent
  cardAlign: "center", // or "left", with the text on a left margin
  kickerFg: "", // the kicker's colour; empty for cardAccent, or cardFg when there is no accent
  titleSize: 60, // px, the card title; the kicker and subtitle scale with it
  logo: "", // an image file (png, jpg, svg or webp) relative to the spec, shown on every card
  logoHeight: 56, // px
  logoPosition: "top", // "top" (above the kicker) or "corner" (the top left corner)
};

const LOGO_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };

// The logo as a data URI, since a card can sit over an http page that may not load file:// images.
function logoDataUri(file, dir) {
  if (!file) return "";
  const abs = path.resolve(dir || ".", file);
  const type = LOGO_TYPES[path.extname(abs).toLowerCase()];
  if (!type) throw new Error(`theme.logo ${file}: use a png, jpg, svg or webp image`);
  if (!fs.existsSync(abs)) throw new Error(`theme.logo ${file}: no such file next to the spec`);
  if (fs.statSync(abs).size > 2 * 1024 * 1024) throw new Error(`theme.logo ${file}: larger than 2 MB`);
  return `data:${type};base64,${fs.readFileSync(abs).toString("base64")}`;
}

// The card background: cardBg when the spec gives one, else a gradient between
// cardColours, else the neutral default.
function cardBackground(theme, given) {
  if (given?.cardBg) return given.cardBg;
  const c = theme.cardColours;
  if (Array.isArray(c) && c.length >= 2) return `linear-gradient(${Number(theme.cardAngle) || 135}deg,${c.map((x, i) => `${x} ${Math.round((i / (c.length - 1)) * 100)}%`).join(",")})`;
  return DEFAULT_THEME.cardBg;
}

// ---- tools -------------------------------------------------------------------
function which(bin) {
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    const p = path.join(dir, bin);
    if (fs.existsSync(p)) return p;
  }
  for (const p of [`/opt/homebrew/bin/${bin}`, `/usr/local/bin/${bin}`, `/usr/bin/${bin}`]) if (fs.existsSync(p)) return p;
  return null;
}

// ffmpeg on PATH first, then the static build installed with this skill, so a
// machine without Homebrew still gets MP4s.
let ffmpegPath;
export function ffmpeg() {
  if (ffmpegPath !== undefined) return ffmpegPath;
  ffmpegPath = which("ffmpeg");
  if (!ffmpegPath) {
    try {
      const p = createRequire(import.meta.url)("ffmpeg-static");
      ffmpegPath = p && fs.existsSync(p) ? p : null;
    } catch (e) { ffmpegPath = null; }
  }
  return ffmpegPath;
}

// Seconds, read from ffmpeg's own header line, so ffprobe is not needed.
export function duration(file) {
  const bin = ffmpeg();
  if (!bin) return null;
  const out = spawnSync(bin, ["-hide_banner", "-i", file], { encoding: "utf8" }).stderr || "";
  const m = out.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : null;
}

export function frameAt(mp4, seconds, file, width = 1200) {
  execFileSync(ffmpeg(), ["-y", "-loglevel", "error", "-ss", Math.max(0, seconds).toFixed(2), "-i", mp4, "-frames:v", "1", "-vf", `scale=${width}:-1`, file]);
}

// `${env:NAME}` in a typed value reads the environment, so passwords and codes
// never sit in a spec file. A missing variable is an error, not an empty string.
export function resolveValue(v) {
  if (typeof v !== "string") return v;
  return v.replace(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name) => {
    if (process.env[name] === undefined) throw new Error(`environment variable ${name} is not set`);
    return process.env[name];
  });
}

// {{user.email}}-style templating for login steps shared across users.
export function template(v, vars) {
  if (typeof v !== "string") return v;
  return v.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => {
    const val = key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), vars);
    if (val === undefined) throw new Error(`template value ${key} is not defined`);
    return String(val);
  });
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// ---- overlays ------------------------------------------------------------------
// Injected into every page before its own scripts run. Draws the cursor dot,
// the click ripple and, in overlay mode, the caption bar, and keeps the caption
// and the cursor position across navigations (sessionStorage, per origin).
// Never intercepts input: every overlay element has pointer-events:none.
function overlayScript(theme, overlayCaptions) {
  return `(() => {
  if (window.__rhpOverlay) return; window.__rhpOverlay = true;
  const T = ${JSON.stringify(theme)};
  const CAPTIONS = ${JSON.stringify(overlayCaptions)};
  const css = \`
  #rhp-cursor{position:fixed;left:-40px;top:-40px;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;
    background:\${T.accent};opacity:.88;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25),0 2px 8px rgba(0,0,0,.35);
    z-index:2147483647;pointer-events:none;transition:transform .12s ease}
  #rhp-cursor.down{transform:scale(.7)}
  .rhp-ripple{position:fixed;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:3px solid \${T.accent};
    z-index:2147483646;pointer-events:none;animation:rhp-ripple .6s ease-out forwards}
  @keyframes rhp-ripple{from{transform:scale(1);opacity:1}to{transform:scale(3.2);opacity:0}}
  #rhp-caption{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);max-width:min(1100px,86vw);padding:14px 28px;
    background:\${T.captionBg};color:\${T.captionFg};font:600 22px/1.35 \${T.font};border-radius:14px;
    box-shadow:0 8px 30px rgba(0,0,0,.3);z-index:2147483645;pointer-events:none;text-align:center;transition:opacity .3s}
  #rhp-caption:empty{opacity:0}\`;
  const store = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
                  set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const add = () => {
    if (!document.body || document.getElementById('rhp-cursor')) return;
    const st = document.createElement('style'); st.textContent = css; (document.head || document.body).appendChild(st);
    const c = document.createElement('div'); c.id = 'rhp-cursor'; document.body.appendChild(c);
    if (CAPTIONS) { const cap = document.createElement('div'); cap.id = 'rhp-caption'; document.body.appendChild(cap); cap.textContent = store.get('rhp-caption') || ''; }
    try { const p = JSON.parse(store.get('rhp-pos') || 'null'); if (p) { c.style.left = p[0] + 'px'; c.style.top = p[1] + 'px'; } } catch (e) {}
  };
  document.addEventListener('mousemove', (e) => { const c = document.getElementById('rhp-cursor'); if (!c) return;
    c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; store.set('rhp-pos', JSON.stringify([e.clientX, e.clientY])); }, true);
  document.addEventListener('mousedown', (e) => { const c = document.getElementById('rhp-cursor'); if (c) c.classList.add('down');
    const r = document.createElement('div'); r.className = 'rhp-ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
    document.body.appendChild(r); setTimeout(() => r.remove(), 700); }, true);
  document.addEventListener('mouseup', () => { const c = document.getElementById('rhp-cursor'); if (c) c.classList.remove('down'); }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
  const watch = () => { if (document.documentElement) new MutationObserver(add).observe(document.documentElement, { childList: true, subtree: true }); else setTimeout(watch, 10); };
  watch();
})();`;
}

// The caption band is two layers, the "who" label under the left edge (a second
// line, after a newline, reads as the role) and the caption beside it, so the
// label holds steady while captions change. The styles sit in a <style> block,
// as a font name in quotes would end an inline style attribute.
function bandHtml(theme, width, height, html) {
  return `<!doctype html><html><head><style>${theme.fontCss || ""}
  html,body{margin:0}
  body{width:${width}px;height:${height}px;background:transparent;font-family:${theme.font};display:flex;align-items:center;overflow:hidden}
  .who{box-sizing:border-box;width:100%;padding:0 20px 0 28px;color:${theme.bandLabelFg};font-size:14px;line-height:1.35}
  .who b{display:block;color:${theme.bandFg};font-size:16px;font-weight:600}
  .cap{box-sizing:border-box;width:100%;padding:0 40px 0 0;color:${theme.bandFg};font-size:23px;font-weight:500;line-height:1.35}
  </style></head><body>${html}</body></html>`;
}

function labelHtml(who) {
  const [name, ...role] = String(who).split("\n");
  return `<div class="who">${name ? `<b>${esc(name)}</b>` : ""}${role.length ? esc(role.join(" ")) : ""}</div>`;
}

// Runs in the page. Draws a card from the theme: the background, a faint
// texture, an accent shape and rule, the logo, then kicker, title and subtitle.
// Spec text goes in through textContent only, and the logo is a data URI.
async function buildCard({ kicker, title, sub, T }) {
  document.getElementById("rhp-card")?.remove();
  const el = (tag, css, parent) => { const d = document.createElement(tag); d.style.cssText = css; parent.appendChild(d); return d; };
  const left = T.cardAlign === "left";
  const faint = (pct) => `color-mix(in srgb, ${T.cardFg} ${pct}%, transparent)`;
  const accent = (pct) => `color-mix(in srgb, ${T.cardAccent} ${pct}%, transparent)`;
  const card = document.createElement("div");
  card.id = "rhp-card";
  card.style.cssText = `position:fixed;inset:0;z-index:2147483640;pointer-events:none;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:${left ? "flex-start" : "center"};text-align:${left ? "left" : "center"};background:${T.cardBg};color:${T.cardFg};font-family:${T.font};transition:opacity .6s;padding:0 ${left ? "9vw" : "6vw"};box-sizing:border-box;opacity:${T.fade ? 0 : 1}`;
  if (T.fontCss) { const st = document.createElement("style"); st.textContent = T.fontCss; card.appendChild(st); }
  const textures = {
    grid: `background-image:linear-gradient(${faint(7)} 1px,transparent 1px),linear-gradient(90deg,${faint(7)} 1px,transparent 1px);background-size:56px 56px`,
    dots: `background-image:radial-gradient(${faint(12)} 1.2px,transparent 1.6px);background-size:28px 28px`,
    noise: `background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");opacity:.06`,
  };
  // The texture fades towards the edges, so it reads as depth rather than a pattern.
  if (textures[T.cardTexture]) el("div", `position:absolute;inset:0;${textures[T.cardTexture]};-webkit-mask-image:radial-gradient(ellipse at 50% 45%,#000 30%,transparent 85%)`, card);
  if (T.cardAccent && T.cardShape === "glow") el("div", `position:absolute;width:1100px;height:1100px;right:-380px;top:-460px;border-radius:50%;background:radial-gradient(circle,${accent(34)} 0%,transparent 62%)`, card);
  if (T.cardAccent && T.cardShape === "ring") {
    el("div", `position:absolute;width:760px;height:760px;right:-260px;bottom:-300px;border-radius:50%;border:2px solid ${accent(45)}`, card);
    el("div", `position:absolute;width:560px;height:560px;right:-160px;bottom:-200px;border-radius:50%;border:1px solid ${accent(25)}`, card);
  }
  const body = el("div", `position:relative;display:flex;flex-direction:column;align-items:${left ? "flex-start" : "center"};max-width:${left ? 1200 : 1250}px`, card);
  if (T.logoSrc) {
    const img = document.createElement("img");
    img.src = T.logoSrc;
    img.alt = "";
    img.style.cssText = T.logoPosition === "corner"
      ? `position:absolute;left:64px;top:56px;height:${T.logoHeight}px;width:auto`
      : `height:${T.logoHeight}px;width:auto;margin-bottom:${Math.round(T.logoHeight * 0.7)}px`;
    (T.logoPosition === "corner" ? card : body).appendChild(img);
    await img.decode().catch(() => {});
  }
  const size = Number(T.titleSize) || 60;
  const line = (text, css) => { if (!text) return; const d = el("div", css, body); d.textContent = text; };
  if (T.cardAccent && kicker) el("div", `width:56px;height:4px;border-radius:2px;background:${T.cardAccent};margin-bottom:22px`, body);
  line(kicker, `font-size:${Math.round(size * 0.37)}px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;margin-bottom:22px;${T.kickerFg ? `color:${T.kickerFg}` : T.cardAccent ? `color:${T.cardAccent}` : "opacity:.75"}`);
  line(title, `font-size:${size}px;font-weight:700;letter-spacing:-.01em;margin-bottom:22px;line-height:1.1;text-wrap:balance`);
  line(sub, `font-size:${Math.round(size * 0.43)}px;opacity:.85;max-width:1050px;line-height:1.45;text-wrap:balance`);
  document.body.appendChild(card);
  // The typeface is loaded before the card shows, so it never swaps mid-fade.
  await Promise.race([document.fonts.load(`700 ${size}px ${T.font}`).catch(() => {}), new Promise((r) => setTimeout(r, 1500))]);
  if (T.fade) requestAnimationFrame(() => requestAnimationFrame(() => { card.style.opacity = "1"; }));
  const c = document.getElementById("rhp-cursor"); if (c) c.style.visibility = "hidden";
  const cap = document.getElementById("rhp-caption"); if (cap) cap.style.visibility = "hidden";
}

const hexColour = (c) => (/^#[0-9a-f]{6}$/i.test(c) ? "0x" + c.slice(1) : /^#[0-9a-f]{3}$/i.test(c) ? "0x" + c.slice(1).replace(/./g, "$&$&") : "black");

export class Recorder {
  constructor(spec, pathDef, { takesDir, voice = null, music = true }) {
    this.spec = spec;
    this.def = pathDef;
    this.base = spec.baseUrl.replace(/\/$/, "");
    this.width = spec.viewport?.width ?? 1600;
    this.height = spec.viewport?.height ?? 1000;
    this.theme = { ...DEFAULT_THEME, ...(spec.theme || {}) };
    this.theme.cardBg = cardBackground(this.theme, spec.theme);
    this.theme.logoSrc = logoDataUri(this.theme.logo, spec.__dir);
    // "band" puts captions under the app, so they never cover a toast, a
    // sticky bar or a dialog button; "overlay" draws them over the page.
    this.captionMode = spec.captions ?? "band";
    this.bandHeight = this.captionMode === "band" ? (spec.bandHeight ?? 100) : 0;
    this.labelWidth = spec.bandLabelWidth ?? 260;
    this.dir = path.join(takesDir, pathDef.slug);
    this.problems = [];
    this.trimAt = undefined;
    this.timeline = []; // { t, text, who } in seconds from the start of the raw take
    this.cards = []; // { t, kicker, title } for the storyboard
    this.current = { text: "", who: "" };
    // Every caption stays up long enough to read before the next one replaces it.
    this.msPerChar = spec.readingMsPerChar ?? 55;
    this.minCaptionMs = spec.minCaptionMs ?? 2500;
    this.shownAt = 0;
    // Narration: each line starts when its step does, and the next caption or
    // line waits until it has finished, so the video always waits for the voice.
    this.voice = voice;
    this.audio = []; // { t, file, text }
    this.voiceUntil = 0;
    this.gapMs = voice?.o.gapMs ?? 450;
    // Fades from and to black, cards that fade in and out, and captions that cross-fade.
    this.fade = spec.transitions !== false;
    // A bed of music under the voice, rendered when the take is encoded, so --remux can add or change it.
    this.music = music ? musicOptions(spec.music, pathDef.music) : null;
    this.takesDir = takesDir;
    this.ignore = (spec.ignoreRequests || []).map((p) => new RegExp(p));
  }

  // ---- lifecycle -----------------------------------------------------------
  async start() {
    fs.rmSync(this.dir, { recursive: true, force: true });
    fs.mkdirSync(this.dir, { recursive: true });
    this.browser = await chromium.launch({ slowMo: this.spec.slowMo ?? 120 });
    this.ctx = await this.browser.newContext({
      ...(this.spec.contextOptions || {}),
      viewport: { width: this.width, height: this.height },
      deviceScaleFactor: 1,
      recordVideo: { dir: this.dir, size: { width: this.width, height: this.height } },
      ...(this.def.storageState ? { storageState: this.def.storageState } : {}),
    });
    await this.ctx.addInitScript(overlayScript(this.theme, this.captionMode === "overlay"));
    this.t0 = Date.now();
    this.page = await this.ctx.newPage();
    this.page.setDefaultTimeout(this.spec.timeoutMs ?? 20000);
    const origin = /^https?:/.test(this.base) ? new URL(this.base).origin : null;
    const ignored = (line) => this.ignore.some((re) => re.test(line));
    this.page.on("response", (r) => {
      const u = r.url();
      if (r.status() < 400 || !origin || !u.startsWith(origin)) return;
      const line = `${r.status()} ${r.request().method()} ${u.slice(origin.length)}`;
      if (!ignored(line)) this.problems.push(line);
    });
    // A download through a blob or data URL ends as an aborted request, which is a success.
    this.page.on("requestfailed", (r) => {
      const f = r.failure()?.errorText || "";
      if (/^(blob|data):/.test(r.url()) && f === "net::ERR_ABORTED") return;
      const line = `request failed: ${r.url()} (${f})`;
      if (!ignored(line)) this.problems.push(line);
    });
    this.page.on("console", (m) => {
      if (m.type() !== "error") return;
      const line = "console error: " + m.text().split("\n")[0];
      if (!ignored(line)) this.problems.push(line);
    });
    this.page.on("pageerror", (e) => this.problems.push("page error: " + e.message.split("\n")[0]));
  }

  now() { return (Date.now() - this.t0) / 1000; }

  async finish({ ok }) {
    const video = this.page.video();
    const end = this.now();
    await this.ctx.close();
    const raw = path.join(this.dir, "raw.webm");
    fs.renameSync(await video.path(), raw);
    // Everything the encode needs, so --remux can rebuild the MP4 without recording again.
    fs.writeFileSync(path.join(this.dir, "take.json"), JSON.stringify({ ok, end, trimAt: this.trimAt, timeline: this.timeline, audio: this.audio, cards: this.cards }, null, 1));
    const bin = ffmpeg();
    if (!ok || !bin) {
      await this.browser.close();
      return { raw, mp4: null, ...(ok ? { note: "ffmpeg not found: kept the WebM only" } : {}) };
    }
    return this.encode(raw, end);
  }

  // Rebuilds out.mp4 from a take's raw.webm and take.json, with the current encode settings.
  async remux() {
    const take = JSON.parse(fs.readFileSync(path.join(this.dir, "take.json"), "utf8"));
    Object.assign(this, { trimAt: take.trimAt, timeline: take.timeline, audio: take.audio, cards: take.cards || [] });
    this.browser = await chromium.launch();
    return this.encode(path.join(this.dir, "raw.webm"), take.end);
  }

  async encode(raw, end) {
    const bin = ffmpeg();
    const trim = this.trimAt ?? 0;
    const length = Math.max(1, end - trim);
    const segments = this.segments(end).map((s) => ({ ...s, from: Math.max(0, s.from - trim), to: Math.max(0, s.to - trim), heldAt: s.heldAt === undefined ? undefined : Math.max(0, s.heldAt - trim) })).filter((s) => s.to - s.from >= 0.05);
    const mp4 = path.join(this.dir, "out.mp4");
    const args = ["-y", "-loglevel", "error", "-ss", String(trim), "-i", raw];
    const graph = [];
    let v = "0:v", n = 1;
    if (this.captionMode === "band") {
      // The label and the caption are separate overlays. A caption dips out and
      // the next one in, so two lines of text never sit on top of each other,
      // while a new label cross-fades over the old one.
      const layers = [
        { field: "who", x: 0, width: this.labelWidth, fadeIn: 0.35, fadeOut: 0.35, cross: true },
        { field: "text", x: this.labelWidth, width: this.width - this.labelWidth, fadeIn: 0.2, fadeOut: 0.15, cross: false },
      ].map((l) => ({ ...l, runs: this.runs(l.field, end, trim) }));
      await this.renderBand(layers);
      graph.push(`[0:v]pad=iw:ih+${this.bandHeight}:0:0:color=${hexColour(this.theme.bandBg)}[b0]`);
      v = "b0";
      let k = 0;
      for (const l of layers) {
        l.runs.forEach((r, i) => {
          const next = l.runs[i + 1];
          const joined = next && Math.abs(next.from - r.to) < 0.05;
          const dur = r.to - r.from + (l.cross && joined && this.fade ? l.fadeIn : 0);
          args.push("-loop", "1", "-framerate", "25", "-t", dur.toFixed(3), "-i", r.file);
          const out = !(l.cross && joined);
          const fades = this.fade ? `,fade=t=in:st=0:d=${l.fadeIn}:alpha=1${out ? `,fade=t=out:st=${Math.max(0, dur - l.fadeOut).toFixed(3)}:d=${l.fadeOut}:alpha=1` : ""}` : "";
          graph.push(`[${n}:v]format=rgba${fades},setpts=PTS-STARTPTS+${r.from.toFixed(3)}/TB[c${k}]`);
          graph.push(`[${v}][c${k}]overlay=${l.x}:${this.height}:eof_action=pass[b${k + 1}]`);
          v = `b${k + 1}`;
          n++;
          k++;
        });
      }
    }
    if (this.fade) {
      graph.push(`[${v}]fade=t=in:st=0:d=0.5,fade=t=out:st=${Math.max(0, length - 0.8).toFixed(3)}:d=0.8[vout]`);
      v = "vout";
    }
    let audio = false, voiceIn = null, musicIn = null;
    if (this.audio.length) {
      const track = mixTrack(this.audio.map((a) => ({ file: a.file, at: a.t - trim })), length, path.join(this.dir, "voice.wav"));
      args.push("-i", track);
      // Stereo before the loudness pass, and the format pinned again after it, as loudnorm leaves the layout open.
      graph.push(`[${n}:a]aformat=sample_fmts=fltp:channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=${MUSIC_RATE},aformat=sample_fmts=fltp:channel_layouts=stereo[vo]`);
      voiceIn = "vo";
      n++;
    }
    if (this.music) {
      // The bed is already at its level; it fades in and out with the video, more slowly than the voice.
      const bed = await renderMusic(this.browser, this.music, length, path.join(this.takesDir, ".music"));
      fs.copyFileSync(bed, path.join(this.dir, "music.wav"));
      args.push("-i", bed);
      const fadeOut = Math.min(this.music.fadeOutS, length / 3);
      graph.push(`[${n}:a]aformat=sample_fmts=fltp:channel_layouts=stereo,afade=t=in:st=0:d=${Math.min(this.music.fadeInS, length / 3).toFixed(3)},afade=t=out:st=${Math.max(0, length - fadeOut).toFixed(3)}:d=${fadeOut.toFixed(3)}[bed]`);
      musicIn = "bed";
      n++;
    }
    if (voiceIn || musicIn) {
      let mix = voiceIn || musicIn;
      if (voiceIn && musicIn) {
        // The voice keys a compressor on the bed, so the music dips while someone speaks.
        if (this.music.duck) {
          graph.push(`[vo]asplit=2[vo1][vkey]`, `[bed][vkey]${duckFilter(this.music.duck)}[ducked]`);
          graph.push(`[vo1][ducked]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95:level=false[mix]`);
        } else graph.push(`[vo][bed]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95:level=false[mix]`);
        mix = "mix";
      }
      graph.push(`[${mix}]afade=t=in:st=0:d=0.3,afade=t=out:st=${Math.max(0, length - 0.8).toFixed(3)}:d=0.8[aout]`);
      audio = true;
    }
    await this.browser.close();
    if (graph.length) args.push("-filter_complex", graph.join(";"));
    args.push("-map", v === "0:v" ? "0:v" : `[${v}]`);
    if (audio) args.push("-map", "[aout]", "-c:a", "aac", "-b:a", "192k");
    else args.push("-an");
    args.push("-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-t", length.toFixed(3), mp4);
    execFileSync(bin, args);
    const cards = this.cards.map((c) => ({ ...c, t: Math.max(0, c.t - trim) })).filter((c) => c.t < length);
    return { raw, mp4, segments, cards };
  }

  // Caption segments from the timeline: [from, to) in raw-take seconds.
  segments(end) {
    const t = this.timeline;
    return t.map((e, i) => ({ text: e.text, who: e.who, from: e.t, to: i + 1 < t.length ? t[i + 1].t : end, heldAt: e.heldAt })).filter((s) => s.text || s.who);
  }

  // Runs of one value of a timeline field ("text" or "who") in output seconds.
  runs(field, end, trim) {
    const out = [];
    this.timeline.forEach((e, i) => {
      const to = i + 1 < this.timeline.length ? this.timeline[i + 1].t : end;
      const last = out[out.length - 1];
      if (last && last.value === e[field]) last.to = to;
      else out.push({ value: e[field], from: e.t, to });
    });
    return out.filter((r) => r.value).map((r) => ({ ...r, from: Math.max(0, r.from - trim), to: Math.max(0, r.to - trim) })).filter((r) => r.to - r.from >= 0.05);
  }

  // Renders each distinct label and caption once, in the same browser, and gives every run its image.
  async renderBand(layers) {
    const out = path.join(this.dir, "band");
    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(out, { recursive: true });
    const ctx = await this.browser.newContext({ viewport: { width: this.width, height: this.bandHeight }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    let count = 0;
    for (const l of layers) {
      await page.setViewportSize({ width: l.width, height: this.bandHeight });
      const files = new Map();
      for (const r of l.runs) {
        if (!files.has(r.value)) {
          const file = path.join(out, `${l.field === "who" ? "w" : "c"}${String(++count).padStart(3, "0")}.png`);
          await page.setContent(bandHtml(this.theme, l.width, this.bandHeight, l.field === "who" ? labelHtml(r.value) : `<div class="cap">${esc(r.value)}</div>`));
          await page.evaluate(() => document.fonts.ready).catch(() => {});
          const overflow = await page.evaluate(() => document.body.scrollHeight > innerHeight + 1);
          if (overflow) this.problems.push(`${l.field === "who" ? "label" : "caption"} too long for the band: "${r.value.slice(0, 80)}..."`);
          // Transparent, so only the text is laid over the band and no box edge shows after encoding.
          await page.screenshot({ path: file, omitBackground: true });
          files.set(r.value, file);
        }
        r.file = files.get(r.value);
      }
    }
    await ctx.close();
  }

  // ---- captions and cards ----------------------------------------------------
  mark() { this.timeline.push({ t: this.now(), text: this.current.text, who: this.current.who }); }

  // Waits until the caption on screen has been up for its reading time. An
  // explicit hold (a step's `hold`) is marked, so the storyboard still for the
  // caption is taken there, before the step changes the screen.
  async holdForReading(explicit = false) {
    const text = this.current.text;
    let until = this.voiceUntil ? this.voiceUntil + this.gapMs : 0;
    if (text) until = Math.max(until, this.shownAt + Math.max(this.minCaptionMs, text.length * this.msPerChar));
    if (until > Date.now()) await sleep(until - Date.now());
    const last = this.timeline[this.timeline.length - 1];
    if (explicit && last && last.heldAt === undefined) last.heldAt = this.now();
  }

  async caption(text) {
    if ((text || "") === this.current.text) return;
    await this.holdForReading();
    this.current.text = text || "";
    this.shownAt = Date.now();
    this.mark();
    if (this.captionMode !== "overlay") return;
    await this.page.evaluate((t) => {
      try { sessionStorage.setItem("rhp-caption", t); } catch (e) {}
      const c = document.getElementById("rhp-caption"); if (c) c.textContent = t;
    }, text || "").catch(() => {});
  }

  // Speaks a line over what happens next. It starts once the line before has
  // finished, and the next caption waits for it in turn.
  async say(text) {
    if (!this.voice || !text) return;
    if (this.voiceUntil + this.gapMs > Date.now()) await sleep(this.voiceUntil + this.gapMs - Date.now());
    const clip = await this.voice.synth(text);
    this.audio.push({ t: this.now(), file: clip.file, text });
    this.voiceUntil = Date.now() + clip.duration * 1000;
  }

  // Who is acting, shown at the left of the caption band until it changes.
  async who(text) {
    this.current.who = text || "";
    this.mark();
  }

  // A full-screen card. Built with textContent, so spec text is never parsed as HTML.
  // The band stays empty while a card shows, and uncard() brings the caption back.
  async card(kicker, title, sub, ms = 4000, say = null) {
    await this.holdForReading();
    this.hidden = { ...this.current };
    this.timeline.push({ t: this.now(), text: "", who: "" });
    this.cards.push({ t: this.now(), kicker: kicker || "", title: title || "" });
    await this.page.evaluate(buildCard, { kicker: kicker || "", title: title || "", sub: sub || "", T: { ...this.theme, fade: this.fade } });
    const shown = Date.now();
    // The take starts once the first card has faded fully in.
    if (this.trimAt === undefined) this.trimAt = this.now() + 0.6;
    if (say && this.voice) { await sleep(1400); await this.say(say); }
    const until = Math.max(shown + ms, say && this.voice ? this.voiceUntil + 1000 : 0);
    if (until > Date.now()) await sleep(until - Date.now());
  }

  async uncard() {
    await this.page.evaluate(() => {
      const c = document.getElementById("rhp-card"); if (c) { c.style.opacity = "0"; setTimeout(() => c.remove(), 700); }
      const k = document.getElementById("rhp-cursor"); if (k) k.style.visibility = "visible";
      const cap = document.getElementById("rhp-caption"); if (cap) cap.style.visibility = "visible";
    }).catch(() => {});
    if (this.hidden) { this.current = this.hidden; this.hidden = null; this.shownAt = Date.now(); this.mark(); }
    await sleep(800);
  }

  // The title card. Given the address the path opens on, it loads the app first
  // and lays the card over it, so the card fades away into the app. Otherwise it
  // sits on a blank page, so the video never opens on a white flash.
  async titleCard(kicker, title, sub, ms = 4200, say = null, openUrl = null) {
    if (openUrl) await this.goto(openUrl);
    else {
      await this.page.setContent(`<html><head><style>${this.theme.fontCss || ""}</style></head><body style="margin:0;background:${this.theme.bandBg}"></body></html>`);
      await this.page.evaluate(() => document.fonts.ready).catch(() => {});
      await this.page.evaluate(overlayScript(this.theme, this.captionMode === "overlay"));
    }
    await this.card(kicker, title, sub, ms, say);
    this.hidden = null;
    if (openUrl) await this.uncard();
  }

  async endCard(title, sub, ms = 3500, say = null) {
    await this.caption("");
    this.current.who = "";
    await this.card(this.spec.brand || "", title, sub, ms, say);
  }

  // ---- actions ---------------------------------------------------------------
  // Targets: "testid=x", "text=Save", "label=Email", "placeholder=Search",
  // "role=button|Save" (role, then accessible name), otherwise a Playwright selector.
  // Text, label and role targets skip hidden matches, so a hidden copy of the same
  // words (a collapsed menu, an off-screen tooltip) is never chosen.
  // A JS spec may also pass a function, page => locator, for anything these cannot say.
  loc(target) {
    if (typeof target === "function") return target(this.page).first();
    if (typeof target !== "string") return target;
    const p = this.page;
    const [kind, ...rest] = target.split("=");
    const v = rest.join("=");
    const vis = (l) => l.filter({ visible: true }).first();
    switch (kind) {
      case "testid": return p.getByTestId(v).first();
      case "text": return vis(p.getByText(v, { exact: false }));
      case "label": return vis(p.getByLabel(v));
      case "placeholder": return p.getByPlaceholder(v).first();
      case "role": { const [role, name] = v.split("|"); return vis(p.getByRole(role, name ? { name } : {})); }
      default: return p.locator(target).first();
    }
  }

  // Scrolls smoothly until the element is in view, as a person would, instead of jumping.
  async bringIntoView(l) {
    const inView = await l.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth;
    }).catch(() => true);
    if (inView) return;
    await l.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })).catch(() => {});
    let last = null;
    for (let i = 0; i < 30; i++) {
      await sleep(80);
      const b = await l.boundingBox();
      const key = b ? `${Math.round(b.x)},${Math.round(b.y)}` : "";
      if (key === last) break;
      last = key;
    }
    await l.scrollIntoViewIfNeeded().catch(() => {});
  }

  async moveTo(target) {
    const l = this.loc(target);
    await l.waitFor({ state: "visible" });
    await this.bringIntoView(l);
    await sleep(250);
    const b = await l.boundingBox();
    if (b) await this.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 28 });
    await sleep(300);
    return l;
  }

  async click(target, opts = {}) { const l = await this.moveTo(target); await l.click(); await sleep(opts.after ?? 600); }
  async hover(target, opts = {}) { await this.moveTo(target); await sleep(opts.after ?? 900); }

  async type(target, value, opts = {}) {
    const l = await this.moveTo(target);
    await l.click();
    if (opts.clear) await l.fill("");
    await l.pressSequentially(resolveValue(value), { delay: opts.delay ?? 35 });
    await sleep(opts.after ?? 400);
  }

  // Types into whatever has focus, for a field the app focuses by itself.
  async keys(value, opts = {}) {
    await this.page.keyboard.type(resolveValue(value), { delay: opts.delay ?? 35 });
    await sleep(opts.after ?? 400);
  }

  async select(target, value, opts = {}) { const l = await this.moveTo(target); await l.selectOption(value); await sleep(opts.after ?? 600); }
  async press(key, opts = {}) { await this.page.keyboard.press(key); await sleep(opts.after ?? 500); }

  async upload(target, file, opts = {}) {
    const l = this.loc(target);
    await l.setInputFiles(path.resolve(this.spec.__dir || ".", file));
    await sleep(opts.after ?? 800);
  }

  // Absolute URLs as they are. "?query" and "#hash" resolve against baseUrl,
  // which is what a file:// app needs. Paths are appended to baseUrl.
  async goto(url) {
    const full = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url
      : /^[?#]/.test(url) ? new URL(url, this.base).href
      : this.base + (url.startsWith("/") ? url : "/" + url);
    // A page that never goes network-idle (polling, streaming) is fine, so only
    // that wait may time out. A refused connection or an error status fails the take.
    let response;
    try {
      response = await this.page.goto(full, { waitUntil: "networkidle" });
    } catch (e) {
      if (e.name !== "TimeoutError") throw e;
    }
    if (response && response.status() >= 400) throw new Error(`goto ${full}: HTTP ${response.status()}`);
    await sleep(800);
  }

  async scroll(dy, steps = 12) {
    for (let i = 0; i < steps; i++) { await this.page.mouse.wheel(0, dy / steps); await sleep(45); }
    await sleep(500);
  }

  pause(ms = 2000) { return sleep(ms); }

  async waitFor({ target, text, url, timeoutMs } = {}) {
    const timeout = timeoutMs ?? this.spec.timeoutMs ?? 20000;
    if (target) await this.loc(target).waitFor({ state: "visible", timeout });
    if (text) await this.page.getByText(text, { exact: false }).filter({ visible: true }).first().waitFor({ state: "visible", timeout });
    if (url) await this.page.waitForURL((u) => new RegExp(url).test(u.toString()), { timeout });
    await this.page.waitForLoadState("networkidle").catch(() => {});
  }

  // What a caption claims must be on screen: each entry is visible text (a
  // string, matched as a substring), a RegExp, or a { target } locator. A miss
  // fails the take, so a caption can never drift from the app unnoticed.
  async expectVisible(expected, label, timeoutMs = 5000) {
    for (const e of [].concat(expected)) {
      const l = e && typeof e === "object" && !(e instanceof RegExp) ? this.loc(e.target)
        : this.page.getByText(e, { exact: false }).filter({ visible: true }).first();
      try { await l.waitFor({ state: "visible", timeout: timeoutMs }); }
      catch (err) { throw new Error(`${label}: expected to see ${e instanceof RegExp ? e : typeof e?.target === "function" ? e.target.toString() : JSON.stringify(e.target ?? e)}`); }
    }
  }

  async signOut() {
    await this.ctx.clearCookies();
    await this.page.evaluate(() => { try { localStorage.clear(); sessionStorage.removeItem("rhp-caption"); } catch (e) {} }).catch(() => {});
    await sleep(200);
  }

  async shot(name) { await this.page.screenshot({ path: path.join(this.dir, `${name}.png`) }); }

  // Visible error UI: alert regions or toasts whose text reads like a failure.
  async visibleErrors() {
    const words = this.spec.errorWords || "error|failed|could not|couldn't|went wrong|unable to";
    return this.page.evaluate((w) => {
      const re = new RegExp(w, "i");
      const els = [...document.querySelectorAll('[role="alert"],[role="alertdialog"],[aria-live="assertive"],[data-sonner-toast],.Toastify__toast--error,[data-type="error"]')];
      return els.filter((e) => e.offsetParent !== null && re.test(e.textContent || "")).map((e) => e.textContent.trim().slice(0, 160));
    }, words).catch(() => []);
  }

  async checkpoint(label) {
    const errs = await this.visibleErrors();
    if (errs.length) this.problems.push(`error on screen at "${label}": ${errs.join(" | ")}`);
  }
}
