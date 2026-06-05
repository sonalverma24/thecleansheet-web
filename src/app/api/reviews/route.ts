import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/data/brands";
import { syncReview } from "@/lib/sheets-sync";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplayName(anonymous: boolean, name: string | null | undefined): string {
  if (anonymous || !name) return "Verified user";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── GET /api/reviews?product_id=brandSlug/productSlug ───────────────────────
// Public: returns approved reviews + aggregate rating.
// If user is authenticated, also returns their own review (for edit pre-fill).

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json({ error: "product_id is required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch approved reviews joined with user name
  const { data: rows, error: reviewsError } = await supabase
    .from("reviews")
    .select("id, rating, review_text, display_anonymously, created_at, updated_at, users(name)")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (reviewsError) {
    return NextResponse.json({ error: reviewsError.message }, { status: 500 });
  }

  // Fetch aggregate rating from denormalized table
  const { data: ratingData } = await supabase
    .from("product_ratings")
    .select("average_rating, review_count")
    .eq("product_id", productId)
    .single();

  // Format reviews for public consumption - no user IDs, no emails
  const reviews = (rows ?? []).map((r) => {
    const user = (r.users as unknown) as { name: string | null } | null;
    return {
      id: r.id,
      rating: r.rating,
      review_text: r.review_text,
      display_name: formatDisplayName(r.display_anonymously, user?.name),
      date: formatDate(r.created_at),
      created_at: r.created_at,
    };
  });

  // If user is logged in, return their own review so the form can pre-fill
  let userReview: {
    id: string;
    rating: number;
    review_text: string;
    display_anonymously: boolean;
  } | null = null;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: own } = await supabase
      .from("reviews")
      .select("id, rating, review_text, display_anonymously")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .single();
    userReview = own ?? null;
  }

  return NextResponse.json({
    reviews,
    average_rating: ratingData?.average_rating ?? null,
    review_count: ratingData?.review_count ?? 0,
    user_review: userReview,
  });
}

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Authenticated. Creates or updates the user's review for a product.

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "You must be signed in to leave a review." }, { status: 401 });
  }

  let body: {
    product_id?: unknown;
    rating?: unknown;
    review_text?: unknown;
    display_anonymously?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { product_id, rating, review_text, display_anonymously } = body;

  // Validate
  if (!product_id || typeof product_id !== "string") {
    return NextResponse.json({ error: "product_id is required" }, { status: 400 });
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "Rating must be a whole number between 1 and 5" }, { status: 400 });
  }
  if (!review_text || typeof review_text !== "string" || review_text.trim().length < 10) {
    return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
  }

  const isAnonymous = display_anonymously === true;

  // Upsert - insert or update if user already reviewed this product
  const { data: review, error: upsertError } = await supabase
    .from("reviews")
    .upsert(
      {
        product_id: product_id.trim(),
        user_id: user.id,
        rating,
        review_text: review_text.trim(),
        display_anonymously: isAnonymous,
        status: "approved",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_id,user_id" }
    )
    .select()
    .single();

  if (upsertError) {
    console.error("[Reviews POST] Upsert failed:", upsertError.message);
    return NextResponse.json({ error: "Failed to save review. Please try again." }, { status: 500 });
  }

  // Recalculate aggregate rating via stored function
  const { error: calcError } = await supabase.rpc("recalculate_product_rating", {
    p_product_id: product_id.trim(),
  });
  if (calcError) {
    console.error("[Reviews POST] Rating recalculation failed:", calcError.message);
  }

  // Fetch updated rating to return to the client immediately
  const { data: ratingData } = await supabase
    .from("product_ratings")
    .select("average_rating, review_count")
    .eq("product_id", product_id.trim())
    .single();

  // Sync a copy to Google Sheets for reporting (fires async, never blocks response)
  const [brandSlug, productSlug] = product_id.trim().split("/");
  const productData = getProductBySlug(brandSlug, productSlug);
  const productName = productData
    ? productData.productName
    : product_id.trim();

  const userProfile = await supabase
    .from("users")
    .select("name, email")
    .eq("id", user.id)
    .single();

  syncReview(
    review,
    { name: userProfile.data?.name ?? null, email: userProfile.data?.email ?? null },
    productName
  ).catch(() => {}); // already logged inside syncReview

  return NextResponse.json({
    review,
    average_rating: ratingData?.average_rating ?? null,
    review_count: ratingData?.review_count ?? 0,
  });
}
