/** Nykaa's catalogue thumbnails include a resize segment. Keep the exact product
 * asset, but request its original resolution for the analysis page. */
export function fullSizeProductPhoto(src: string): string {
  try {
    const url = new URL(src);
    if (url.protocol === "https:" && url.hostname === "images-static.nykaa.com") {
      url.pathname = url.pathname.replace(/^(\/media\/catalog\/product\/)tr:[^/]+\//, "$1");
      return url.toString();
    }
  } catch { /* Local image paths pass through unchanged. */ }
  return src;
}
