#!/usr/bin/env node
// Usage: node align-labels.mjs <spec> <slug> [more slugs] [--out DIR]
// Moves each change of the band's person label to the moment the caption next
// changes, in a take's take.json, so a label set on the same step as a new
// caption does not appear over the previous screen while that screen's caption
// finishes. Then rebuild the video without recording again:
//   node record.mjs <spec> --remux --only <slug>,...
// The take's original timeline is kept once as take.before-align.json.
import fs from "node:fs";
import path from "node:path";
import { loadSpec, outDirOf } from "../lib/spec.mjs";

const argv = process.argv.slice(2);
const o = argv.indexOf("--out");
const out = o >= 0 ? argv.splice(o, 2)[1] : undefined;
const [specFile, ...slugs] = argv;
if (!specFile || !slugs.length) { console.error("usage: align-labels.mjs <spec> <slug> [more slugs] [--out DIR]"); process.exit(2); }
const spec = await loadSpec(specFile);
const takes = path.join(outDirOf(spec, out), ".takes");

// A label change that kept the old caption, followed later by a caption change,
// moves to that caption change; entries in between keep the old label.
function alignLabels(timeline) {
  let moved = 0;
  for (let i = 1; i < timeline.length; i++) {
    const prev = timeline[i - 1], cur = timeline[i];
    if (cur.who === prev.who || cur.text !== prev.text || !cur.text || !cur.who) continue;
    const at = timeline.findIndex((e, j) => j > i && e.text !== cur.text);
    if (at < 0) continue;
    const label = cur.who;
    for (let j = i; j < at; j++) timeline[j].who = prev.who;
    timeline[at].who = label;
    moved++;
  }
  return moved;
}

let failed = 0;
for (const slug of slugs) {
  const file = path.join(takes, slug, "take.json");
  if (!fs.existsSync(file)) { console.log(`! ${slug}: no take at ${file}`); failed++; continue; }
  const take = JSON.parse(fs.readFileSync(file, "utf8"));
  const backup = path.join(takes, slug, "take.before-align.json");
  if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  const moved = alignLabels(take.timeline);
  fs.writeFileSync(file, JSON.stringify(take, null, 1));
  console.log(`${slug}: moved ${moved} label change${moved === 1 ? "" : "s"}`);
}
if (slugs.length > failed) console.log(`now rebuild: node ${path.join(path.dirname(new URL(import.meta.url).pathname), "record.mjs")} ${specFile} --remux --only ${slugs.join(",")}`);
process.exitCode = failed ? 1 : 0;
