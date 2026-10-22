import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { isGoogleUser, SKIN_TYPE_GUIDES } from "./skin-guide-downloads";

const user = (over: Partial<User>): User => ({ id: "u", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "", ...over }) as User;

describe("isGoogleUser", () => {
  it("is false when nobody is signed in", () => {
    expect(isGoogleUser(null)).toBe(false);
    expect(isGoogleUser(undefined)).toBe(false);
  });

  it("is true for a Google sign-in", () => {
    expect(isGoogleUser(user({ app_metadata: { provider: "google", providers: ["google"] } }))).toBe(true);
  });

  it("is true when Google is one of several linked providers", () => {
    expect(isGoogleUser(user({ app_metadata: { provider: "email", providers: ["email", "google"] } }))).toBe(true);
    expect(isGoogleUser(user({ app_metadata: { provider: "email" }, identities: [{ provider: "google" } as never] }))).toBe(true);
  });

  it("is false for an email-only sign-in", () => {
    expect(isGoogleUser(user({ app_metadata: { provider: "email", providers: ["email"] } }))).toBe(false);
  });
});

describe("SKIN_TYPE_GUIDES", () => {
  it("lists the four guides, each with a PDF file name", () => {
    expect(SKIN_TYPE_GUIDES.map((g) => g.slug)).toEqual(["oily-skin", "dry-skin", "combination-skin", "normal-skin"]);
    for (const g of SKIN_TYPE_GUIDES) expect(g.pdf).toMatch(/^[A-Za-z0-9_]+\.pdf$/);
  });
});
