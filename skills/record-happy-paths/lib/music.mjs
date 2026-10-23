// Background music for the recorder: a calm instrumental bed composed with
// Tone.js (MIT) and rendered offline (Tone.Offline) in the recorder's own
// headless Chromium, so it needs no sound card, no network and no audio files.
// Tone.js is loaded from this skill's node_modules, never from a CDN. A bed is
// deterministic for a given preset, seed and length, so a remux rebuilds the
// same music, and it is cached in .takes/.music.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { writeWav } from "./voice.mjs";

const require = createRequire(import.meta.url);
export const MUSIC_RATE = 48000; // the rate of the final mix, so the bed needs no resampling
const COMPOSER_VERSION = 1; // bump when the composition changes, so cached beds are rebuilt

export const MUSIC_PRESETS = {
  "ambient-pad": "slow evolving pad chords with a few distant bell notes, at 60 bpm",
  "soft-piano": "a gentle broken-chord piano figure over a quiet pad, at 72 bpm",
  "minimal-pulse": "a soft plucked eighth-note pulse, a round sub bass and a light pad, at 100 bpm",
};

export const DEFAULT_MUSIC = {
  preset: "ambient-pad",
  volumeDb: -24, // the bed's average level before ducking, in dB of full scale (close to LUFS); the voice sits at -16
  duck: true, // dip the bed while the voice speaks
  seed: 1,
  fadeInS: 1.5,
  fadeOutS: 2.5,
};

// The spec's music, merged with a path's own (`music: false` turns it off for that path).
export function musicOptions(specMusic, pathMusic) {
  if (!specMusic || pathMusic === false) return null;
  const o = { ...DEFAULT_MUSIC, ...(specMusic === true ? {} : specMusic), ...(pathMusic && typeof pathMusic === "object" ? pathMusic : {}) };
  if (!MUSIC_PRESETS[o.preset]) throw new Error(`music preset "${o.preset}" is not one of ${Object.keys(MUSIC_PRESETS).join(", ")}`);
  if (!Number.isFinite(o.volumeDb) || o.volumeDb > -6 || o.volumeDb < -60) throw new Error("music.volumeDb must be a number between -60 and -6");
  return o;
}

// The ffmpeg sidechain settings for the duck. The voice is normalised to -16
// LUFS first, so these give a dip of roughly 8 to 12 dB under speech, and the
// slow release lets the bed rise again only in a real pause, not between words.
export function duckFilter(duck) {
  const d = { threshold: 0.03, ratio: 4, attack: 20, release: 600, ...(typeof duck === "object" ? duck : {}) };
  return `sidechaincompress=threshold=${d.threshold}:ratio=${d.ratio}:attack=${d.attack}:release=${d.release}:makeup=1`;
}

// ---- composition, run inside the page ------------------------------------------
// Self-contained, as Playwright sends its source to the page. Math.random is
// replaced with a seeded generator for the render, so Tone's own noise (the
// reverb's impulse, a noise hat) is the same on every run too.
async function composeInPage({ preset, seed, seconds, rate }) {
  const Tone = window.Tone;
  let s = seed >>> 0 || 1;
  const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const realRandom = Math.random;
  Math.random = rnd;
  try {
    const MAJOR = [0, 2, 4, 5, 7, 9, 11];
    const root = pick([48, 50, 51, 53, 55, 57]); // C, D, E flat, F, G or A
    const progression = pick([[0, 4, 5, 3], [0, 5, 3, 4], [5, 3, 0, 4], [0, 3, 5, 4], [0, 2, 3, 3]]);
    const step = (d) => root + MAJOR[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
    // Diatonic sevenths, with an added ninth on the fifth degree, which sounds calmer than a dominant seventh.
    const chord = (d) => [step(d), step(d + 2), step(d + 4), step(d + (d % 7 === 4 ? 8 : 6))];
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const pentatonic = [0, 2, 4, 7, 9].map((x) => root + 24 + x);
    const plan = {
      "ambient-pad": { bpm: 60, barsPerChord: 2 },
      "soft-piano": { bpm: 72, barsPerChord: 1 },
      "minimal-pulse": { bpm: 100, barsPerChord: 1 },
    }[preset];
    const bar = (60 / plan.bpm) * 4;

    const buffer = await Tone.Offline(async ({ transport }) => {
      transport.bpm.value = plan.bpm;
      const limiter = new Tone.Limiter(-1).toDestination();
      const master = new Tone.Gain(Tone.dbToGain(-6)).connect(limiter);
      const reverb = new Tone.Reverb({ decay: preset === "ambient-pad" ? 7 : 4, wet: preset === "ambient-pad" ? 0.55 : 0.35 }).connect(master);
      await reverb.ready;
      const filter = (type, frequency, to) => new Tone.Filter({ type, frequency, Q: 0.4 }).connect(to);

      // Every preset has the pad and the bass; the lead differs.
      const padFilter = filter("lowpass", preset === "ambient-pad" ? 1100 : 800, reverb);
      new Tone.LFO({ frequency: 0.05, min: 600, max: 1500 }).connect(padFilter.frequency).start(0);
      const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
        envelope: { attack: 2.2, decay: 1, sustain: 0.8, release: 3.5 },
      }).connect(padFilter);
      pad.volume.value = preset === "ambient-pad" ? -20 : -28;
      const bass = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.08, decay: 0.4, sustain: 0.7, release: 1.2 } }).connect(master);
      bass.volume.value = preset === "minimal-pulse" ? -14 : -20;

      let bell, piano, figure, pluck, hat;
      if (preset === "ambient-pad") {
        bell = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.02, decay: 1.6, sustain: 0, release: 1.6 } })
          .connect(new Tone.FeedbackDelay({ delayTime: 0.75, feedback: 0.35, wet: 0.3 }).connect(reverb));
        bell.volume.value = -22;
      } else if (preset === "soft-piano") {
        piano = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2, modulationIndex: 1.6,
          oscillator: { type: "sine" }, modulation: { type: "triangle" },
          envelope: { attack: 0.004, decay: 1.4, sustain: 0.05, release: 1.6 },
          modulationEnvelope: { attack: 0.004, decay: 0.5, sustain: 0, release: 0.5 },
        }).connect(filter("lowpass", 2600, reverb));
        piano.volume.value = -14;
        figure = pick([[0, 2, 1, 2, 3, 2, 1, 2], [0, 1, 2, 3, 2, 1, 2, 1]]);
      } else {
        const echo = new Tone.FeedbackDelay({ delayTime: (60 / plan.bpm) * 0.75, feedback: 0.25, wet: 0.2 }).connect(reverb);
        pluck = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "triangle" }, envelope: { attack: 0.003, decay: 0.22, sustain: 0, release: 0.25 } }).connect(filter("lowpass", 2200, echo));
        pluck.volume.value = -16;
        hat = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.04, sustain: 0 } }).connect(filter("highpass", 7000, master));
        hat.volume.value = -34;
      }

      const at = (t, fn) => transport.schedule(fn, t);
      const bars = Math.ceil(seconds / bar) + 1;
      for (let b = 0; b < bars; b++) {
        const t = b * bar;
        const notes = chord(progression[Math.floor(b / plan.barsPerChord) % progression.length]);
        // Each bar draws the same amount of randomness whatever the length, so a longer bed starts like a shorter one.
        const r = Array.from({ length: 8 }, rnd);
        if (b % plan.barsPerChord === 0) {
          const hold = bar * plan.barsPerChord;
          at(t, (time) => pad.triggerAttackRelease(notes.map(hz), hold * 0.95, time, 0.55));
          if (!pluck) at(t, (time) => bass.triggerAttackRelease(hz(notes[0] - 12), hold * 0.9, time, 0.6));
        }
        if (bell && r[0] < 0.4) at(t + Math.floor(r[3] * 4) * (bar / 4), (time) => bell.triggerAttackRelease(hz(pentatonic[Math.floor(r[1] * 5)]), 1.2, time, 0.4 + r[2] * 0.2));
        if (piano) {
          const voicing = [notes[0], notes[2], notes[1] + 12, notes[3] + 12];
          figure.forEach((k, i) => at(t + i * (bar / 8), (time) => piano.triggerAttackRelease(hz(voicing[k]), bar / 4, time, 0.32 + r[i] * 0.12)));
        }
        if (pluck) {
          [0, 2, 1, 2, 3, 2, 1, 2].forEach((k, i) => at(t + i * (bar / 8), (time) => pluck.triggerAttackRelease(hz(notes[k] + 12), bar / 8, time, 0.35 + r[i] * 0.1)));
          [0, 2].forEach((q) => at(t + q * (bar / 4), (time) => bass.triggerAttackRelease(hz(notes[0] - 12), bar / 4, time, 0.7)));
          [1, 3, 5, 7].forEach((i) => at(t + i * (bar / 8), (time) => hat.triggerAttackRelease(0.03, time, 0.5)));
        }
      }
      transport.start(0);
    }, seconds, 2, rate);
    window.__rhpMusic = buffer.toArray();
  } finally {
    Math.random = realRandom;
  }
  return window.__rhpMusic[0].length;
}

// One slice of the rendered bed as interleaved 16-bit stereo, base64, so a long
// bed crosses from the page in pieces instead of one huge evaluate result.
function sliceInPage({ from, to }) {
  const [l, r] = window.__rhpMusic;
  const out = new Int16Array((to - from) * 2);
  for (let i = from, j = 0; i < to; i++) {
    out[j++] = Math.max(-1, Math.min(1, l[i])) * 32767;
    out[j++] = Math.max(-1, Math.min(1, r[i])) * 32767;
  }
  const bytes = new Uint8Array(out.buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// Renders a bed of `seconds` and writes it as a 48 kHz stereo WAV at
// `volumeDb`, reusing the cached file when the same bed was made before.
// `browser` is a Playwright browser, the recorder's own.
export async function renderMusic(browser, options, seconds, cacheDir) {
  const o = { ...DEFAULT_MUSIC, ...options };
  const length = Math.max(1, Math.ceil(seconds * 10) / 10); // rounded up, so the bed never ends before the video
  const key = crypto.createHash("sha1").update(JSON.stringify([COMPOSER_VERSION, o.preset, o.seed, o.volumeDb, length])).digest("hex").slice(0, 16);
  fs.mkdirSync(cacheDir, { recursive: true });
  const file = path.join(cacheDir, `${o.preset}-${key}.wav`);
  if (fs.existsSync(file)) return file;

  const ctx = await browser.newContext();
  try {
    const page = await ctx.newPage();
    await page.setContent("<!doctype html><html><body></body></html>");
    await page.addScriptTag({ path: require.resolve("tone/build/Tone.js") });
    const frames = await page.evaluate(composeInPage, { preset: o.preset, seed: Number(o.seed) || 1, seconds: length, rate: MUSIC_RATE });
    const pcm = new Float32Array(frames * 2);
    const chunk = MUSIC_RATE * 10;
    for (let from = 0; from < frames; from += chunk) {
      const bytes = Buffer.from(await page.evaluate(sliceInPage, { from, to: Math.min(frames, from + chunk) }), "base64");
      const ints = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.length / 2);
      for (let i = 0; i < ints.length; i++) pcm[from * 2 + i] = ints[i] / 32767;
    }
    // To the chosen average level, measured where the bed is sounding, then kept under full scale.
    let sum = 0, n = 0, peak = 0;
    for (const v of pcm) { const a = Math.abs(v); if (a > 1e-4) { sum += v * v; n++; } if (a > peak) peak = a; }
    if (!n) throw new Error(`music preset ${o.preset} rendered silence`);
    let gain = Math.pow(10, o.volumeDb / 20) / Math.sqrt(sum / n);
    if (peak * gain > 0.95) gain = 0.95 / peak;
    for (let i = 0; i < pcm.length; i++) pcm[i] *= gain;
    writeWav(file, pcm, MUSIC_RATE, 2);
    return file;
  } finally {
    await ctx.close();
  }
}
