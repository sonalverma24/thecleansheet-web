import { describe, expect, it } from "vitest";
import { isTileRoute, largestNykaa, tileImage } from "./tile-image";

const NYKAA = "https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/8/b/8bc2035FOXTA00000284_j1.jpg";

describe("tileImage", () => {
  it("draws a remote picture through the cleaned-up route, keyed by the product's slug", () => {
    const src = tileImage("foxtale-brightening-moisturiser", NYKAA)!;
    expect(src).toMatch(/^\/api\/tile\/foxtale-brightening-moisturiser\?v=[0-9a-z]+$/);
    expect(isTileRoute(src)).toBe(true);
  });

  it("changes the address when the product's picture changes, and not otherwise", () => {
    const a = tileImage("p", "https://a.example.com/1.jpg");
    expect(tileImage("p", "https://a.example.com/1.jpg")).toBe(a);
    expect(tileImage("p", "https://a.example.com/2.jpg")).not.toBe(a);
  });

  it("leaves a file this site serves (a curated pack shot) exactly as it is, and says nothing for no picture", () => {
    expect(tileImage("cosrx-bha", "/images/home/products/cosrx-bha-liquid.webp")).toBe("/images/home/products/cosrx-bha-liquid.webp");
    expect(isTileRoute("/images/home/products/cosrx-bha-liquid.webp")).toBe(false);
    expect(tileImage("p", null)).toBeNull();
    expect(tileImage("p", "")).toBeNull();
  });

  it("falls back to the stored picture when there is no usable slug or the address is not https", () => {
    expect(tileImage(undefined, NYKAA)).toBe(NYKAA);
    expect(tileImage("Bad Slug/../x", NYKAA)).toBe(NYKAA);
    expect(tileImage("p", "http://a.example.com/1.jpg")).toBe("http://a.example.com/1.jpg");
  });
});

describe("largestNykaa", () => {
  it("asks Nykaa for the 800 px picture, in either parameter order, keeping the rest of the address", () => {
    expect(largestNykaa(NYKAA)).toBe("https://images-static.nykaa.com/media/catalog/product/tr:w-800,h-800,cm-pad_resize/8/b/8bc2035FOXTA00000284_j1.jpg");
    expect(largestNykaa("https://images-static.nykaa.com/media/catalog/product/tr:h-220,w-220,cm-pad_resize/5/8/x.jpg")).toBe("https://images-static.nykaa.com/media/catalog/product/tr:h-800,w-800,cm-pad_resize/5/8/x.jpg");
  });

  it("leaves any other host alone", () => {
    const other = "https://cdn.example.com/media/tr:w-220,h-220/x.jpg";
    expect(largestNykaa(other)).toBe(other);
  });
});
