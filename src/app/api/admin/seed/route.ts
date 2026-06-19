import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ALL_BRANDS } from "@/data/brands";

// POST /api/admin/seed - seeds all brand + product data from TypeScript files into Supabase.
// Protected by ADMIN_BOOTSTRAP_TOKEN.
// Safe to re-run: uses upsert on slug.

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (token !== process.env.ADMIN_BOOTSTRAP_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const log: string[] = [];
  let brandCount   = 0;
  let productCount = 0;
  let errorCount   = 0;

  for (const brand of ALL_BRANDS) {
    // ── Upsert brand ──────────────────────────────────────────
    const { data: brandRow, error: brandErr } = await db
      .from("brands")
      .upsert({
        name:          brand.name,
        slug:          brand.slug,
        logo_url:      brand.logo ?? null,
        tagline:       brand.tagline ?? null,
        description:   brand.description ?? null,
        founded:       brand.founded ?? null,
        headquarters:  brand.headquarters ?? null,
        website_url:   brand.website ?? null,
        nykaa_url:     brand.nykaaUrl ?? null,
        avg_score:     brand.avgScore ?? null,
        verdict:       brand.verdict ?? null,
        is_published:  true,
      }, { onConflict: "slug" })
      .select("id")
      .single();

    if (brandErr || !brandRow) {
      log.push(`ERROR brand ${brand.slug}: ${brandErr?.message}`);
      errorCount++;
      continue;
    }
    brandCount++;

    // ── Upsert each product ───────────────────────────────────
    for (const p of brand.products) {
      const slug = `${brand.slug}--${p.slug}`;

      // Parse price
      const priceMatch = (p.priceRange ?? "").match(/[\d,]+/g);
      const priceMin = priceMatch?.[0] ? parseInt(priceMatch[0].replace(/,/g, "")) : null;
      const priceMax = priceMatch?.[1] ? parseInt(priceMatch[1].replace(/,/g, "")) : priceMin;

      const { data: productRow, error: productErr } = await db
        .from("products")
        .upsert({
          brand_id:           brandRow.id,
          brand_name:         brand.name,
          brand_slug:         brand.slug,
          product_name:       p.productName,
          slug,
          category:           p.category ?? p.productType ?? "Skincare",
          subcategory:        p.subCategory ?? null,
          product_type:       p.productType ?? null,
          size_value:         p.sizeValue ?? null,
          size_unit:          p.sizeUnit ?? null,
          mrp:                p.price ?? priceMax,
          price_min:          p.price ?? priceMin,
          price_max:          p.price ?? priceMax,
          price_per_ml:       p.pricePerUnit ?? null,
          product_image_url:  p.image ?? null,
          ingredient_list:    p.ingredients.map(i => i.name).join(", "),
          claims:             p.claimsMade ?? [],
          fragrance_free:     p.fragranceStatus === "free",
          skin_type_tags:     p.skinTypeTags ?? [],
          concern_tags:       p.concernTags ?? [],
          suitability_tags:   p.suitabilityTags ?? [],
          caution_tags:       p.cautionTags ?? [],
          status:             "Public Data Review",
          analysis_confidence:"High",
          analyzed_at:        p.analyzedAt ? new Date(p.analyzedAt).toISOString() : new Date().toISOString(),
          is_published:       true,
        }, { onConflict: "slug" })
        .select("id")
        .single();

      if (productErr || !productRow) {
        log.push(`ERROR product ${slug}: ${productErr?.message}`);
        errorCount++;
        continue;
      }

      // ── Upsert score ──────────────────────────────────────
      const safety     = p.pillars?.find(pl => pl.name.toLowerCase().includes("safety"))?.score ?? 0;
      const formulation= p.pillars?.find(pl => pl.name.toLowerCase().includes("formulation"))?.score ?? 0;
      const claims_s   = p.pillars?.find(pl => pl.name.toLowerCase().includes("claims"))?.score ?? 0;
      const ethics     = p.pillars?.find(pl => pl.name.toLowerCase().includes("ethics"))?.score ?? 0;

      const scoreLabelMap: Record<string, string> = {
        Excellent: "Excellent", Good: "Good", Fair: "Fair", Concern: "Use with Caution",
      };

      await db.from("product_scores").upsert({
        product_id:        productRow.id,
        total_score:       p.score,
        safety_score:      Math.min(safety, 50),
        formulation_score: Math.min(formulation, 20),
        claims_score:      Math.min(claims_s, 20),
        ethics_score:      Math.min(ethics, 10),
        score_label:       scoreLabelMap[p.scoreLabel] ?? "Fair",
        verdict:           p.summary ?? null,
        best_for:          p.skinTypeTags ?? [],
        avoid_if:          p.cautionTags ?? [],
        expert_summary:    p.indiaContext ?? p.summary ?? null,
        pass_badges:       p.pass_badges ?? [],
        warn_badges:       p.warn_badges ?? [],
        info_badges:       p.info_badges ?? [],
        score_breakdown_json: JSON.stringify(p.pillars ?? []),
      }, { onConflict: "product_id" });

      productCount++;
    }
  }

  return NextResponse.json({
    success:      true,
    brands:       brandCount,
    products:     productCount,
    errors:       errorCount,
    log:          log.slice(0, 50),
  });
}
