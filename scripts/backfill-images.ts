/* Backfill product photos for repository reviews missing an image.
   Order: Google CSE (brand + name) → INCIDecoder front photo.
   Updates both the image_url column and result.review.imageUrl.
   Run: npx tsx scripts/backfill-images.ts */

import fs from "fs";
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const { searchProductImage } = await import("../src/lib/product-image");
  const { resolveINCI } = await import("../src/lib/inci-fetch");

  const db = createAdminClient();
  const { data } = await db.from("product_reviews")
    .select("product_slug, product_name, brand, result")
    .is("image_url", null).limit(200);

  console.log(`${data?.length ?? 0} products missing photos`);
  let fixed = 0;
  for (const row of data ?? []) {
    const q = `${row.brand} ${row.product_name}`.trim();
    let img: string | null = null;
    try { img = await searchProductImage(q); } catch { /* try next source */ }
    if (!img) {
      try { img = (await resolveINCI(q)).chosen?.imageUrl ?? null; } catch { /* none */ }
    }
    if (img) {
      const result = row.result as { review?: { imageUrl?: string | null } };
      if (result?.review) result.review.imageUrl = img;
      await db.from("product_reviews").update({ image_url: img, result }).eq("product_slug", row.product_slug);
      fixed++;
      console.log(`✓ ${q}`);
    } else {
      console.log(`✗ ${q} — no image found`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  console.log(`\nDone: ${fixed}/${data?.length ?? 0} photos backfilled`);
}
main().catch((e) => { console.error(e); process.exit(1); });
