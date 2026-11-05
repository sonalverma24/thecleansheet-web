import { describe, expect, it, vi } from "vitest";
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
import { copyEditProblem } from "./site-copy";

describe("site copy edits", () => {
  it("accepts a normal edit", () => expect(copyEditProblem("home.hero.title1", "Hello")).toBeNull());
  it("refuses bad keys, empty and huge text", () => {
    expect(copyEditProblem("Home Hero", "x")).toBe("invalid key");
    expect(copyEditProblem("home.x", "   ")).toMatch(/empty/);
    expect(copyEditProblem("home.x", "a".repeat(5001))).toMatch(/longer/);
  });
});
