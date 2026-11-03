import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRenderedPage } from "./scrape";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });
const ok = (markdown: string) => ({ ok: true, status: 200, json: async () => ({ success: true, data: { markdown, metadata: { title: "T" } } }) });

describe("fetchRenderedPage", () => {
  it("renders a page with the steps given and returns its text and title", async () => {
    vi.stubEnv("FIRECRAWL_API_KEY", "fc-test");
    const f = vi.fn().mockResolvedValue(ok("# Page"));
    vi.stubGlobal("fetch", f);
    expect(await fetchRenderedPage("https://www.nykaa.com/x/p/1", [{ type: "wait", milliseconds: 10 }])).toEqual({ markdown: "# Page", title: "T" });
    const [endpoint, init] = f.mock.calls[0];
    expect(endpoint).toBe("https://api.firecrawl.dev/v1/scrape");
    expect(init.headers.Authorization).toBe("Bearer fc-test");
    expect(JSON.parse(init.body)).toMatchObject({ url: "https://www.nykaa.com/x/p/1", formats: ["markdown"], actions: [{ type: "wait", milliseconds: 10 }] });
  });

  it("tries once more after a failure, so a passing hiccup does not cost the page", async () => {
    vi.stubEnv("FIRECRAWL_API_KEY", "fc-test");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const f = vi.fn().mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) }).mockResolvedValueOnce(ok("# Page"));
    vi.stubGlobal("fetch", f);
    expect(await fetchRenderedPage("https://www.nykaa.com/x/p/1")).toMatchObject({ markdown: "# Page" });
    expect(f).toHaveBeenCalledTimes(2);
  });

  it("does not retry a page that was still not rendered when the time ran out", async () => {
    vi.stubEnv("FIRECRAWL_API_KEY", "fc-test");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.useFakeTimers();
    const f = vi.fn(async () => { await new Promise((r) => setTimeout(r, 20000)); return { ok: false, status: 408, json: async () => ({}) }; });
    vi.stubGlobal("fetch", f);
    const pending = fetchRenderedPage("https://www.nykaa.com/x/p/1", [], 25000);
    await vi.advanceTimersByTimeAsync(21000);
    expect(await pending).toBeNull();
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("gives up after two failures, and is null without a key, never throwing", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("FIRECRAWL_API_KEY", "fc-test");
    const f = vi.fn().mockRejectedValue(new Error("down"));
    vi.stubGlobal("fetch", f);
    expect(await fetchRenderedPage("https://www.nykaa.com/x/p/1")).toBeNull();
    expect(f).toHaveBeenCalledTimes(2);
    vi.stubEnv("FIRECRAWL_API_KEY", "");
    expect(await fetchRenderedPage("https://www.nykaa.com/x/p/1")).toBeNull();
  });
});
