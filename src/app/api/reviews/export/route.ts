import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductBySlug } from "@/data/brands";

// ─── GET /api/reviews/export ──────────────────────────────────────────────────
// Admin only. Returns a CSV of all reviews with full user and product detail.
// Query params: product_id, rating, date_from, date_to, status

export async function GET(request: NextRequest) {
  // 1. Verify the requester is an authenticated admin
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (!adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Parse filters
  const { searchParams } = new URL(request.url);
  const filterProductId = searchParams.get("product_id");
  const filterRating    = searchParams.get("rating");
  const filterDateFrom  = searchParams.get("date_from");
  const filterDateTo    = searchParams.get("date_to");
  const filterStatus    = searchParams.get("status");

  // 3. Query with admin client (bypasses RLS so all reviews are visible)
  const admin = createAdminClient();

  let query = admin
    .from("reviews")
    .select("id, product_id, user_id, rating, review_text, display_anonymously, status, created_at, updated_at, users(name, email)")
    .order("created_at", { ascending: false });

  if (filterProductId) query = query.eq("product_id", filterProductId);
  if (filterRating)    query = query.eq("rating", parseInt(filterRating, 10));
  if (filterDateFrom)  query = query.gte("created_at", filterDateFrom);
  if (filterDateTo)    query = query.lte("created_at", filterDateTo);
  if (filterStatus)    query = query.eq("status", filterStatus);

  const { data: rows, error: queryError } = await query;

  if (queryError) {
    console.error("[Reviews Export] Query failed:", queryError.message);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }

  // 4. Build CSV
  const csvRows: string[] = [
    // Header
    [
      "Submitted At",
      "Product ID",
      "Product Name",
      "User ID",
      "User Name",
      "User Email",
      "Rating",
      "Review Text",
      "Posted Anonymously",
      "Public Display Name",
      "Status",
    ]
      .map(csvCell)
      .join(","),
  ];

  for (const row of rows ?? []) {
    const user = (row.users as unknown) as { name: string | null; email: string | null } | null;

    // Derive product name from static brand data
    const [brandSlug, productSlug] = (row.product_id as string).split("/");
    const product = getProductBySlug(brandSlug, productSlug);
    const productName = product?.productName ?? row.product_id;

    // Public display name mirrors what the frontend shows
    const publicName = row.display_anonymously
      ? "Verified user"
      : formatDisplayName(user?.name ?? null);

    csvRows.push(
      [
        formatDate(row.created_at as string),
        row.product_id,
        productName,
        row.user_id,
        user?.name ?? "",
        user?.email ?? "",
        row.rating,
        row.review_text,
        row.display_anonymously ? "Yes" : "No",
        publicName,
        row.status,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  const csv = csvRows.join("\n");
  const filename = `tcs-reviews-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function csvCell(value: unknown): string {
  const str = String(value ?? "").replace(/"/g, '""');
  return `"${str}"`;
}

function formatDisplayName(name: string | null): string {
  if (!name) return "Verified user";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
