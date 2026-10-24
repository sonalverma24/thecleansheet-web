import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/* The mobile bottom tab bar (Home, Analyser, Standard, Education, Verify, About) is not part of the site: nothing draws it, and nothing is still
   positioned to clear it. */
const root = join(__dirname, "..", "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const sources = (dir: string): string[] => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? sources(p) : /\.(tsx?|css)$/.test(n) && !/\.test\./.test(n) ? [p] : [];
});

describe("no mobile bottom tab bar", () => {
  it("the component is gone and nothing imports or draws it", () => {
    expect(existsSync(join(root, "components", "MobileBottomNav.tsx"))).toBe(false);
    for (const f of sources(root)) expect(readFileSync(f, "utf8"), f).not.toContain("MobileBottomNav");
  });

  it("the page no longer reserves room at the bottom for it", () => {
    expect(read("components/layout/SiteChrome.tsx")).not.toMatch(/pb-\[calc\(4rem/);
  });

  it("the WhatsApp bubble and the comparison tray no longer sit above a bar that is not there", () => {
    expect(read("components/WhatsAppBubble.tsx")).not.toContain("bottom-20");
    expect(read("components/scorecards/ComparisonTray.tsx")).not.toMatch(/bottom-\[calc\(4rem/);
  });
});
