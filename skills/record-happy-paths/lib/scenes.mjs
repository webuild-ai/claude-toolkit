// Scenes for things that are not a web app: a terminal session, a file, a
// short run of slides, or a pre-rendered clip (for example a Remotion render). Each is a local HTML page built from REAL captured
// output, styled from the spec's theme, and then recorded like any page
// (file:// URLs work as baseUrl or in a goto). Nothing is invented: capture
// the command's output or the file first, then build the page from it.
//
// Every value interpolated into HTML is escaped, data handed to a page script
// is JSON with "<" escaped, home folders are shown as ~, and a capture that
// looks like it holds a secret fails loudly instead of being shown.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

// ---- capture ---------------------------------------------------------------------
// Terminal colour codes out, carriage returns out, and the home folder (this
// user's, or any /Users/<name> or /home/<name>) shown as ~.
export function tidy(text, home = os.homedir()) {
  let out = String(text).replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "").replace(/\r(?!\n)/g, "\n").replace(/\r/g, "");
  if (home && home !== "/") out = out.split(home).join("~");
  // Only where a path starts (after a space, a quote, "=", ":" or file://), so a route such as #/home/list is left alone.
  return out.replace(/(?<=^|[\s"'`=:(\[,]|file:\/\/)\/(Users|home)\/[^/\s"'`]+/gm, "~");
}

// Shapes of common credentials. A match is a reason to stop and look, not to redact and carry on.
export const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{20,}/, /AKIA[0-9A-Z]{16}/, /ASIA[0-9A-Z]{16}/, /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
  /gh[pousr]_[A-Za-z0-9]{30,}/, /xox[abposr]-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b[A-Z0-9_]*(SECRET|TOKEN|PASSWORD|API_KEY|PRIVATE_KEY)[A-Z0-9_]*\s*[=:]\s*["']?[^\s"'$<>{}]{6,}/,
];

export function findSecrets(text) {
  return SECRET_PATTERNS.filter((re) => re.test(text)).map((re) => re.source);
}

// Throws when the text, a file or any file under a folder looks like it holds a secret.
export function assertNoSecrets(target, label = "captured text") {
  const check = (text, where) => {
    const hits = findSecrets(text);
    if (hits.length) throw new Error(`${where} looks like it holds a secret (${hits.join(", ")}); stop and inspect it before recording`);
  };
  if (typeof target === "string" && fs.existsSync(target)) {
    const walk = (p) => fs.statSync(p).isDirectory() ? fs.readdirSync(p).forEach((f) => walk(path.join(p, f))) : check(fs.readFileSync(p, "utf8"), p);
    walk(target);
  } else check(String(target), label);
}

// Runs one read-only command and keeps its real output, tidied and checked,
// in `file`. Never point this at a command that changes anything: a recording
// is a replay of what happened, not the moment it happens.
export function capture({ cmd, args = [], cwd, file, timeoutMs = 120000, env, allowFailure = false }) {
  const r = spawnSync(cmd, args, { cwd, env: env ? { ...process.env, ...env } : process.env, encoding: "utf8", timeout: timeoutMs, maxBuffer: 1 << 26 });
  if (r.error) throw new Error(`${cmd}: ${r.error.code === "ETIMEDOUT" ? `timed out after ${timeoutMs} ms` : r.error.message}`);
  if (r.status !== 0 && !allowFailure) throw new Error(`${cmd} ${args.join(" ")} exited with ${r.status}; pass allowFailure to keep a failing run's output`);
  const text = tidy((r.stdout || "") + (r.stderr || ""));
  assertNoSecrets(text, `output of ${cmd}`);
  if (file) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
  return text;
}

// Reads a captured file, tidied and checked, for a file viewer.
export function readCaptured(file) {
  const text = tidy(fs.readFileSync(file, "utf8"));
  assertNoSecrets(text, file);
  return text;
}

// ---- look ------------------------------------------------------------------------
// Neutral by default. A spec's theme can set the scene colours directly, and
// otherwise its accent comes from cardAccent, so the scenes match the cards.
const SCENE_DEFAULTS = {
  sceneBg: "#f4f4f5", sceneFg: "#18181b", sceneMuted: "#52525b", scenePanel: "#ffffff", sceneLine: "#d4d4d8",
  sceneAccent: "", termBg: "#18181b", termFg: "#e4e4e7", termBar: "#27272a",
  mono: 'ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace',
};

export function sceneTheme(theme = {}) {
  const t = { ...SCENE_DEFAULTS, font: 'Inter,-apple-system,"Segoe UI",Roboto,sans-serif', fontCss: "", ...theme };
  t.sceneAccent = t.sceneAccent || t.cardAccent || "#2563eb";
  return t;
}

export function sceneCss(theme = {}) {
  const t = sceneTheme(theme);
  return `${t.fontCss || ""}
:root{--bg:${t.sceneBg};--fg:${t.sceneFg};--muted:${t.sceneMuted};--panel:${t.scenePanel};--line:${t.sceneLine};--accent:${t.sceneAccent};
  --term-bg:${t.termBg};--term-fg:${t.termFg};--term-bar:${t.termBar};--font:${t.font};--mono:${t.mono}}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--font)}
body{min-height:100vh}
.wrap{max-width:1600px;padding:64px 96px}
.kicker{font-size:18px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:14px}
h1{font-size:52px;line-height:1.12;margin:0 0 18px;font-weight:700;letter-spacing:-.01em;max-width:1300px}
p.lead{font-size:24px;line-height:1.5;color:var(--muted);max-width:1250px;margin:0 0 30px}
.banner{display:inline-block;background:color-mix(in srgb,var(--accent) 12%,var(--panel));color:var(--fg);border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);border-radius:12px;padding:10px 18px;font-size:18px;font-weight:600;margin-bottom:20px}
.window{background:var(--term-bg);border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.22);overflow:hidden}
.window .bar{display:flex;align-items:center;gap:9px;padding:14px 18px;background:var(--term-bar);color:color-mix(in srgb,var(--term-fg) 65%,transparent);font:500 16px var(--mono)}
.window .bar i{width:13px;height:13px;border-radius:50%;display:inline-block;background:color-mix(in srgb,var(--term-fg) 30%,transparent)}
.window .bar span{margin-left:12px}
pre.term{margin:0;padding:22px 26px 30px;color:var(--term-fg);font:17px/1.62 var(--mono);white-space:pre-wrap;overflow:hidden;min-height:300px}
pre.term .prompt{color:var(--accent)} pre.term .cmd{font-weight:600}
pre.term .ok{color:#4ade80} pre.term .warn{color:#fbbf24} pre.term .bad{color:#f87171} pre.term .dim{opacity:.6}
pre.term .hl{background:color-mix(in srgb,var(--accent) 25%,transparent)}
.lines{padding:16px 0 30px;color:var(--term-fg);font:16px/1.6 var(--mono)}
.lines div{white-space:pre;padding:0 24px 0 0}
.lines div b{display:inline-block;width:60px;text-align:right;margin-right:22px;opacity:.45;font-weight:400}
.lines div.hl{background:color-mix(in srgb,var(--accent) 18%,transparent);box-shadow:inset 4px 0 0 var(--accent)}
.lines .c{opacity:.6} .lines .s{color:#86efac}
.grid{display:grid;gap:24px;margin-top:10px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:26px 30px}
.card h3{margin:0 0 10px;font-size:24px;font-weight:600} .card p{margin:0;font-size:19px;line-height:1.5;color:var(--muted)}
.card .big{font-size:56px;font-weight:700;color:var(--accent);line-height:1;margin-bottom:10px}
.slide{display:none;opacity:0;transition:opacity .45s} .slide.on{display:block} .slide.vis{opacity:1}
.step{opacity:0;transform:translateY(12px);transition:opacity .5s,transform .5s} .step.shown{opacity:1;transform:none}
.step.shown.now{border-color:var(--accent);box-shadow:0 10px 30px color-mix(in srgb,var(--accent) 18%,transparent)}`;
}

export function page({ title, body, theme, css = "", script = "", width = 1600 }) {
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=${width}">
<title>${esc(title)}</title><style>${sceneCss(theme)}${css}</style></head><body>${body}${script ? `<script>${script}</script>` : ""}</body></html>`;
}

const header = ({ heading, sub, banner }) => `${heading ? `<div class="kicker">${esc(heading)}</div>` : ""}${sub ? `<p class="lead">${esc(sub)}</p>` : ""}${banner ? `<div class="banner" id="banner">${esc(banner)}</div>` : ""}`;

// ---- terminal --------------------------------------------------------------------
// A terminal replay. The prompt shows at once; the command types out and the
// captured output appears line by line only once the address ends in #go, so a
// title card can sit over the page first and the replay starts as it fades.
// Lines get ids line1, line2 and so on for hovering, and body[data-done] is
// set when the last line is out, for a `wait` step.
// classify(line) returns a class for a line: "ok", "warn", "bad", "dim" or "hl".
export function terminalPage({ title, cmd, output, prompt = "$ ", lineMs = 80, typeMs = 38, heading, sub, banner, classify = () => "", fontPx = 17, theme }) {
  const lines = tidy(output).replace(/\s+$/, "").split("\n");
  assertNoSecrets([cmd, ...lines].join("\n"), `terminal page ${title}`);
  const data = json({ prompt, cmd, lines: lines.map((t) => ({ t, c: classify(t) || "" })), lineMs, typeMs });
  const body = `<div class="wrap">${header({ heading, sub, banner })}
<div class="window"><div class="bar"><i></i><i></i><i></i><span>${esc(title)}</span></div><pre class="term" id="term" style="font-size:${Number(fontPx) || 17}px"></pre></div></div>`;
  const script = `const D = ${data};
const term = document.getElementById("term");
const add = (cls, text) => { const s = document.createElement("span"); if (cls) s.className = cls; s.textContent = text; term.appendChild(s); return s; };
add("prompt", D.prompt);
const c = add("cmd", "");
let i = 0, started = false;
function run() { if (started || location.hash !== "#go") return; started = true;
  const typer = setInterval(() => { c.textContent = D.cmd.slice(0, ++i); if (i >= D.cmd.length) { clearInterval(typer); setTimeout(out, 450); } }, D.typeMs); }
function out() { add("", "\\n"); let k = 0; const t = setInterval(() => { if (k >= D.lines.length) { clearInterval(t); document.body.dataset.done = "1"; return; }
  const l = D.lines[k++]; add(l.c, l.t + "\\n").id = "line" + k; }, D.lineMs); }
addEventListener("hashchange", run); run();`;
  return page({ title, body, theme, script });
}

// ---- file viewer -----------------------------------------------------------------
// A read-only file with line numbers (ids L1, L2 and so on), comments dimmed,
// quoted strings coloured and the lines matching `highlight` (a RegExp or a
// function of the line) marked.
export function fileViewerPage({ title, text, highlight = null, heading, sub, banner, comment = /^\s*(#|\/\/|--|;)/, theme }) {
  const lines = tidy(text).replace(/\s+$/, "").split("\n");
  assertNoSecrets(lines.join("\n"), `file page ${title}`);
  const marked = (l) => (typeof highlight === "function" ? highlight(l) : highlight instanceof RegExp ? highlight.test(l) : false);
  const colour = (l) => (comment.test(l) ? `<span class="c">${esc(l)}</span>` : l.split(/("[^"]*")/).map((p, i) => (i % 2 ? `<span class="s">${esc(p)}</span>` : esc(p))).join(""));
  const rows = lines.map((l, i) => `<div id="L${i + 1}"${marked(l) ? ' class="hl"' : ""}><b>${i + 1}</b>${colour(l)}</div>`).join("");
  const body = `<div class="wrap">${header({ heading, sub, banner })}
<div class="window"><div class="bar"><i></i><i></i><i></i><span>${esc(title)}</span></div><div class="lines">${rows}</div></div></div>`;
  return page({ title, body, theme });
}

// ---- slides ----------------------------------------------------------------------
// One slide at a time, chosen by the address: #intro shows the slide with id
// "intro" and all its steps, #intro.2 its first two, so a spec reveals a slide
// step by step with gotos. Steps get ids <slide>-1, <slide>-2 and so on, and the
// newest shown step is outlined in the accent colour.
// A slide is { id, kicker?, title, lead?, steps?: [string | { big?, title?, text? }], columns? }.
// Text is escaped. `html` on a slide is inserted as it is, for the spec's own trusted markup only.
export function slidesPage({ title, slides, theme }) {
  const ids = new Set();
  const body = slides.map((s) => {
    if (!s.id || !/^[a-z0-9][a-z0-9-]*$/i.test(s.id) || ids.has(s.id)) throw new Error(`slide id "${s.id}" must be unique letters, digits and dashes`);
    ids.add(s.id);
    const steps = (s.steps || []).map((x, i) => {
      const st = typeof x === "string" ? { text: x } : x;
      return `<div class="card step" id="${esc(s.id)}-${i + 1}">${st.big ? `<div class="big">${esc(st.big)}</div>` : ""}${st.title ? `<h3>${esc(st.title)}</h3>` : ""}${st.text ? `<p>${esc(st.text)}</p>` : ""}</div>`;
    }).join("");
    const cols = s.columns || Math.min(Math.max(1, (s.steps || []).length), 4);
    return `<section class="slide wrap" id="${esc(s.id)}">${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}<h1>${esc(s.title || "")}</h1>${s.lead ? `<p class="lead">${esc(s.lead)}</p>` : ""}${s.html || ""}${steps ? `<div class="grid" style="grid-template-columns:repeat(${cols},1fr)">${steps}</div>` : ""}</section>`;
  }).join("");
  const script = `let current = null;
function show() {
  const [id, n] = decodeURIComponent(location.hash.slice(1)).split(".");
  const s = document.getElementById(id) || document.querySelector(".slide");
  if (current !== s) {
    document.querySelectorAll(".slide").forEach((x) => x.classList.remove("on", "vis"));
    s.classList.add("on");
    requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add("vis")));
    current = s;
  }
  const steps = [...s.querySelectorAll(".step")];
  const count = n === undefined ? steps.length : Number(n);
  steps.forEach((x, i) => { x.classList.toggle("shown", i < count); x.classList.toggle("now", n !== undefined && i === count - 1); });
}
addEventListener("hashchange", show);
show();`;
  return page({ title, body, theme, script });
}

// ---- clip -------------------------------------------------------------------------
// A pre-rendered video shown full screen, such as a motion-graphics slide made
// with Remotion in the user's project. `src` is the clip's file name in the
// same folder as the page. It shows its first frame until the address ends in
// #go, then plays once, and body[data-done] is set when it ends. A clip that
// cannot be played shows an alert, so the take fails instead of recording a
// blank screen. WebM (VP9) is the safest format, and H.264 MP4 also plays in
// the Chromium that Playwright installs.
export function clipPage({ title, src, fit = "contain", theme }) {
  if (!/^[\w.-]+\.(webm|mp4)$/i.test(String(src)) || String(src).startsWith(".")) throw new Error(`clip src "${src}" must be a .webm or .mp4 file name in the page's folder`);
  if (!["contain", "cover"].includes(fit)) throw new Error('clip fit must be "contain" or "cover"');
  const css = `body{margin:0;overflow:hidden}video{position:fixed;inset:0;width:100vw;height:100vh;object-fit:${fit};background:inherit}
#clip-error{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);font-size:28px}`;
  const body = `<video id="clip" src="${esc(src)}" muted playsinline preload="auto"></video>`;
  const script = `const v = document.getElementById("clip");
function fail() {
  const d = document.createElement("div"); d.id = "clip-error"; d.setAttribute("role", "alert");
  d.textContent = "The clip could not be played (" + (v.error ? v.error.code : "unknown") + "). Check the file, or render it as WebM (VP9).";
  document.body.appendChild(d);
}
v.addEventListener("error", fail);
v.addEventListener("ended", () => { document.body.dataset.done = "1"; });
function run() { if (location.hash === "#go" && v.paused && !v.ended) v.play().catch(fail); }
addEventListener("hashchange", run);
run();`;
  return page({ title, body, theme, css, script });
}

// ---- writing ---------------------------------------------------------------------
// Writes { "name.html": html } into dir and returns a function giving each page's file:// URL.
export function writeScenes(dir, pages) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, html] of Object.entries(pages)) fs.writeFileSync(path.join(dir, name), html);
  return sceneUrl(dir);
}

export const sceneUrl = (dir) => (name, hash = "") => pathToFileURL(path.join(dir, name)).href + (hash ? `#${hash}` : "");
