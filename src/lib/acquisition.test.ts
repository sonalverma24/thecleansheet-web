import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureAcquisition, getSignupPath, noteAuthIntent, readAcquisition } from "./acquisition";

const store = new Map<string, string>();
const browser = {
  location: {
    hostname: "thecleansheet.in",
    pathname: "/review",
    search: "?utm_source=instagram&utm_medium=social&utm_campaign=october_spf",
  },
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  },
};

beforeEach(() => {
  store.clear();
  browser.location.pathname = "/review";
  browser.location.search = "?utm_source=instagram&utm_medium=social&utm_campaign=october_spf";
  vi.stubGlobal("window", browser);
  vi.stubGlobal("document", { referrer: "" });
});

afterEach(() => { vi.unstubAllGlobals(); });

describe("visitor attribution", () => {
  it("preserves first touch and ignores unattributed internal visits", () => {
    const first = captureAcquisition();
    expect(first?.first.source).toBe("instagram");
    expect(first?.first.campaign).toBe("october_spf");
    expect(first?.first.landingPath).toBe("/review");

    browser.location.pathname = "/account";
    browser.location.search = "";
    const second = captureAcquisition();
    expect(second?.first.landingPath).toBe("/review");
    expect(second?.last.source).toBe("instagram");
  });

  it("updates the latest identifiable source without overwriting first touch", () => {
    captureAcquisition();
    browser.location.pathname = "/ingredients";
    browser.location.search = "?utm_source=whatsapp&utm_medium=community&utm_campaign=group";
    const later = captureAcquisition();
    expect(later?.first.source).toBe("instagram");
    expect(later?.last.source).toBe("whatsapp");
    expect(later?.last.campaign).toBe("group");
  });

  it("keeps the signup initiation page through an auth callback", () => {
    captureAcquisition();
    noteAuthIntent();
    browser.location.pathname = "/auth/callback";
    browser.location.search = "";
    vi.stubGlobal("document", { referrer: "https://accounts.google.com/" });
    captureAcquisition();
    expect(readAcquisition()?.last.source).toBe("instagram");
    expect(getSignupPath()).toBe("/review");
  });

  it("records unknown attribution without inventing a referrer", () => {
    browser.location.search = "";
    const state = captureAcquisition();
    expect(state?.first.source).toBe("direct / unknown");
    expect(state?.first.medium).toBe("none");
  });
});
