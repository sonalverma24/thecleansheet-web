import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkPitchPassword,
  isPitchToken,
  mintPitchCookie,
  pitchEnabled,
  verifyPitchCookie,
} from "./pitch-gate";

describe("pitch gate", () => {
  beforeEach(() => {
    vi.stubEnv("PITCH_PATH_TOKEN", "tok-abc123");
    vi.stubEnv("PITCH_PASSWORD", "correct horse");
    vi.stubEnv("PITCH_COOKIE_SECRET", "s3cret");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("matches only the exact path token", () => {
    expect(isPitchToken("tok-abc123")).toBe(true);
    expect(isPitchToken("tok-abc124")).toBe(false);
    expect(isPitchToken("")).toBe(false);
  });

  it("matches only the exact password", () => {
    expect(checkPitchPassword("correct horse")).toBe(true);
    expect(checkPitchPassword("Correct horse")).toBe(false);
  });

  it("accepts a freshly minted cookie and rejects tampering", () => {
    const c = mintPitchCookie()!;
    expect(verifyPitchCookie(c)).toBe(true);
    const [exp, sig] = c.split(".");
    expect(verifyPitchCookie(`${Number(exp) + 3600}.${sig}`)).toBe(false);
    expect(verifyPitchCookie(`${exp}.${"0".repeat(sig.length)}`)).toBe(false);
    expect(verifyPitchCookie(undefined)).toBe(false);
    expect(verifyPitchCookie("garbage")).toBe(false);
  });

  it("expires the cookie after 8 hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T10:00:00Z"));
    const c = mintPitchCookie()!;
    vi.setSystemTime(new Date("2026-10-14T17:59:00Z"));
    expect(verifyPitchCookie(c)).toBe(true);
    vi.setSystemTime(new Date("2026-10-14T18:01:00Z"));
    expect(verifyPitchCookie(c)).toBe(false);
  });

  it("rotating the cookie secret signs everyone out", () => {
    const c = mintPitchCookie()!;
    vi.stubEnv("PITCH_COOKIE_SECRET", "rotated");
    expect(verifyPitchCookie(c)).toBe(false);
  });

  it("is fully off when any env var is missing", () => {
    vi.stubEnv("PITCH_PASSWORD", "");
    expect(pitchEnabled()).toBe(false);
    expect(isPitchToken("tok-abc123")).toBe(false);
    expect(mintPitchCookie()).toBeNull();
  });
});
