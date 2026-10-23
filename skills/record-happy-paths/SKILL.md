---
name: record-happy-paths
description: Record a web app's happy paths as polished, captioned and optionally narrated screen videos (MP4) for demos and stakeholders, with a visible cursor and click ripples, a caption band under the app that names who is acting, a voice-over from a local open-weight text-to-speech model (Kokoro, with British and American voices), smooth fades between cards, captions and scenes, optional background music ducked under the voice (Tone.js, rendered offline), branded title, mid and end cards, a storyboard of one still per card and caption and a README index. App-agnostic, so the app's URL, users or personas, sign-in and selectors live in a spec file. Works for served apps, for single-file apps opened from file:// that keep their state in the browser, and for things that are not web apps (terminal replays, file viewers and slides built as local pages from real captured output, plus pre-rendered clips such as motion-graphics slides made with Remotion, which the user installs separately when needed), and joins takes into chapters. Use when the user asks to record demo videos, screen recordings or walkthroughs of an app's main flows or journeys, to add a voice-over or narration to them, or invokes /record-happy-paths.
---

# /record-happy-paths

Turn an app's main everyday flows into short demo videos that a non-technical audience can follow. The recorder drives a real Chromium through Playwright, injects the cursor into every page so it is part of what is recorded, and converts each take to an H.264 MP4 with the captions laid into a band beneath the app and, when the spec has a voice, a narration track spoken by a local text-to-speech model.

Keep this skill generic and never write the name of a specific app, company or product into its files. App-specific content belongs in the spec file in the user's project. Before writing a new spec, look for an existing one (`*.happy-paths.mjs`) and start from it.

## What you produce

For each happy path, `NN <Title>.mp4` in the output folder, plus `README.txt` listing every video with its length, the roles shown and a one-line summary.

- Each video opens on a title card (kicker, title, subtitle) and ends on a summary card, with no blank lead-in.
- A cursor dot glides to each control, scrolls smoothly to anything off screen and ripples on click.
- Captions sit in a band under the app, so they never cover a toast, a sticky bar or a dialog button, with the acting person or role at the left of the band.
- Every caption stays up long enough to read before the next one replaces it, and with narration the video waits for each spoken line to finish, so the voice and the screen never drift apart.
- The video fades in from black, the title card dissolves into the app, captions dip out and in while the person label holds steady, and the end card fades to black with the voice.
- When the spec has `music`, a calm instrumental bed plays under the narration, dips while the voice speaks and fades in and out with the video.

Each take also leaves, under `<out>/.takes/<slug>/`, a `storyboard/` folder with one still per card (once it has faded in) and one per caption (taken just before the caption changes), with a `storyboard.txt` index, plus `review/` stills every 10 seconds from the title card on.

## Setup (once per machine)

The skill lives either in the project (`.claude/skills/record-happy-paths`) or in `~/.claude/skills/record-happy-paths`. The commands below call that folder `<skill>`.

```bash
cd <skill> && npm install && npx playwright install chromium
```

`npm install` also brings a static ffmpeg build (`ffmpeg-static`), so Homebrew is not needed, and an `ffmpeg` already on PATH is used first when there is one. If npm reports that it skipped the install script of `ffmpeg-static`, run `npm approve-scripts ffmpeg-static` and then `npm rebuild ffmpeg-static`. Without any ffmpeg the recorder keeps the raw WebM, without captions, and says so.

Music uses Tone.js (MIT), pinned in `package.json` and installed by the same `npm install`. It is loaded into the recorder's own headless Chromium from `node_modules` and rendered offline, so it needs no CDN, no network and no sound card.

Narration uses `kokoro-js`, installed by the same `npm install`. The first narrated run downloads the Kokoro model (about 330 MB) from Hugging Face, and the first `--check-voice` run downloads a Whisper model (about 1 GB), both once per machine. The models are cached in `~/.cache/record-happy-paths/models` (or `RHP_MODEL_CACHE`), outside the skill folder, so reinstalling or updating the skill keeps them. npm may report skipped install scripts for `sharp` and `protobufjs`, which narration does not need.

## How to run a request

1. **Agree the target and the paths.** Ask, or infer from the request, which app to record. Use a local or disposable environment, never production data unless the user explicitly says so, because recording creates real records in a served target. An app opened from `file://` that keeps its state in the browser needs no server, and a seed or reset address (for example `?reset=1`) gives every take a clean start. Aim for one video per flow or journey a user would recognise, of one to four minutes each, rather than a page tour.
2. **Learn the app before scripting.** The project's own end-to-end tests are the best source of stable selectors and of the numbers each screen should show, and a demo script, when there is one, is the source of the story and the wording. Prefer `data-testid`, then roles and labels, then text. Open the app and dump each screen's text to check what the captions will claim. Note which users or personas each path needs and what data must already exist.
3. **Write the spec** next to the project, never inside this skill, starting from `examples/paths.example.mjs`. The spec holds `baseUrl`, `brand`, `out` (relative to the spec), `users`, `login` (a steps array templated with `{{user.*}}`, or a function), `ignoreRequests`, optionally `voice`, `music`, `theme` and `assemble`, and `paths`, each with `slug`, `title`, `subtitle`, `roles`, `summary` and either `steps` or `run(r, { login, steps })`.
   - Secrets are never written into a spec. Use `${env:NAME}` in a typed value and pass the variable when running.
   - The project's data rules come first. When it requires synthetic data, use only its seed values and invent no personal data. Otherwise the content must suit the app's domain, never "test", "foo" or lorem ipsum, and upload files must be real documents, generated (for example with Playwright's `page.pdf`) when the user has none.
   - Captions are plain language for someone who has never seen the app, in the present tense ("The manager approves the refund"), one on each meaningful step rather than on every click. Follow the project's copy rules, such as UK English, sentence case or no em and en dashes, and keep each caption to two lines of the band, about 170 characters.
   - Give every caption that states a number, a label or a result an `expect` naming what must be on screen, so a later UI change fails the take instead of shipping a video whose captions are untrue.
   - End each path on the result, such as the saved record, the confirmation or the updated list.
4. **Record.** Run `node <skill>/bin/record.mjs <spec> [--only slug,...] [--out DIR]`, or `--list` to see the paths. Separate runs with different `--only` paths can record side by side and share the output folder. A take fails, and is not converted, when a step throws, when an `expect` is not met or when error UI is visible on screen. Failing requests, console errors and page errors are reported under `noted:`, so decide for each whether it is real or belongs in `ignoreRequests`.
5. **Watch every video before calling it done.** Read the storyboard stills with the Read tool, checking each card still for its design and each caption still against its caption in `storyboard.txt`. Re-record any take where the caption does not match the screen at the end of its segment, where what the caption names is scrolled out of view or gone before it could be read, where the person label is wrong, or where an error message, a stuck spinner or leftover data from an earlier take shows. Never ship a video showing an error.
6. **Report.** List the files with their lengths and roles. Name anything you skipped and why, the real app bugs you hit on a happy path (page, step, what happened) and how you routed around them, and any records the retakes left in a served target, without deleting anything unasked.

## Narration

Give the spec a `voice` and each captioned step a `say`, the spoken line that goes with its caption. A path may also have `say`, spoken over its title card, and `endSay`, spoken over its end card.

```js
voice: {
  voice: "bf_emma",          // Kokoro voice; the "b" voices are British, the "a" voices American
  speed: 1.05,               // a touch brisker than 1.0 sounds livelier without rushing
  lexicon: { SKU: "S K U", SQL: "S Q L" }, // spoken forms, replaced as whole words before synthesis
},
```

- Every line in declarative steps (and a path's `say` and `endSay`) is synthesised before the browser starts and cached in `<out>/.takes/.voice`, so a take never waits on the model and a retake reuses the same clips. A `run()` path should list the lines it speaks in the path's `lines` array so they are synthesised in advance too; a line that is not listed is synthesised during the take. A step's line starts as the step does, and the next caption or line waits until it has finished, plus `gapMs` (450 ms by default). Title and end cards stay up until their line has finished.
- The voice is the spec's choice and nothing in this skill assumes one. `bf_emma` is only the default when the spec names none. Of Kokoro's British voices it is graded best, then `bf_isabella`, `bm_george` and `bm_fable`, and `bm_lewis` and `bm_daniel` are other male options. Unless the person has named a voice for this project, render `--voice-samples` (the first line the first path speaks, its `say` or else its `endSay`, in each British voice, or in the voices listed in `voice.samples`, into `<out>/voice-samples/`) and let them choose by ear, and never carry one person's or project's choice over to another. `--no-voice` records a silent take.
- Write the spoken line for the ear rather than copying the caption. Keep it conversational, a little warmer than the caption and about the same length (15 to 30 words), since the video waits for the voice and longer lines make a longer video. Spell out what a voice would stumble on, such as codes ("order ten forty-four" for `ORD-1044`), email addresses and dates ("the third of November"), and put acronyms that should be read letter by letter in the lexicon.
- You cannot listen to the result, so check it by reading it back. `--check-voice` transcribes every line with Whisper, compares the words with the script (numbers and spelled-out letters are normalised on both sides) and lists any line that scores under 0.9 with what was heard. `--voice-only` does the synthesis and the check without recording, so the narration can be tuned quickly. A low score with a sensible transcript is a spelling difference, while a garbled word is a pronunciation to fix in the line or the lexicon.
- Check the timing of a take from its `take.json`, which holds each line's start, against the caption timeline.

## Music

Give the spec a `music` to lay a calm instrumental bed under the narration. It is composed with Tone.js and rendered offline in the recorder's own headless Chromium, sized to each take's length, then mixed under the voice in the same ffmpeg pass that encodes the video.

```js
music: {
  preset: "ambient-pad", // or "soft-piano" or "minimal-pulse"
  volumeDb: -24,         // the bed's average level before ducking, in dB of full scale; the voice sits at -16 LUFS
  duck: true,            // dip the bed under the voice (about 10 dB), or false for a steady bed
  seed: 1,               // a different seed gives a different key, progression and figure
},
```

- `ambient-pad` is slow pad chords with a few distant bell notes, `soft-piano` a gentle broken-chord figure over a quiet pad, and `minimal-pulse` a soft plucked pulse with a round sub bass and a light hat. All three use calm diatonic progressions in a major key chosen by the seed.
- A bed is the same for a given preset, seed, level and length (the notes are identical and only rounding in the last bit of a sample can vary), and it is cached in `<out>/.takes/.music`, so `--remux` rebuilds the same music and a change to `music` needs only `--remux`, never a new recording. Each take keeps its unducked bed as `music.wav` beside `voice.wav`.
- The duck is ffmpeg's `sidechaincompress`, keyed by the narration, with a fast attack and a slow release so the bed rises again only in a real pause, not between words. `duck` also takes `{ threshold, ratio, attack, release }` to tune it.
- A path can set its own `music` (merged over the spec's, for example another seed) or `music: false` to go without. `--no-music` turns it off for a run, and `--music-samples` renders half a minute of each preset, with the spec's seed and level, into `<out>/music-samples/` so the person can choose by ear.
- You cannot hear the mix, so measure it. Decode the MP4's audio with ffmpeg and compare the level of a voiceless gap with a spoken stretch, against a `--remux --no-music` copy of the same take. In a gap the music should sit at about `volumeDb`, and under speech it should be several dB lower than the bed in `music.wav` at the same moment.
- Keep the bed quiet and calm. It should never compete with the voice, and a silent take (`--no-voice`) with music is a good way to check the level on its own.

## Cards and branding

Title, mid (`card` steps) and end cards are drawn from the spec's `theme`. Left unset, a card is a plain dark gradient with centred white text, which suits any app and is the right choice when the demo is not for a particular brand.

```js
theme: {
  cardColours: ["#1e1b4b", "#0f172a"], // a gradient between brand colours; end it in bandBg so the card runs into the band
  cardAngle: 135,
  cardTexture: "grid",   // "grid", "dots" or "noise", faint and fading towards the edges; "none" by default
  cardAccent: "#38bdf8", // a short rule above the kicker, the kicker's colour and cardShape
  cardShape: "glow",     // "glow" (soft light in one corner) or "ring" (a thin arc in one corner)
  cardAlign: "left",     // or "center", the default
  logo: "brand/logo.svg", // png, jpg, svg or webp, relative to the spec, up to 2 MB
  logoHeight: 56, logoPosition: "top", // or "corner"
  titleSize: 60, kickerFg: "",
  font: '"Brand Sans",-apple-system,"Segoe UI",Roboto,sans-serif',
  fontCss: "@font-face{font-family:'Brand Sans';src:url(data:font/woff2;base64,...) format('woff2');font-weight:100 900}",
},
```

- When the demo is for the target app's own brand, derive the theme from the app rather than inventing one. Read its CSS custom properties (`getComputedStyle(document.documentElement)` on a loaded page lists them), its brand or design tokens file, the fonts it embeds (an `@font-face` rule, a font file in its assets, or the Google Fonts link it loads) and its logo (the header image, an SVG in its assets or the favicon at a larger size). Take the background colours for `cardColours` and `bandBg` from its darkest surface tones, `cardAccent` from its primary colour, and `font` and `fontCss` from its typeface, then check the title card still for contrast.
- Keep it tasteful. Use one accent, at most one texture and one shape, and let the title carry the card. When no brand is given, stay neutral and leave the card fields unset.
- `cardBg`, when the spec sets it, is any CSS background and wins over `cardColours`. The logo is embedded as a data URI, so it shows over a served app's page too.

## Scenes that are not a web app

A command line tool, a configuration file or a short explanation can be recorded too, as local HTML pages built from real captured output and recorded like any other page. `lib/scenes.mjs` has small helpers for this, styled from the same `theme` as the cards.

1. **Capture first.** Copy or run only what is read-only, with `capture({ cmd, args, cwd, file, timeoutMs })`, which keeps the real output, strips terminal colour codes, shows home folders as `~` and throws when anything looks like a secret. `readCaptured(file)` does the same for a file. Never re-run a command that changes anything for the sake of a recording, and never invent output. When a step cannot be re-run, show it from the captured or generated artefact and say so on the page with `banner`.
2. **Build the pages** in a small script in the project (for example `tools/build-scenes.mjs`), importing the spec for its theme. `terminalPage({ title, cmd, output, prompt, lineMs, classify })` types the command and prints the output line by line only once the address ends in `#go`, so the title card can sit over the page first. `fileViewerPage({ title, text, highlight })` shows a file with line numbers (ids `L1`, `L2` and so on) and marked lines. `slidesPage({ title, slides })` shows one slide at a time chosen by the hash, `#intro` with all its steps and `#intro.2` with the first two, so a run of gotos reveals it step by step. `writeScenes(dir, { "name.html": html })` writes them and returns a function giving each page's `file://` URL, and `sceneUrl(dir)` gives the same function to the spec.
3. **Record them.** Open the path on the bare page (`goto scene("term.html")`, which sits under the title card), then `goto scene("term.html", "go")` with the caption and line, `wait` for `body[data-done]` and `hover` a line (`#line3`) to point at it. Lines carry ids `line1`, `line2` and so on, and `classify(line)` can mark them `ok`, `warn`, `bad`, `dim` or `hl`.

Every value the helpers put into a page is escaped, and data handed to a page script is JSON with `<` escaped. A slide's `html` field is inserted as it is, for the spec's own trusted markup only. Before recording, read each page's text once for anything private, such as account ids, internal hostnames or a colleague's name, that the capture checks cannot know about.

## Complex slides with Remotion (optional)

The skill does not ship or install [Remotion](https://github.com/remotion-dev/remotion). The cards, the caption band and `slidesPage` cover most demos, so reach for Remotion only when a slide needs real motion graphics that a page cannot show, such as an animated chart, a zoom into part of a screenshot or picture-in-picture.

1. **Check the licence first.** Remotion is free for individuals and for companies of up to three people, and larger companies need a company licence. Tell the person this and get their go-ahead before installing it, and never add it to this skill's `package.json`.
2. **Install it in the user's project**, in a folder of its own (for example `demo-slides/`), from npm or straight from the repository on GitHub. `npx create-video@latest` scaffolds a new project, and `npm install remotion @remotion/cli` adds it to an existing React folder. Take the content from the app or the project, never invented, and the colours and typeface from the spec's `theme`.
3. **Render it** at the spec's viewport size (1600 by 1000 unless the spec sets another) and 25 or 30 frames a second, for example `npx remotion render src/index.ts Slide out/slide.webm --codec=vp9`. WebM (VP9) is the safest format, and an H.264 MP4 also plays in the Chromium that Playwright installs.
4. **Record it as a scene.** Copy the clip into the scenes folder and build its page with `clipPage({ title, src: "slide.webm" })` through `writeScenes`. Open it under the title card or at a mid step with `goto scene("slide.html")`, then `goto scene("slide.html", "go")` with the caption and `say`, and `wait` for `body[data-done]` with a `timeoutMs` longer than the clip. The clip plays muted, the narration comes from `say` and the music runs under it as usual. A clip that cannot be played shows an alert, which fails the take.

Keep each clip about as long as the line spoken over it, and look at its storyboard still like any other caption.

## Chapters and label timing

`node <skill>/bin/assemble.mjs <spec> [--out DIR]` joins recorded takes into one MP4 per chapter and, when there is more than one chapter, one full video, under `<out>/final/`. A chapter is one or more paths played in order, and a part followed by another part of the same chapter is cut where its end card begins, with a short fade, so each chapter carries one end card and the next part's title card serves as a section break. Chapters come from the spec,

```js
assemble: {
  chapters: [{ file: "Chapter 1, Why", parts: ["why"] }, { file: "Chapter 2, How", parts: ["how-setup", "how-run"] }],
  full: "The whole story",
},
```

or from `--chapter "Chapter 2, How=how-setup,how-run"` (repeatable) and `--full NAME`, and with neither every path is a chapter of its own. `--no-full` skips the full video. A part without sound is given silence, so silent and narrated takes can be joined.

`node <skill>/bin/align-labels.mjs <spec> <slug>...` moves each change of the band's person label to the moment the caption next changes, so a label set on the same step as a new caption does not appear over the previous screen while that screen's caption finishes. It edits the take's `take.json` (keeping the original once as `take.before-align.json`), then `record.mjs <spec> --remux --only <slug>` rebuilds the video.

## Transitions

`transitions` (on by default) fades the video in from black and out at the end, fades cards in and out, dips each caption out and the next one in, and cross-fades the person label when it changes. When a path opens with a `goto`, the recorder loads that page first and lays the title card over it, so the card dissolves into the app instead of cutting from a blank page.

`--remux` rebuilds the MP4s of the named paths from their last takes, using `raw.webm` and `take.json`, so a change to the band, the fades or the audio mix needs no new recording. A change to a step, a caption or a spoken line does need one.

## Apps without sign-in

When the app has a persona or role switcher instead of a sign-in, make `login` a function that drives the switcher and names the new person in the band. Set the label straight after the click, with `after: 0` so the click does not wait to settle first, and the label's cross-fade lands with the screen change.

```js
login: async (r, user) => {
  await r.click("role=button|Signed in as");
  await r.click(`role=menuitemradio|${user.name}`, { after: 0 });
  await r.who(user.who);
  await r.waitFor({ target: `role=button|Signed in as ${user.name}` });
},
```

Do not use `signout` with an app that keeps its state in `localStorage`, because it clears that storage and with it everything the path has done so far.

## Step actions (declarative `steps`)

Every step may also carry `caption` (set before the action), `who` (the band label, set before the action), `say` (the spoken line, started before the action), `hold` (wait until the caption on screen has been read and the line spoken before acting), `expect` (checked after the action) and `pause` (milliseconds after it). A bare string is a caption.

| action | fields | does |
|---|---|---|
| `goto` | `url` (`?query` and `#hash` resolve against `baseUrl`, a path is appended to it, an absolute URL is used as it is) | navigate and wait for the network to settle |
| `click` / `hover` | `target`, `after?` | scroll smoothly into view, glide the cursor to it, then click or hover |
| `type` | `target`, `value`, `clear?`, `delay?` | click into the field and type like a person (35 ms per key) |
| `keys` | `value`, `delay?` | type into whatever already has focus |
| `select` | `target`, `value` | choose a `<select>` option by value or label |
| `press` | `key`, `after?` | a keyboard key, such as `Enter`, `Escape` or `ArrowDown` |
| `upload` | `target`, `file` (relative to the spec) | attach a file to a file input |
| `scroll` | `by` (px), `steps?` | smooth wheel scroll under the cursor |
| `wait` / `expect-text` | `target` / `text` / `url` (regex) | wait until it is true |
| `login` / `signout` | `as` (user key) | run the spec's sign-in for that user, or clear the session |
| `caption` / `who` | `text` | change the caption, or the person label at the left of the band (a newline starts its second line) |
| `say` | `text` | speak a line without changing the caption, after the line before has finished |
| `card` / `uncard` | `kicker`, `title`, `sub`, `ms` | full-screen card mid-video, such as "Meanwhile, the manager" |
| `pause` | `ms` | hold on the screen |
| `shot` | `name` | save a PNG into the take folder |

Targets are `testid=…`, `label=…`, `placeholder=…`, `text=…`, `role=button|Name` (role, then accessible name), any Playwright selector, or, in a JS spec, a function `page => locator` for anything these cannot say, such as a link inside one table row. Text, label and role targets skip hidden matches. An `expect` entry is visible text (a substring), a RegExp, or `{ target }`, and a list checks each one.

For anything the declarative steps cannot express, give the path a `run(r, { login, steps })` function. `r` is the `Recorder` in `lib/recorder.mjs`, with the same methods plus `r.page` for raw Playwright.

## Pacing and review

- A caption stays up for `max(minCaptionMs, characters × readingMsPerChar)`, 2.5 seconds and 55 ms by default, or until its spoken line has finished when that is longer, and the wait happens when the next caption is set. A step without a caption that changes the screen straight after a captioned step, such as closing a confirmation or navigating away, needs `hold: true`, or the viewer loses what the caption describes.
- When a caption names something below the fold, hover it (or `scroll`) in the same or the next step so it is in view while the caption is read.
- Text split across elements, such as a large number above a small unit, will not match one `expect` string, so check the container with `{ target }` and a `hasText` filter, or check each part.
- After a persona switch, the next caption describes the new person's screen, so the switch caption reads as a hand-over ("The manager picks up the request").

## Tuning

- `viewport` (1600 by 1000 by default, set it to the size the demo script assumes), `slowMo` (120 ms between browser actions by default), `timeoutMs` (20 s).
- `captions` is `"band"` (the default) or `"overlay"` for the older bar drawn over the page. `bandHeight` (100 px) and `bandLabelWidth` (260 px, so the label can sit under a sidebar of that width).
- `readingMsPerChar` and `minCaptionMs` for the reading pace, and `transitions: false` for hard cuts.
- `music` takes `preset`, `volumeDb`, `duck` (true, false or `{ threshold, ratio, attack, release }`), `seed`, `fadeInS` (1.5) and `fadeOutS` (2.5), and a path's own `music` is merged over it.
- `voice` takes `voice`, `speed`, `lexicon`, `gapMs`, `sentencePauseMs` (220 ms between the sentences of one line), `dtype` (`fp32` by default, `q8` for a smaller download), `model` and `checkModel` (the Whisper model for `--check-voice`), and `samples` (the voices `--voice-samples` renders).
- `contextOptions`, passed to the browser context, for example `{ locale: "en-GB", timezoneId: "Europe/London", permissions: ["clipboard-read", "clipboard-write"] }`.
- `theme` takes `accent` (the cursor, best a colour the app never uses for a status), `bandBg` (a hex colour), `bandFg`, `bandLabelFg`, `captionBg` and `captionFg` (overlay mode), `cardBg` (end it in `bandBg` so a card runs into the band without a seam), `cardFg`, `font`, and `fontCss` (`@font-face` rules for `font`, so the band and the cards can use the app's own typeface, for example read from the app's embedded fonts), plus the card fields in **Cards and branding** and, for scene pages, `sceneBg`, `sceneFg`, `sceneMuted`, `scenePanel`, `sceneLine`, `sceneAccent`, `termBg`, `termFg`, `termBar` and `mono`.
- `failOnVisibleErrors: false` keeps a take even when error UI appears, only when the error is the point of the demo, and `errorWords` is the regex for what counts as error UI.
- `--review-every N` changes the interval of the review stills.
