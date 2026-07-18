/* Backfill product photos for repository reviews missing an image.
   Keyless: INCIDecoder → Amazon.in/Nykaa search scrape.
   Updates image_url column AND result.review.imageUrl.
   Run: npx tsx scripts/backfill-images.ts */

import fs from "fs";
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const { findProductImageKeyless } = await import("../src/lib/product-image");
  const { resolveINCI } = await import("../src/lib/inci-fetch");

  const db = createAdminClient();
  const { data } = await db.from("product_reviews")
    .select("product_slug, product_name, brand, result")
    .or("image_url.is.null,image_url.eq.").limit(300);

  console.log(`${data?.length ?? 0} products missing photos`);
  let fixed = 0;
  for (const row of data ?? []) {
    let img = await findProductImageKeyless(row.brand as string, row.product_name as string);
    if (!img) { try { img = (await resolveINCI(`${row.brand} ${row.product_name}`)).chosen?.imageUrl ?? null; } catch {} }
    if (img) {
      const result = row.result as { review?: { imageUrl?: string | null } };
      if (result?.review) result.review.imageUrl = img;
      await db.from("product_reviews").update({ image_url: img, result }).eq("product_slug", row.product_slug);
      fixed++;
      console.log(`✓ ${row.brand} ${row.product_name}`);
    } else {
      console.log(`✗ ${row.brand} ${row.product_name}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log(`\nDone: ${fixed}/${data?.length ?? 0} photos backfilled`);
}
main().catch((e) => { console.error(e); process.exit(1); });
