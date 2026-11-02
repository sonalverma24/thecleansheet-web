import { describe, expect, it } from "vitest";
import { isAdminEmail } from "./admin-auth";

describe("isAdminEmail", () => {
  const list = "Owner@Example.com, second@example.com ,";

  it("matches case-insensitively and ignores spaces around entries", () => {
    expect(isAdminEmail("owner@example.com", list)).toBe(true);
    expect(isAdminEmail("SECOND@example.com", list)).toBe(true);
  });

  it("refuses anyone who is not listed", () => {
    expect(isAdminEmail("shopper@example.com", list)).toBe(false);
    expect(isAdminEmail("owner@example.com.evil.test", list)).toBe(false);
  });

  it("refuses a missing email, and everyone when the list is empty or unset", () => {
    expect(isAdminEmail(null, list)).toBe(false);
    expect(isAdminEmail(undefined, list)).toBe(false);
    expect(isAdminEmail("", list)).toBe(false);
    expect(isAdminEmail("owner@example.com", "")).toBe(false);
    expect(isAdminEmail("owner@example.com", undefined)).toBe(false);
  });
});
