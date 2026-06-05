import { google } from "googleapis";

interface ReviewSyncPayload {
  product_id: string;
  product_name: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  rating: number;
  review_text: string;
  display_anonymously: boolean;
  public_display_name: string;
  status: string;
  submitted_at: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPublicDisplayName(anonymous: boolean, name: string | null): string {
  if (anonymous || !name) return "Verified user";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/**
 * Appends a review row to the Google Sheet.
 * Fires asynchronously - failures are logged but never thrown to the caller.
 * The database is always the source of truth; this is a copy for reporting only.
 */
export async function syncReviewToSheets(payload: ReviewSyncPayload): Promise<void> {
  const email     = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey    = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const sheetId   = process.env.GOOGLE_REVIEWS_SHEET_ID;

  if (!email || !rawKey || !sheetId) {
    // Credentials not yet configured - skip silently in dev
    return;
  }

  // Private keys in env vars have literal \n - replace with real newlines
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    formatDate(payload.submitted_at),
    payload.product_id,
    payload.product_name,
    payload.user_id,
    payload.user_name ?? "",
    payload.user_email ?? "",
    payload.rating,
    payload.review_text,
    payload.display_anonymously ? "Yes" : "No",
    payload.public_display_name,
    payload.status,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/**
 * Convenience wrapper - builds the payload from raw review + user data.
 * Call this from API routes after a successful upsert.
 */
export async function syncReview(
  review: {
    product_id: string;
    user_id: string;
    rating: number;
    review_text: string;
    display_anonymously: boolean;
    status: string;
    created_at: string;
  },
  user: { name: string | null; email: string | null },
  productName: string
): Promise<void> {
  try {
    await syncReviewToSheets({
      product_id:          review.product_id,
      product_name:        productName,
      user_id:             review.user_id,
      user_name:           user.name,
      user_email:          user.email,
      rating:              review.rating,
      review_text:         review.review_text,
      display_anonymously: review.display_anonymously,
      public_display_name: getPublicDisplayName(review.display_anonymously, user.name),
      status:              review.status,
      submitted_at:        review.created_at,
    });
  } catch (err) {
    // Sheets sync must never break the review submission
    console.error("[Sheets Sync] Failed:", err instanceof Error ? err.message : err);
  }
}
