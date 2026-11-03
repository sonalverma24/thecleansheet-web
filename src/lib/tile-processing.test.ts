import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { TILE_SIZE, isFetchableImageUrl, isPrivateAddress, processTile } from "./tile-processing";

/** A picture of one coloured rectangle on a ground, as a PNG. */
const picture = (w: number, h: number, ground: string, box: { w: number; h: number; colour: string }, alpha = false) =>
  sharp({ create: { width: w, height: h, channels: alpha ? 4 : 3, background: ground } })
    .composite([{ input: { create: { width: box.w, height: box.h, channels: 3, background: box.colour } }, left: Math.floor((w - box.w) / 2), top: Math.floor((h - box.h) / 2) }])
    .png()
    .toBuffer();

/** The tile as raw pixels, and the box of everything that is not (nearly) white. */
async function look(webp: Buffer) {
  const { data, info } = await sharp(webp).raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels;
    if (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  }
  const corner = (x: number, y: number) => [0, 1, 2].map((c) => data[(y * info.width + x) * info.channels + c]);
  return { info, box: { w: maxX - minX + 1, h: maxY - minY + 1, left: minX, top: minY }, corners: [corner(0, 0), corner(info.width - 1, 0), corner(0, info.height - 1), corner(info.width - 1, info.height - 1)] };
}

describe("processTile", () => {
  it("returns a WebP square of one size, white at the corners, whatever the picture's shape", async () => {
    for (const [w, h] of [[400, 400], [300, 900], [1200, 500]] as const) {
      const out = await processTile(await picture(w, h, "#ffffff", { w: Math.round(w / 3), h: Math.round(h / 3), colour: "#cc2233" }));
      expect((await sharp(out).metadata()).format).toBe("webp");
      const { info, corners } = await look(out);
      expect([info.width, info.height]).toEqual([TILE_SIZE, TILE_SIZE]);
      for (const c of corners) expect(c.every((v) => v >= 250)).toBe(true);
    }
  });

  it("trims the empty border, so a small product on a large white picture fills the tile like a big one", async () => {
    const small = await look(await processTile(await picture(1000, 1000, "#ffffff", { w: 300, h: 500, colour: "#223399" })));
    const big = await look(await processTile(await picture(500, 500, "#ffffff", { w: 300, h: 480, colour: "#223399" })));
    // The product is centred and takes most of the height, with the same margin, in both.
    expect(small.box.h).toBeGreaterThan(TILE_SIZE * 0.8);
    expect(small.box.h).toBeLessThan(TILE_SIZE * 0.92);
    expect(Math.abs(small.box.left + small.box.w / 2 - TILE_SIZE / 2)).toBeLessThan(3);
    expect(big.box.h).toBeGreaterThan(TILE_SIZE * 0.8);
  });

  it("trims a plain non-white ground as well (a uniform grey border is a border)", async () => {
    const out = await look(await processTile(await picture(800, 800, "#d9d9d9", { w: 200, h: 400, colour: "#111111" })));
    expect(out.box.h).toBeGreaterThan(TILE_SIZE * 0.8);
  });

  it("puts transparency on white, not black", async () => {
    const transparent = await sharp({ create: { width: 300, height: 300, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: { create: { width: 100, height: 100, channels: 3, background: "#cc2233" } }, left: 100, top: 100 }]).png().toBuffer();
    const { corners } = await look(await processTile(transparent));
    for (const c of corners) expect(c.every((v) => v >= 250)).toBe(true);
  });

  it("does not fail on a picture that is all one colour, and uses a picture whole when almost nothing would be left", async () => {
    const flat = await sharp({ create: { width: 200, height: 200, channels: 3, background: "#cccccc" } }).png().toBuffer();
    expect((await sharp(await processTile(flat)).metadata()).width).toBe(TILE_SIZE);
    const speck = await look(await processTile(await picture(1000, 1000, "#ffffff", { w: 20, h: 20, colour: "#000000" })));
    expect(speck.info.width).toBe(TILE_SIZE);
  });

  it("throws for bytes that are not a picture", async () => {
    await expect(processTile(Buffer.from("<html>not an image</html>"))).rejects.toThrow();
  });
});

describe("isFetchableImageUrl", () => {
  it.each(["https://images-static.nykaa.com/x.jpg", "https://beautyofjoseon.com/cdn/shop/files/a.webp?v=1", "https://sfycdn.speedsize.com/id/https://beminimalist.co/x.jpg"])("accepts %s", (u) => expect(isFetchableImageUrl(u)).toBe(true));
  it.each(["http://example.com/a.jpg", "https://127.0.0.1/a.jpg", "https://169.254.169.254/latest/meta-data", "https://[::1]/a.jpg", "https://localhost/a.jpg", "https://intranet/a.jpg", "https://user:pw@example.com/a.jpg", "https://example.com:8443/a.jpg", "https://printer.local/a.jpg", "file:///etc/passwd", "not a url"])("refuses %s", (u) => expect(isFetchableImageUrl(u)).toBe(false));
});

describe("isPrivateAddress", () => {
  it.each(["10.0.0.5", "127.0.0.1", "169.254.169.254", "172.16.0.1", "172.31.255.255", "192.168.1.1", "100.64.0.1", "0.0.0.0", "::1", "fe80::1", "fd12:3456::1", "::ffff:10.0.0.1"])("treats %s as private", (a) => expect(isPrivateAddress(a)).toBe(true));
  it.each(["8.8.8.8", "151.101.1.1", "172.32.0.1", "2606:4700::1111"])("treats %s as public", (a) => expect(isPrivateAddress(a)).toBe(false));
});
