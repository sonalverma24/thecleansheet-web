import { describe, expect, it } from "vitest";
import { GATE_COPY, decideGate, type GateReason } from "./sign-in-gate";

describe("decideGate", () => {
  it("lets a signed-in visitor straight through", () => {
    expect(decideGate({ user: { id: "u1" }, loading: false })).toBe("allow");
  });

  it("asks a visitor who is not signed in", () => {
    expect(decideGate({ user: null, loading: false })).toBe("prompt");
  });

  it("waits while the sign-in state is still being read, whoever the visitor turns out to be", () => {
    expect(decideGate({ user: null, loading: true })).toBe("wait");
    expect(decideGate({ user: { id: "u1" }, loading: true })).toBe("wait");
  });
});

describe("the popup words", () => {
  const reasons = Object.keys(GATE_COPY) as GateReason[];

  it("cover every reason the list can ask for", () => {
    expect(reasons.sort()).toEqual(["compare", "filter", "open-product", "search", "sort"]);
  });

  it("name what the visitor tried, say browsing stays open, and never call our work a review", () => {
    for (const r of reasons) {
      const { title, subtitle } = GATE_COPY[r];
      expect(title, r).toMatch(/^Sign in to /);
      expect(subtitle, r).toContain("Browsing the list is open to everyone.");
      expect(`${title} ${subtitle}`, r).not.toMatch(/review/i);
    }
  });
});
