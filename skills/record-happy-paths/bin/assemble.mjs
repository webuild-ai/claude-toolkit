#!/usr/bin/env node
// Usage: node assemble.mjs <spec> [--out DIR] [--chapter "File name=slug1,slug2"]... [--full "File name"] [--no-full]
// Joins recorded takes into one MP4 per chapter and one full video, under
// <out>/final/. A chapter is one or more paths played in order. A part that is
// followed by another part of the same chapter is cut where its end card
// begins, with a short fade, so a chapter carries one end card and the next
// part's title card serves as its section break.
//
// Chapters come from --chapter, else from the spec's `assemble`:
//   assemble: { chapters: [{ file: "Chapter 1, Why.mp4", parts: ["why"] }, ...], full: "The whole story.mp4" }
// and with neither, every path is a chapter of its own. Reads each take's
// out.mp4 and take.json from <out>/.takes/<slug>/, so record the paths first.
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { ffmpeg, duration } from "../lib/recorder.mjs";
import { loadSpec, outDirOf, mmss } from "../lib/spec.mjs";

function args(argv) {
  const out = { _: [], chapters: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") out.out = argv[++i];
    else if (a === "--chapter") {
      const [file, parts] = argv[++i].split(/=(?=[^=]*$)/);
      out.chapters.push({ file, parts: (parts || "").split(",").map((s) => s.trim()).filter(Boolean) });
    } else if (a === "--full") out.full = argv[++i];
    else if (a === "--no-full") out.noFull = true;
    else out._.push(a);
  }
  return out;
}

const a = args(process.argv.slice(2));
if (!a._[0]) { console.error('usage: assemble.mjs <spec> [--out DIR] [--chapter "File name=slug1,slug2"]... [--full "File name"] [--no-full]'); process.exit(2); }
const bin = ffmpeg();
if (!bin) { console.error("assemble.mjs needs ffmpeg, on PATH or from this skill's npm install"); process.exit(1); }
const spec = await loadSpec(a._[0]);
const outDir = outDirOf(spec, a.out);
const takes = path.join(outDir, ".takes");
const finalDir = path.join(outDir, "final");
const safe = (name) => name.replace(/[\\/:*?"<>|]/g, "-");
const withExt = (name) => (name.toLowerCase().endsWith(".mp4") ? name : `${name}.mp4`);

const chapters = a.chapters.length ? a.chapters
  : spec.assemble?.chapters?.length ? spec.assemble.chapters
  : spec.paths.map((p, i) => ({ file: `${String(i + 1).padStart(2, "0")} ${p.title}`, parts: [p.slug] }));
for (const c of chapters) {
  if (!c.file || !c.parts?.length) throw new Error(`each chapter needs a file name and at least one part (${JSON.stringify(c)})`);
  for (const slug of c.parts) if (!spec.paths.some((p) => p.slug === slug)) throw new Error(`chapter ${c.file}: no path "${slug}" in the spec`);
}
const fullName = a.noFull ? null : a.full || spec.assemble?.full || `${spec.brand || "Happy paths"}, all chapters`;

// Where the end card starts, in seconds of the part's MP4: the last card the
// take showed, or, for a take recorded before cards were kept, the last
// point where the caption and the label were both cleared.
function endCardAt(slug) {
  const take = JSON.parse(fs.readFileSync(path.join(takes, slug, "take.json"), "utf8"));
  const t = take.cards?.length ? take.cards[take.cards.length - 1].t : [...take.timeline].reverse().find((e) => e.text === "" && e.who === "")?.t;
  if (t === undefined) throw new Error(`${slug}: no end card in take.json`);
  return t - (take.trimAt ?? 0);
}

function probe(file) {
  const info = spawnSync(bin, ["-hide_banner", "-i", file], { encoding: "utf8" }).stderr || "";
  const size = info.match(/Video:.*?(\d{2,5})x(\d{2,5})/);
  return { audio: /Audio:/.test(info), width: size ? Number(size[1]) : null, height: size ? Number(size[2]) : null };
}

// inputs: [{ file, cut? }]. A cut part ends with a short fade to black and to silence.
// A part without sound gets silence, and every part is brought to the first one's size.
function join(inputs, out) {
  const first = probe(inputs[0].file);
  const args = ["-y", "-loglevel", "error"];
  const graph = [];
  inputs.forEach((p, i) => {
    args.push("-i", p.file);
    const info = probe(p.file);
    const end = p.cut ?? duration(p.file);
    const fade = p.cut ? `,fade=t=out:st=${Math.max(0, end - 0.6).toFixed(3)}:d=0.6` : "";
    const afade = p.cut ? `,afade=t=out:st=${Math.max(0, end - 0.6).toFixed(3)}:d=0.6` : "";
    const fit = first.width && (info.width !== first.width || info.height !== first.height)
      ? `,scale=${first.width}:${first.height}:force_original_aspect_ratio=decrease,pad=${first.width}:${first.height}:(ow-iw)/2:(oh-ih)/2` : "";
    graph.push(`[${i}:v]trim=0:${end.toFixed(3)},setpts=PTS-STARTPTS,fps=25,format=yuv420p${fit}${fade}[v${i}]`);
    const src = info.audio ? `[${i}:a]atrim=0:${end.toFixed(3)},asetpts=PTS-STARTPTS,` : `anullsrc=r=48000:cl=stereo,atrim=0:${end.toFixed(3)},`;
    graph.push(`${src}aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo${afade}[a${i}]`);
  });
  graph.push(`${inputs.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${inputs.length}:v=1:a=1[v][a]`);
  args.push("-filter_complex", graph.join(";"), "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out);
  execFileSync(bin, args);
}

fs.mkdirSync(finalDir, { recursive: true });
const all = [];
for (const c of chapters) {
  const parts = c.parts.map((slug, i) => {
    const file = path.join(takes, slug, "out.mp4");
    if (!fs.existsSync(file)) throw new Error(`no take for ${slug}; record it first`);
    return { file, cut: i < c.parts.length - 1 ? endCardAt(slug) + 0.3 : undefined };
  });
  const out = path.join(finalDir, safe(withExt(c.file)));
  join(parts, out);
  all.push(...parts);
  console.log(`${path.basename(out)}  ${mmss(duration(out))}`);
}
// The full video is joined from the parts themselves, not the chapter files, so it is encoded once.
if (fullName && chapters.length > 1) {
  const out = path.join(finalDir, safe(withExt(fullName)));
  join(all, out);
  console.log(`${path.basename(out)}  ${mmss(duration(out))}`);
}
console.log(`→ ${finalDir}`);
