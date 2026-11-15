#!/usr/bin/env node
/**
 * Record every spoken text with a natural voice into public/audio/<key>.mp3
 * (kie.ai, Gemini 3.8 Flash TTS, voice "Sola"), then write lib/audioManifest.json
 * so lib/speech.ts knows which texts have a recording.
 *
 *   npm run gen:audio                    # all missing
 *   npm run gen:audio -- --only kucing,ma --force   # exact keys
 *   npm run gen:audio -- --kind syllable --force    # one kind: word | syllable | wordSyllable | sentence | islamic
 *   npm run gen:audio -- --force         # re-record
 *
 * Texts come from data/words.ts, data/islamic.ts, the Suku Kata syllable list and
 * EXTRA below. Key from KIE_API_KEY env or .env.local. Needs ffmpeg.
 * Cost: ~0.1 credit per clip. Then `npm run upload:assets` to push to R2.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { words, simpleSentences } from "../data/words.ts";
import { hijaiyahLetters, dailyDoas, asmaulHusna } from "../data/islamic.ts";
import { audioKey, syllableKey } from "../lib/audioKey.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/audio");
const VOICE = "Sola";
const CONCURRENCY = 4;

// Phrases spoken outside the data files (add here when the app speaks new fixed text).
const EXTRA = [];

const INDONESIAN_ONLY = "Speak Bahasa Indonesia only; never read it as English, German or any other language.";
const STYLE = {
  word: "A warm, gentle Indonesian kindergarten teacher saying one Bahasa Indonesia word to a young child. Slow, clear, friendly. Say only the word.",
  syllable: "A warm, gentle Indonesian kindergarten teacher pronouncing a single Bahasa Indonesia syllable to a young child, slowly and clearly. Say only the syllable.",
  sentence: "A warm, gentle Indonesian kindergarten teacher reading a short Bahasa Indonesia phrase to a young child. Slow, clear, friendly.",
  islamic: "A calm, gentle Indonesian Muslim teacher reciting Arabic in Latin transliteration for a young child. Slow, clear, respectful.",
};

// A bare syllable has no language context, so the model may read it as German/English
// ("ja" → "ya", "to" → "tu"). Anchor each syllable to an Indonesian word that contains it.
const PHONETICS = "Use Indonesian spelling-to-sound rules: j = /dʒ/ as in jalan, c = /tʃ/ as in cicak, y = /j/, o = /o/ (never /u/), u = /u/, e = /ə/ or /e/, a = /a/, ng = /ŋ/, ny = /ɲ/, kh = /x/, sy = /ʃ/.";
const exampleWord = (syl) => {
  const w = words.find((x) => x.syllables[0] === syl) ?? words.find((x) => x.syllables.includes(syl));
  return w?.word;
};
// Syllables the model still misreads even with an example word: send a spoken spelling
// instead (the file name and the on-screen text stay the original syllable).
const SAY_AS = { to: "toh" };

// Indonesian writes both e sounds as "e". Inside a word we know which one it is (KBBI):
// é = e taling /e/ (bebek), plain e = e pepet /ə/ (belajar). Key = syllableKey(syl, word).
const TALING = {
  "be--bebek": "bé", "bek--bebek": "bék", "nek--nenek": "nék", "kek--kakek": "kék",
  "pel--apel": "pél", "me--melon": "mé", "be--stroberi": "bé", "e--mie": "é", "e--kue": "é",
  "men--permen": "mén", "es--es-krim": "és", "pe--sepeda": "pé", "ne--boneka": "né",
  "me--merah": "mé", "nye--oranye": "nyé", "pen--pensil": "pén", "sen--sendok": "sén",
};

function styleFor({ text, kind, word, idx }) {
  if (kind === "wordSyllable") {
    const parts = word.syllables.join("-");
    const key = syllableKey(text, word.word);
    const eNote = TALING[key]
      ? ` The vowel e here is a clear, tense e (e taling /e/, as in "bebek" and "sate"), never a weak schwa.`
      : text.includes("e") ? ` The vowel e here is a weak schwa (e pepet /ə/, as in "belajar" and "kecil"), never a clear e.` : "";
    return `${STYLE.syllable} Say ONLY the syllable "${text}", exactly as it sounds inside the Indonesian word "${word.word}" (part ${idx + 1} of ${word.syllables.length}: ${parts}).${eNote} ${PHONETICS} ${INDONESIAN_ONLY}`;
  }
  if (kind !== "syllable") return `${STYLE[kind]} ${kind === "islamic" ? "" : INDONESIAN_ONLY}`;
  const ex = exampleWord(text);
  return `${STYLE.syllable} This is the Indonesian syllable "${text}". ${ex ? `Pronounce it exactly as it sounds inside the Indonesian word "${ex}".` : ""} ${PHONETICS} ${INDONESIAN_ONLY}`;
}
const spoken = ({ key, text, kind }) =>
  kind === "wordSyllable" ? (TALING[key] ?? SAY_AS[text] ?? text)
  : kind === "syllable" ? (SAY_AS[text] ?? text)
  : text;

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const kindFilter = args.includes("--kind") ? args[args.indexOf("--kind") + 1] : null;

function apiKey() {
  if (process.env.KIE_API_KEY) return process.env.KIE_API_KEY;
  const m = readFileSync(join(root, ".env.local"), "utf8").match(/^KIE_API_KEY=(.+)$/m);
  if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  console.error("Missing KIE_API_KEY (env or .env.local).");
  process.exit(1);
}
const KEY = apiKey();

// key → entry (first kind wins; a word like "ma" stays a word)
const texts = new Map();
const add = (t, kind) => { const key = t && audioKey(t); if (t && !texts.has(key)) texts.set(key, { key, text: t, kind }); };
words.forEach((w) => add(w.word, "word"));
simpleSentences.forEach((s) => add(s, "sentence"));
words.forEach((w) => w.syllables.forEach((s) => add(s, "syllable")));
// Each syllable again, as said inside its own word (used when the app knows the word).
words.forEach((w) => w.syllables.forEach((s, idx) => {
  const key = syllableKey(s, w.word);
  if (!texts.has(key)) texts.set(key, { key, text: s, kind: "wordSyllable", word: w, idx });
}));
const suku = readFileSync(join(root, "app/suku-kata/page.tsx"), "utf8").match(/SINGLE_SYLLABLES = \[([\s\S]*?)\]/)[1];
[...suku.matchAll(/"([^"]+)"/g)].forEach((m) => add(m[1], "syllable"));
hijaiyahLetters.forEach((h) => add(h.name, "islamic"));
dailyDoas.forEach((d) => { add(d.latin, "islamic"); (d.syllablesLatin ?? []).forEach((s) => add(s, "islamic")); });
asmaulHusna.forEach((a) => add(a.latin, "islamic"));
EXTRA.forEach((t) => add(t, "sentence"));

mkdirSync(outDir, { recursive: true });
let todo = [...texts.values()].filter((e) => force || !existsSync(join(outDir, `${e.key}.mp3`)));
if (only) todo = [...texts.values()].filter((e) => only.includes(e.key));
if (kindFilter) todo = todo.filter((e) => e.kind === kindFilter);
console.log(`${texts.size} texts, ${todo.length} to record`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function kie(path, body) {
  const res = await fetch(`https://api.kie.ai/api/v1/jobs/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60_000),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`kie ${json.code}: ${json.msg}`);
  return json.data;
}

async function record(entry) {
  const { taskId } = await kie("createTask", {
    model: "google/gemini-3-8-flash-tts",
    input: {
      temperature: 0.7,
      speakers: [{ speaker_id: "Speaker 1", voice_name: VOICE }],
      dialogue_turns: [{ speaker_id: "Speaker 1", style: styleFor(entry), text: spoken(entry) }],
    },
  });
  for (let i = 0; i < 60; i++) {
    await sleep(3_000);
    const d = await kie(`recordInfo?taskId=${taskId}`);
    if (d.state === "fail") throw new Error(`task failed: ${d.failMsg || d.failCode}`);
    if (d.state === "success") {
      const wav = await fetch(JSON.parse(d.resultJson).resultUrls[0], { signal: AbortSignal.timeout(60_000) });
      if (!wav.ok) throw new Error(`download HTTP ${wav.status}`);
      return { wav: Buffer.from(await wav.arrayBuffer()), credits: Number(d.creditsConsumed) || 0 };
    }
  }
  throw new Error("timed out waiting for task");
}

let made = 0, credits = 0;
const failed = [];
async function work(entry) {
  const { key } = entry;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { wav, credits: c } = await record(entry);
      const tmp = join(tmpdir(), `tts-${key}-${process.pid}.wav`);
      writeFileSync(tmp, wav);
      // trim leading/trailing silence, mono 64k mp3
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", tmp,
        "-af", // gentle trim (-60dB) so soft onsets like p/t/k survive, plus a little padding
        "silenceremove=start_periods=1:start_threshold=-60dB,areverse,silenceremove=start_periods=1:start_threshold=-60dB,areverse,adelay=80|80,apad=pad_dur=0.12",
        "-ac", "1", "-b:a", "64k", join(outDir, `${key}.mp3`)]);
      unlinkSync(tmp);
      made++; credits += c;
      console.log(`ok   ${key}  ${c} cr`);
      return;
    } catch (e) {
      console.warn(`fail ${key} attempt ${attempt}: ${e.message}`);
      if (/insufficient|balance|kie 402/i.test(e.message)) break;
      await sleep(attempt * 10_000);
    }
  }
  failed.push(key);
}

const queue = [...todo];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => { while (queue.length) await work(queue.shift()); }));

// Manifest = every recording on disk (so partial runs still help the app).
const keys = readdirSync(outDir).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4)).sort();
writeFileSync(join(root, "lib/audioManifest.json"), JSON.stringify(keys) + "\n");

console.log(`\nDone: ${made} new, ${failed.length} failed, ${credits.toFixed(2)} credits. Manifest: ${keys.length} clips.`);
if (failed.length) { console.log(`Retry: npm run gen:audio`); process.exitCode = 1; }
