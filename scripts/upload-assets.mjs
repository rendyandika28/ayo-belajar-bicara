#!/usr/bin/env node
/**
 * Upload generated assets to Cloudflare R2 (they are not kept in git).
 *
 *   npm run upload:assets            # changed/new files only
 *   npm run upload:assets -- --all   # everything
 *
 * Uploads public/images/{words,ui,games} and public/audio to the bucket in R2_BUCKET
 * (env or .env.local) with the same paths, e.g. audio/kucing.mp3. Uses wrangler
 * (run `npx wrangler login` once). Uploaded sizes are remembered in .assets-uploaded.json.
 * After `npm run gen:words` / `gen:ui` / `gen:audio`, run this.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["images/words", "images/ui", "images/games", "audio"];
const TYPES = { ".webp": "image/webp", ".png": "image/png", ".mp3": "audio/mpeg" };
const STATE = join(root, ".assets-uploaded.json");

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const m = readFileSync(join(root, ".env.local"), "utf8").match(new RegExp(`^${name}=(.+)$`, "m"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {}
  return "";
}
const bucket = env("R2_BUCKET");
if (!bucket) { console.error("Set R2_BUCKET in .env.local (e.g. R2_BUCKET=ayo-belajar-assets)."); process.exit(1); }

const all = process.argv.includes("--all");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};

const files = DIRS.flatMap((d) => {
  const dir = join(root, "public", d);
  return existsSync(dir) ? readdirSync(dir).filter((f) => TYPES[extname(f)]).map((f) => `${d}/${f}`) : [];
});
const todo = files.filter((k) => all || state[k] !== statSync(join(root, "public", k)).size);
console.log(`${files.length} files, ${todo.length} to upload → r2://${bucket}`);

let done = 0;
const failed = [];
async function upload(key) {
  const file = join(root, "public", key);
  try {
    await run("npx", ["wrangler", "r2", "object", "put", `${bucket}/${key}`, "--file", file,
      "--content-type", TYPES[extname(key)], "--cache-control", "public, max-age=31536000", "--remote"]);
    state[key] = statSync(file).size;
    done++;
    if (done % 25 === 0 || done === todo.length) console.log(`  ${done}/${todo.length}`);
  } catch (e) {
    failed.push(key);
    console.warn(`fail ${key}: ${(e.stderr || e.message).toString().split("\n").find(Boolean)}`);
  }
}

const queue = [...todo];
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await upload(queue.shift()); }));
writeFileSync(STATE, JSON.stringify(state, null, 2) + "\n");
console.log(`Done: ${done} uploaded, ${failed.length} failed.`);
if (failed.length) process.exitCode = 1;
