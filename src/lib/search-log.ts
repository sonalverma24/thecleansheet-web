/* The search log row written by /api/review: who searched for what.

   `user_email` was added to `product_searches` by a migration (supabase/migrations/20261026052330_store_product_search_user_email.sql).
   Code and migration are deployed separately, so the log must work in either order: when the insert is refused (the column is missing, or still
   the wrong type), the row is written again without the email, so a search is never lost to a deploy order. Pure apart from the database
   handle it is given. */

export interface SearchLogRow {
  user_id: string;
  user_email: string | null;
  query: string;
  product_slug: string | null;
}

/** Just the part of the database client this needs, so a test can hand in a fake. */
export interface SearchLogDb {
  from(table: "product_searches"): {
    insert(row: Record<string, unknown>): PromiseLike<{ error: { message: string } | null }>;
  };
}

/** Writes the row; on a refusal, writes it again without the email. Returns whether the email was kept. Never throws for a database refusal. */
export async function logSearch(db: SearchLogDb, row: SearchLogRow): Promise<{ saved: boolean; emailKept: boolean }> {
  const first = await db.from("product_searches").insert({ ...row });
  if (!first.error) return { saved: true, emailKept: row.user_email !== null };

  console.error("[review] search-log insert with the email was refused; writing it without:", first.error.message);
  const { user_id, query, product_slug } = row;
  const second = await db.from("product_searches").insert({ user_id, query, product_slug });
  if (second.error) {
    console.error("[review] search-log insert failed", second.error.message);
    return { saved: false, emailKept: false };
  }
  return { saved: true, emailKept: false };
}
