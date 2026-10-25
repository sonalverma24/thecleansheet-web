import { afterEach, describe, expect, it, vi } from "vitest";
import { searchProductImage } from "@/lib/product-image";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Google programmable image search configuration", () => {
  it("uses the existing Programmable Search Engine setting when the canonical CX name is absent", async () => {
    vi.stubEnv("GOOGLE_CSE_API_KEY", "test-key");
    vi.stubEnv("GOOGLE_CSE_CX", "");
    vi.stubEnv("Programmable_search_engine", "engine-id");
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("https://www.googleapis.com/customsearch/v1")) {
        const params = new URL(url).searchParams;
        expect(params.get("cx")).toBe("engine-id");
        return new Response(JSON.stringify({ items: [{
          link: "https://cdn.nykaa.com/photo.jpg",
          displayLink: "nykaa.com",
          title: "Minimalist Retinol Face Serum",
        }] }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(null, { status: 200, headers: { "content-type": "image/jpeg" } });
    });

    await expect(searchProductImage("Minimalist Retinol Face Serum", "Minimalist")).resolves.toMatchObject({
      url: "https://cdn.nykaa.com/photo.jpg",
      source: "cse",
      confidence: 1,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("keeps search disabled when neither engine ID is configured", async () => {
    vi.stubEnv("GOOGLE_CSE_API_KEY", "test-key");
    vi.stubEnv("GOOGLE_CSE_CX", "");
    vi.stubEnv("Programmable_search_engine", "");
    const fetch = vi.spyOn(globalThis, "fetch");

    await expect(searchProductImage("Minimalist Retinol Face Serum", "Minimalist")).resolves.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
