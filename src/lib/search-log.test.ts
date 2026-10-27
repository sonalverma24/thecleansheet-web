import { afterEach, describe, expect, it, vi } from "vitest";
import { logSearch, type SearchLogDb, type SearchLogRow } from "@/lib/search-log";

const ROW: SearchLogRow = { user_id: "u1", user_email: "reader@example.com", query: "dot and key sunscreen", product_slug: "dot-key-sunscreen" };

/** A fake table: each answer in `answers` is what one insert returns, in order; every row it was handed is recorded. */
function fakeDb(answers: ({ message: string } | null)[]) {
  const rows: Record<string, unknown>[] = [];
  const db: SearchLogDb = {
    from: () => ({
      insert: async (row) => { rows.push(row); return { error: answers[rows.length - 1] ?? null }; },
    }),
  };
  return { db, rows };
}

afterEach(() => vi.restoreAllMocks());

describe("logSearch", () => {
  it("writes the row with the email when the table accepts it", async () => {
    const { db, rows } = fakeDb([null]);
    expect(await logSearch(db, ROW)).toEqual({ saved: true, emailKept: true });
    expect(rows).toEqual([ROW]);
  });

  it("writes the row once, with no email, for a searcher that has none", async () => {
    const { db, rows } = fakeDb([null]);
    expect(await logSearch(db, { ...ROW, user_email: null })).toEqual({ saved: true, emailKept: false });
    expect(rows).toHaveLength(1);
  });

  it("keeps the search when the email is refused (column missing or the wrong type): it is written again without the email", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { db, rows } = fakeDb([{ message: 'invalid input syntax for type uuid: "reader@example.com"' }, null]);
    expect(await logSearch(db, ROW)).toEqual({ saved: true, emailKept: false });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ user_email: "reader@example.com" });
    expect(rows[1]).toEqual({ user_id: "u1", query: "dot and key sunscreen", product_slug: "dot-key-sunscreen" });
    expect(rows[1]).not.toHaveProperty("user_email");
  });

  it("reports, and does not throw, when even the second write is refused", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { db } = fakeDb([{ message: "column does not exist" }, { message: "relation does not exist" }]);
    expect(await logSearch(db, ROW)).toEqual({ saved: false, emailKept: false });
  });
});
