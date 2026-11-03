/* ────────────────────────────────────────────────────────────────
   TILE IMAGES · one picture treatment for every product tile.

   A product's stored picture is whatever its analysis found: an INKEE Decoder photo (sometimes 159 px wide), a Nykaa image asked for at 220 px, a brand's studio shot on
   a grey or beige ground. Drawn as they are, the tiles on the home page, the brand pages, /products and the compare page look like different sites. A remote picture is
   therefore drawn through /api/tile/<slug>, which trims its empty border, centres it on white at one size and serves it as a small WebP (src/lib/tile-processing.ts).

   This file is the part the pages use: it is plain code with no image library, so a client component can import it. A picture that is a file this site serves (the curated
   pack shots in /public/images/home/products) is returned as it is: those are already clean, and are what "a curated shot" means. A product can later be given one by
   adding a file and a seed (src/lib/home-shelf.ts), and it will win over the cleaned-up picture everywhere, as it does now.
──────────────────────────────────────────────────────────────── */

export const TILE_ROUTE = "/api/tile";
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,200}$/;

/** A short, stable fingerprint of the picture's address: the address a tile asks for changes when the product's picture does, so the cached copy is never stale. */
function fingerprint(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/** The address a tile draws its picture from: the cleaned-up copy for a remote picture, the file itself for one this site serves, nothing for no picture. */
export function tileImage(slug: string | undefined | null, image: string | undefined | null): string | null {
  if (!image) return null;
  if (!/^https:\/\//i.test(image)) return image;
  if (!slug || !SLUG_RE.test(slug)) return image;
  return `${TILE_ROUTE}/${slug}?v=${fingerprint(image)}`;
}

/** Whether a tile's picture address is the cleaned-up route (already sized and compressed: the page's own image optimiser should not process it again). */
export const isTileRoute = (src: string | null | undefined): boolean => !!src && src.startsWith(`${TILE_ROUTE}/`);

/** Nykaa serves one picture at any size: the stored address often asks for 220 px, which is soft in a tile. Ask for the large one. */
export function largestNykaa(url: string): string {
  if (!/^https:\/\/images-static\.nykaa\.com\//i.test(url)) return url;
  return url.replace(/tr:w-\d+,h-\d+/, "tr:w-800,h-800").replace(/tr:h-\d+,w-\d+/, "tr:h-800,w-800");
}
