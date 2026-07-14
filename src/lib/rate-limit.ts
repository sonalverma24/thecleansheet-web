/* ────────────────────────────────────────────────────────────────
   Simple in-memory sliding-window rate limiter (per IP, per route).
   Good enough for Phase 1; swap for Upstash/Redis when traffic grows.
──────────────────────────────────────────────────────────────── */

const WINDOW_MS = 60_000;
const buckets = new Map<string, number[]>();

// Periodic cleanup so the map doesn't grow unbounded
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS * 5) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < WINDOW_MS);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Returns true if the request is allowed, false if rate-limited. */
export function rateLimit(req: Request, route: string, maxPerMinute: number): boolean {
  const now = Date.now();
  sweep(now);
  const key = `${route}:${clientIp(req)}`;
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= maxPerMinute) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

export const rateLimited = () =>
  Response.json(
    { error: "Too many requests. Please wait a minute and try again." },
    { status: 429 },
  );
