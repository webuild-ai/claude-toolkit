// Loading a spec and finding its output folder, shared by record.mjs and the
// scripts that work on its takes afterwards (assemble.mjs, align-labels.mjs).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function loadSpec(file) {
  const abs = path.resolve(file);
  const spec = abs.endsWith(".json") ? JSON.parse(fs.readFileSync(abs, "utf8")) : (await import(pathToFileURL(abs).href)).default;
  if (!spec?.baseUrl) throw new Error("spec needs baseUrl");
  if (!Array.isArray(spec.paths) || !spec.paths.length) throw new Error("spec needs a non-empty paths array");
  const seen = new Set();
  for (const p of spec.paths) {
    if (!p.slug || !/^[a-z0-9][a-z0-9-]*$/.test(p.slug)) throw new Error(`path slug "${p.slug}" must be lower-case letters, digits and dashes`);
    if (seen.has(p.slug)) throw new Error(`duplicate slug ${p.slug}`);
    seen.add(p.slug);
    if (!p.title) throw new Error(`path ${p.slug} needs a title`);
    if (!p.steps && typeof p.run !== "function") throw new Error(`path ${p.slug} needs steps or run()`);
  }
  spec.__dir = path.dirname(abs);
  return spec;
}

// --out wins, then the spec's out (relative to the spec), then a folder beside the spec.
export function outDirOf(spec, override) {
  return path.resolve(override || (spec.out ? path.resolve(spec.__dir, spec.out) : path.join(spec.__dir, "happy-path-recordings")));
}

export const mmss = (s) => (s == null ? "?" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`);
