import { describe, expect, it, vi } from "vitest";
vi.mock("./scrape", () => ({ fetchPageMarkdown: vi.fn() }));
import { fetchPageMarkdown } from "./scrape";
import { resolveINCI, parseProductPage, incidecoderProductSlug } from "./inci-fetch";
import { captureTrustForUrl, CaptureTrust } from "./review-verifier";
const page = (host: string) => `Title: Plix Pomegranate Youth Renewal Night Cream ingredients (Explained)\n# [Plix](https://${host}/brands/plix)\n## Ingredients overview\n[Aqua](https://${host}/ingredients/water), [Glycerin](https://${host}/ingredients/glycerin), [Niacinamide](https://${host}/ingredients/niacinamide), [Panthenol](https://${host}/ingredients/panthenol), [Tocopherol](https://${host}/ingredients/tocopherol)`;

describe("Decoder domain migration", () => {
  it.each(["incidecoder.com", "inkeedecoder.com"])("retains identity, quotation and reference trust for %s", (host) => {
    const url = `https://${host}/products/plix-pomegranate-youth-renewal-night-cream`;
    expect(incidecoderProductSlug(url)).toBe("plix-pomegranate-youth-renewal-night-cream");
    expect(captureTrustForUrl(url)).toBe(CaptureTrust.REFERENCE_DB);
    const list = parseProductPage(page(host), "plix-pomegranate-youth-renewal-night-cream");
    expect(list?.ingredients).toHaveLength(5);
    expect(list?.sourceQuote).toContain("Niacinamide");
    expect(list?.source).toBe(url);
    expect(list?.pageBrand).toBe("Plix");
  });
  it("resolves search results whose links use the new domain", async () => {
    vi.mocked(fetchPageMarkdown).mockImplementation(async (url) => url.includes("/search?") ? "[Plix Pomegranate Youth Renewal Night Cream](https://inkeedecoder.com/products/plix-pomegranate-youth-renewal-night-cream)" : page("inkeedecoder.com"));
    const result = await resolveINCI("Plix Pomegranate Youth Renewal Night Cream");
    expect(result.chosen?.source).toContain("inkeedecoder.com/products/");
    expect(result.chosen?.ingredients).toHaveLength(5);
  });
});

it('matches an unaccented exact identity without substituting the Soft Creme variant', async () => {
  vi.mocked(fetchPageMarkdown).mockImplementation(async (url) => url.includes('/search?')
    ? '[Estée Lauder Revitalizing Supreme+ Youth Power Creme](https://inkeedecoder.com/products/estee-lauder-creme)\n[Estée Lauder Revitalizing Supreme+ Youth Power Soft Creme](https://inkeedecoder.com/products/estee-lauder-soft-creme)'
    : page('inkeedecoder.com').replaceAll('Plix Pomegranate Youth Renewal Night Cream','Estée Lauder Revitalizing Supreme+ Youth Power Creme'));
  const result=await resolveINCI('estee lauder revitalizing supreme youth power creme');
  expect(result.ambiguous).toBe(false);
  expect(result.chosen?.slug).toBe('estee-lauder-creme');
});
