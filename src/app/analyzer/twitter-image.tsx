import { renderOgImage } from "../_og/render";

export const runtime = "nodejs";
export const alt = "The Clean Sheet, India's Clean Beauty Standard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}
