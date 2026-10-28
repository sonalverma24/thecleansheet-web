import { describe, expect, it } from "vitest";
import { fullSizeProductPhoto } from "./product-photo";

describe("full-size analysis photos", () => {
  it("keeps the same Nykaa product asset while removing thumbnail resizing", () => {
    expect(fullSizeProductPhoto("https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/4/3/plix.jpg?version=2"))
      .toBe("https://images-static.nykaa.com/media/catalog/product/4/3/plix.jpg?version=2");
  });
  it("leaves other stores, untransformed images and local paths alone", () => {
    for (const src of ["/product.jpg", "https://cdn.brand.com/tr:w-220/photo.jpg", "https://images-static.nykaa.com/media/catalog/product/plix.jpg", "https://images-static.nykaa.com.evil.test/media/catalog/product/tr:w-220/photo.jpg"])
      expect(fullSizeProductPhoto(src)).toBe(src);
  });
});
