import dns from "node:dns/promises";
import net from "node:net";
import sharp from "sharp";
import { largestNykaa } from "@/lib/tile-image";

/* The server side of tile images (src/lib/tile-image.ts explains why): fetch a product's stored picture, trim its empty border, centre it on white and return a WebP of one
   size. Pure functions apart from fetchTileSource, so they can be tested with a synthetic picture. */

/** The side of the finished square, in pixels. Twice the largest tile on screen, so it stays sharp on a retina display. */
export const TILE_SIZE = 640;
/** White space left around the product, as a share of the side. */
const MARGIN = 0.07;
/** How far a pixel may differ from the border colour and still count as border (0 to 255 per channel). */
const BORDER_TOLERANCE = 14;
/** A trim that would leave less than this share of the picture's area is a picture that is nearly all one colour, not a border: it is used whole. */
const MIN_KEPT_AREA = 0.02;

const MAX_BYTES = 10 * 1024 * 1024;
const FETCH_MS = 8000;

/** The tile for a picture: no transparency, border trimmed, fitted inside the margin, centred on a white square. Throws when the bytes are not a picture. */
export async function processTile(input: Buffer): Promise<Buffer> {
  const base = sharp(input, { failOn: "none", limitInputPixels: 60_000_000 }).rotate().flatten({ background: "#ffffff" });
  const whole = await base.clone().toBuffer({ resolveWithObject: true });
  let picture = whole.data;
  try {
    // trim() takes the colour of the top-left pixel as the border colour. A picture with no uniform border comes back unchanged; a picture that is all one colour throws.
    const trimmed = await sharp(whole.data).trim({ threshold: BORDER_TOLERANCE }).toBuffer({ resolveWithObject: true });
    const kept = (trimmed.info.width * trimmed.info.height) / (whole.info.width * whole.info.height);
    if (kept >= MIN_KEPT_AREA) picture = trimmed.data;
  } catch { /* nothing to trim */ }

  const inner = Math.round(TILE_SIZE * (1 - 2 * MARGIN));
  const fitted = await sharp(picture).resize({ width: inner, height: inner, fit: "inside", kernel: "lanczos3" }).toBuffer({ resolveWithObject: true });
  const left = Math.floor((TILE_SIZE - fitted.info.width) / 2);
  const top = Math.floor((TILE_SIZE - fitted.info.height) / 2);
  return sharp({ create: { width: TILE_SIZE, height: TILE_SIZE, channels: 3, background: "#ffffff" } })
    .composite([{ input: fitted.data, left, top }])
    .webp({ quality: 82 })
    .toBuffer();
}

/** An address a server may fetch for a stored picture: https, a name (not an IP address), the ordinary port, no credentials. */
export function isFetchableImageUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password || (u.port && u.port !== "443")) return false;
    const host = u.hostname.toLowerCase();
    if (net.isIP(host) || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".")) return false;
    return true;
  } catch { return false; }
}

const PRIVATE_V4 = [/^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^0\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./];
/** Whether an address a name resolved to is a private, loopback or link-local one (which a stored picture address must never reach). */
export function isPrivateAddress(address: string): boolean {
  if (net.isIPv4(address)) return PRIVATE_V4.some((re) => re.test(address));
  const a = address.toLowerCase();
  return a === "::1" || a === "::" || a.startsWith("fe80:") || a.startsWith("fc") || a.startsWith("fd") || a.startsWith("::ffff:");
}

const MAX_REDIRECTS = 3;

/** The bytes of a stored picture, or null when it cannot be had safely: not a fetchable address, a name that resolves to a private address (checked again at every redirect),
    too slow, too big, not an image. */
export async function fetchTileSource(url: string): Promise<Buffer | null> {
  let address = largestNykaa(url);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!isFetchableImageUrl(address)) return null;
      const records = await dns.lookup(new URL(address).hostname, { all: true });
      if (!records.length || records.some((r) => isPrivateAddress(r.address))) return null;
      const res = await fetch(address, { signal: AbortSignal.timeout(FETCH_MS), redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 (compatible; CleanSheetBot/1.0)", Accept: "image/*" } });
      if (res.status >= 300 && res.status < 400) {
        const next = res.headers.get("location");
        if (!next) return null;
        address = new URL(next, address).toString();
        continue;
      }
      if (!res.ok || !(res.headers.get("content-type") ?? "").toLowerCase().startsWith("image/")) return null;
      if (Number(res.headers.get("content-length") ?? 0) > MAX_BYTES) return null;
      const bytes = Buffer.from(await res.arrayBuffer());
      return bytes.length > 0 && bytes.length <= MAX_BYTES ? bytes : null;
    }
    return null;
  } catch { return null; }
}
