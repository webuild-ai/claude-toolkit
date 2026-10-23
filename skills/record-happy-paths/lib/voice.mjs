// Narration for the recorder: Kokoro text to speech (open weights, Apache 2.0)
// running locally through kokoro-js, a pronunciation lexicon, a cache of
// clips, the mix of clips into one track, and a Whisper check that reads each
// clip back, since an agent cannot listen to what it made.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { ffmpeg } from "./recorder.mjs";

const require = createRequire(import.meta.url);
const RATE = 24000; // Kokoro's sample rate, kept for every clip and the mix

export const DEFAULT_VOICE = {
  engine: "kokoro",
  model: "onnx-community/Kokoro-82M-v1.0-ONNX",
  dtype: "fp32",
  voice: "bf_emma", // the strongest British voice; bf_isabella, bm_george and bm_fable are the next best
  speed: 1.05,
  sentencePauseMs: 220, // between sentences of one line
  gapMs: 450, // silence kept between one line and the next
  lexicon: {}, // { "SKU": "S K U" }, whole words or phrases, replaced before synthesis
  checkModel: "onnx-community/whisper-small.en",
};

async function load(name) {
  const m = await import(require.resolve(name));
  return m.default && !m.KokoroTTS && !m.pipeline ? m.default : m;
}

// The Kokoro and Whisper models (about 1.3 GB) are cached outside the skill
// folder, so reinstalling or updating the skill never deletes them.
// RHP_MODEL_CACHE overrides the location.
export const MODEL_CACHE = process.env.RHP_MODEL_CACHE || path.join(os.homedir(), ".cache", "record-happy-paths", "models");
async function useModelCache() {
  const { env } = await load("@huggingface/transformers");
  fs.mkdirSync(MODEL_CACHE, { recursive: true });
  env.cacheDir = MODEL_CACHE;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Spoken form of a line: the lexicon first, longest entries first, as whole words.
export function spoken(text, lexicon = {}) {
  let out = String(text);
  for (const [from, to] of Object.entries(lexicon).sort((a, b) => b[0].length - a[0].length)) {
    out = out.replace(new RegExp(`(?<![\\w-])${escapeRe(from)}(?![\\w-])`, "g"), to);
  }
  return out;
}

// 16-bit PCM. With two channels, samples are interleaved left, right.
export function writeWav(file, samples, rate = RATE, channels = 1) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), i * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(channels, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2 * channels, 28); h.writeUInt16LE(2 * channels, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}

function readWav(file) {
  const b = fs.readFileSync(file);
  const n = (b.length - 44) / 2;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = b.readInt16LE(44 + i * 2) / 32767;
  return out;
}

// Trims near-silence at both ends, so the gap between lines is the one we choose.
function trimSilence(a, threshold = 0.004) {
  let s = 0, e = a.length - 1;
  while (s < e && Math.abs(a[s]) < threshold) s++;
  while (e > s && Math.abs(a[e]) < threshold) e--;
  return a.subarray(Math.max(0, s - RATE * 0.02), Math.min(a.length, e + RATE * 0.06));
}

export class Voice {
  constructor(options, cacheDir) {
    this.o = { ...DEFAULT_VOICE, ...(options || {}) };
    this.dir = cacheDir;
    fs.mkdirSync(this.dir, { recursive: true });
  }

  key(text) {
    const o = this.o;
    return crypto.createHash("sha1").update(JSON.stringify([o.model, o.dtype, o.voice, o.speed, o.sentencePauseMs, spoken(text, o.lexicon)])).digest("hex").slice(0, 16);
  }

  file(text) { return path.join(this.dir, `${this.key(text)}.wav`); }

  async tts() {
    if (!this._tts) {
      await useModelCache();
      const { KokoroTTS, TextSplitterStream } = await load("kokoro-js");
      this._tts = await KokoroTTS.from_pretrained(this.o.model, { dtype: this.o.dtype, device: "cpu" });
      this._Splitter = TextSplitterStream;
    }
    return this._tts;
  }

  // Synthesises a line once and keeps it, so a retake reuses the same clip.
  async synth(text) {
    const file = this.file(text);
    if (!fs.existsSync(file)) {
      const tts = await this.tts();
      // A closed splitter, as stream() given a plain string waits for more text after its last sentence.
      const sentences = new this._Splitter();
      sentences.push(spoken(text, this.o.lexicon));
      sentences.close();
      const parts = [];
      for await (const { audio } of tts.stream(sentences, { voice: this.o.voice, speed: this.o.speed })) {
        if (parts.length) parts.push(new Float32Array(Math.round((RATE * this.o.sentencePauseMs) / 1000)));
        parts.push(trimSilence(audio.audio));
      }
      const all = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
      let at = 0;
      for (const p of parts) { all.set(p, at); at += p.length; }
      writeWav(file, all);
      fs.writeFileSync(file.replace(/\.wav$/, ".txt"), text + "\n");
    }
    return { file, duration: (fs.statSync(file).size - 44) / 2 / RATE, text };
  }

  async synthAll(lines, log = () => {}) {
    const todo = [...new Set(lines.filter(Boolean))].filter((t) => !fs.existsSync(this.file(t)));
    for (const [i, t] of todo.entries()) { log(`voice ${i + 1} of ${todo.length}`); await this.synth(t); }
    await this.dispose();
    return todo.length;
  }

  // Frees the model. onnxruntime aborts the process at exit while a session is still open.
  async dispose() {
    if (this._tts) { await this._tts.model?.dispose?.(); this._tts = null; }
  }
}

// Lays each clip at its start time on one track of the given length.
export function mixTrack(clips, seconds, outFile) {
  const total = new Float32Array(Math.ceil(seconds * RATE));
  for (const c of clips) {
    const a = readWav(c.file);
    const start = Math.max(0, Math.round(c.at * RATE));
    for (let i = 0; i < a.length && start + i < total.length; i++) total[start + i] += a[i];
  }
  let peak = 0;
  for (const v of total) peak = Math.max(peak, Math.abs(v));
  if (peak > 0.98) for (let i = 0; i < total.length; i++) total[i] *= 0.98 / peak;
  writeWav(outFile, total);
  return outFile;
}

// Words for comparing a script with what Whisper heard. Whisper writes numbers
// as digits and spelled-out letters as one word, so both sides are brought to
// that form: "twenty-six" and "26" both become 26, and "S K U" becomes sku.
const UNITS = { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const ORDINALS = { first: "1", second: "2", third: "3", fourth: "4", fifth: "5", sixth: "6", seventh: "7", eighth: "8", ninth: "9", tenth: "10", twentieth: "20", thirtieth: "30" };
function normalWords(s) {
  const raw = s.toLowerCase().replace(/(\d),(?=\d{3})/g, "$1").replace(/(\d+)(st|nd|rd|th)\b/g, "$1").replace(/'s\b/g, "").replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const w = raw[i];
    if (ORDINALS[w]) { out.push(ORDINALS[w]); continue; }
    if (w in UNITS || w in TENS) {
      let total = 0, cur = 0, j = i;
      for (; j < raw.length; j++) {
        const x = raw[j];
        if (x in UNITS) cur += UNITS[x];
        else if (x in TENS) cur += TENS[x];
        else if (x === "hundred") cur *= 100;
        else if (x === "thousand") { total += cur * 1000; cur = 0; }
        else if (x === "and" && j + 1 < raw.length && (raw[j + 1] in UNITS || raw[j + 1] in TENS)) continue;
        else break;
      }
      out.push(String(total + cur));
      i = j - 1;
      continue;
    }
    // Runs of single letters, as in "o p p m", join into one word.
    if (/^[a-z]$/.test(w) && w !== "a" && raw[i + 1] && /^[a-z]$/.test(raw[i + 1])) {
      let j = i, word = "";
      while (j < raw.length && /^[a-z]$/.test(raw[j])) word += raw[j++];
      out.push(word);
      i = j - 1;
      continue;
    }
    out.push(w);
  }
  return out;
}

// Reads clips back with Whisper and compares the words with the script, so a
// mispronounced name or acronym shows up as a low score and a misheard word.
export async function checkClips(files, model = DEFAULT_VOICE.checkModel, lexicon = {}) {
  await useModelCache();
  const { pipeline } = await load("@huggingface/transformers");
  const asr = await pipeline("automatic-speech-recognition", model, { dtype: "fp32" });
  const results = [];
  for (const f of files) {
    const pcm = execFileSync(ffmpeg(), ["-loglevel", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
    const heard = (await asr(new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4))).text.trim();
    const textFile = f.replace(/\.wav$/, ".txt");
    const said = fs.existsSync(textFile) ? fs.readFileSync(textFile, "utf8").trim() : "";
    const got = new Set(normalWords(heard));
    // Scored against the line as written and as spoken, whichever Whisper's spelling matches better.
    const scored = [said, spoken(said, lexicon)].map((t) => {
      const want = normalWords(t);
      const missed = want.filter((w) => !got.has(w));
      return { score: want.length ? 1 - missed.length / want.length : 1, missed };
    }).sort((x, y) => y.score - x.score)[0];
    results.push({ file: f, said, heard, ...scored });
  }
  await asr.dispose?.();
  return results;
}
