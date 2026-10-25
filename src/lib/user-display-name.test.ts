import { describe, expect, it } from "vitest";
import { greetingName } from "./user-display-name";

const who = (user_metadata: Record<string, unknown>, email: string | null = "sonal.verma@example.com") =>
  ({ email: email ?? undefined, user_metadata });

describe("greetingName", () => {
  it("uses the Google first name when there is one", () => {
    expect(greetingName(who({ given_name: "Sonal", full_name: "Sonal Verma" }))).toBe("Sonal");
  });

  it("takes the first word of the full name", () => {
    expect(greetingName(who({ full_name: "  Sonal   Verma " }))).toBe("Sonal");
    expect(greetingName(who({ name: "Sonal Verma" }))).toBe("Sonal");
  });

  it("falls back to the part of the email before the @", () => {
    expect(greetingName(who({}))).toBe("sonal.verma");
    expect(greetingName(who({ full_name: "   ", given_name: 42 }))).toBe("sonal.verma");
  });

  it("says 'there' when there is no name and no email", () => {
    expect(greetingName(who({}, null))).toBe("there");
  });
});
