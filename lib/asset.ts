// Generated assets (word pictures, UI pictures, game cards, recorded voice) live in
// Cloudflare R2, not in the repo. NEXT_PUBLIC_ASSET_BASE = the bucket's public URL;
// left empty, paths resolve to public/ (local dev before uploading).
const BASE = (process.env.NEXT_PUBLIC_ASSET_BASE ?? "").replace(/\/$/, "");

export function asset(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path; // user photos, absolute URLs
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
