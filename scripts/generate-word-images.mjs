#!/usr/bin/env node
/**
 * Generate one illustration per word into public/images/words/<id>.webp (kie.ai, Qwen Image).
 *
 *   npm run gen:words                          # all missing images
 *   npm run gen:words -- --only hew-1,war-1    # just these ids
 *   npm run gen:words -- --category hewan      # one category from data/words.ts
 *   npm run gen:words -- --only hew-1 --force  # regenerate (overwrite)
 *   npm run gen:words -- --size square_hd      # 1024px (~4 credits) instead of 512px (~1 credit)
 *   npm run gen:words -- --out /tmp/x          # write somewhere else (for comparisons)
 *   npm run gen:ui                             # UI pictures (tutorial steps) from scripts/ui-subjects.json
 *
 * Cost: Qwen is billed per megapixel, so the default 512px "square" costs ~1/4 of 1024px;
 * the app shows images at 512px anyway. No real batching exists (one image per task, and
 * a grid image costs the same pixels), so savings come from size; concurrency only adds speed.
 * Key from KIE_API_KEY env or .env.local. Existing files are skipped, so after a rate limit
 * or empty balance just run it again. Needs `cwebp` (brew install webp).
 * Then `npm run upload:assets` to push to R2.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const subjectsFile = argv.includes("--subjects") ? argv[argv.indexOf("--subjects") + 1] : "scripts/word-subjects.json";
const subjects = JSON.parse(readFileSync(join(root, subjectsFile), "utf8"));
const isWordSet = subjectsFile.endsWith("word-subjects.json");

// Subject first (models weight the start most), then one short locked style.
const STYLE =
  "soft children's book illustration, one centered subject filling about 60% of the frame, gentle rounded shapes, subject in its true clear colors with muted pastel shading, plain flat warm cream background (#F6F2EA), soft even light, subtle paper grain, calm and friendly";
// Clutter goes in the negative prompt instead of a list of "no …" in the prompt.
const NEGATIVE =
  "text, letters, numbers, watermark, logo, border, frame, background shapes, blobs, confetti, extra objects, multiple subjects, scenery, harsh shadow, photo, 3d render, dark background";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const force = args.includes("--force");
const only = flag("--only")?.split(",").map((s) => s.trim());
const category = flag("--category");
const size = flag("--size") ?? "square";
const outDir = flag("--out") ?? join(root, "public/images/words");
const CONCURRENCY = 4; // kie allows 20 new tasks / 10s

function apiKey() {
  if (process.env.KIE_API_KEY) return process.env.KIE_API_KEY;
  try {
    const m = readFileSync(join(root, ".env.local"), "utf8").match(/^KIE_API_KEY=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {}
  console.error("Missing KIE_API_KEY (env or .env.local).");
  process.exit(1);
}
const KEY = apiKey();

// Category comes from data/words.ts (ids there are the source of truth).
const wordsSrc = readFileSync(join(root, "data/words.ts"), "utf8");
const categoryOf = Object.fromEntries(
  [...wordsSrc.matchAll(/id: "([^"]+)"[^}]*category: "([^"]+)"/g)].map((m) => [m[1], m[2]]),
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function kie(path, body) {
  const res = await fetch(`https://api.kie.ai/api/v1/jobs/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60_000),
  });
  const json = await res.json();
  // kie returns HTTP 200 with an error code in the body
  if (json.code !== 200) throw new Error(`kie ${json.code}: ${json.msg}`);
  return json.data;
}

// Family words stay faceless: every family looks different (user request).
const negativeFor = (id) => (id.startsWith("kel-") ? `${NEGATIVE}, face, eyes, nose, mouth, facial features, hair details` : NEGATIVE);

async function generate(id, subject) {
  const { taskId } = await kie("createTask", {
    model: "qwen/text-to-image",
    input: { prompt: `${subject}, ${STYLE}`, negative_prompt: negativeFor(id), image_size: size, output_format: "png" },
  });
  for (let i = 0; i < 90; i++) { // up to ~6 minutes
    await sleep(4_000);
    const d = await kie(`recordInfo?taskId=${taskId}`);
    if (d.state === "fail") throw new Error(`task failed: ${d.failMsg || d.failCode}`);
    if (d.state === "success") {
      const img = await fetch(JSON.parse(d.resultJson).resultUrls[0], { signal: AbortSignal.timeout(60_000) });
      if (!img.ok) throw new Error(`download HTTP ${img.status}`);
      return { png: Buffer.from(await img.arrayBuffer()), credits: d.creditsConsumed ?? 0 };
    }
  }
  throw new Error("timed out waiting for task");
}

let ids = Object.keys(subjects);
const missing = Object.keys(categoryOf).filter((id) => !subjects[id]);
if (isWordSet && missing.length) console.warn(`No subject in word-subjects.json for: ${missing.join(", ")}`);
if (only) ids = ids.filter((id) => only.includes(id));
if (category) ids = ids.filter((id) => categoryOf[id] === category);

mkdirSync(outDir, { recursive: true });
const todo = ids.filter((id) => force || !existsSync(join(outDir, `${id}.webp`)));
console.log(`${todo.length} to generate (${ids.length - todo.length} already there), size=${size}`);

let made = 0, credits = 0;
const failed = [];

async function work(id) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { png, credits: c } = await generate(id, subjects[id]);
      const tmp = join(tmpdir(), `word-${id}-${process.pid}.png`);
      writeFileSync(tmp, png);
      execFileSync("cwebp", ["-quiet", "-resize", "512", "512", "-q", "80", tmp, "-o", join(outDir, `${id}.webp`)]);
      unlinkSync(tmp);
      made++;
      credits += Number(c) || 0;
      console.log(`ok   ${id}  ${c} cr  (${subjects[id]})`);
      return;
    } catch (e) {
      console.warn(`fail ${id} attempt ${attempt}: ${e.message}`);
      if (/kie 402|insufficient|balance/i.test(e.message)) break; // out of credits: stop retrying
      await sleep(attempt * 10_000);
    }
  }
  failed.push(id);
}

// Small worker pool: same cost, ~4x faster.
const queue = [...todo];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) await work(queue.shift());
}));

console.log(`\nDone: ${made} new, ${failed.length} failed, ${credits} credits used.`);
if (failed.length) {
  console.log(`Retry later: npm run gen:words -- --only ${failed.join(",")}`);
  process.exitCode = 1;
}
