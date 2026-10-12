// Find and merge duplicate product_reviews rows (same product stored under
// differently-worded names). Dry run by default.
//
//   npx tsx --env-file=.env.local scripts/merge-duplicate-reviews.mts [brand]
//   npx tsx --env-file=.env.local scripts/merge-duplicate-reviews.mts [brand] --apply
//   npx tsx --env-file=.env.local scripts/merge-duplicate-reviews.mts --keep=<slug> --drop=<slug>,<slug> [--apply]
//     (explicit mode: skips auto-detection, for when the default keeper pick is wrong)
//
// Keeper per group: INCIDecoder-sourced list first, then the longest sane INCI
// list, then the newest. Losers are deleted; the redirects to add to
// next.config.ts are printed so old /reviews/<slug> links keep working.
import { createClient } from "@supabase/supabase-js";
import { isSameProduct, sanitizeInciList } from "../src/lib/product-identity";

const apply = process.argv.includes("--apply");
const only = process.argv.slice(2).find((a) => !a.startsWith("--"))?.toLowerCase();
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const keepSlug = arg("keep");
const dropSlugs = arg("drop")?.split(",").filter(Boolean) ?? [];
if (keepSlug && dropSlugs.length) {
  const { data: kept } = await db.from("product_reviews").select("product_slug").eq("product_slug", keepSlug).maybeSingle();
  if (!kept) throw new Error(`keeper ${keepSlug} not found`);
  for (const d of dropSlugs) {
    console.log(`${apply ? "deleting" : "would delete"} ${d}`);
    if (apply) { const { error: e } = await db.from("product_reviews").delete().eq("product_slug", d); if (e) throw e; }
    console.log(`      { source: "/reviews/${d}", destination: "/reviews/${keepSlug}", permanent: true },`);
  }
  process.exit(0);
}

const { data, error } = await db.from("product_reviews").select("product_slug, product_name, brand, tier, reviewed_at, result");
if (error) throw error;

type Row = { slug: string; name: string; brand: string; tier: string; at: string; inci: string[]; incidecoder: boolean; sane: boolean };
const rows: Row[] = (data ?? []).map((r: any) => {
  const rv = r.result?.review ?? {};
  const inci: string[] = rv.inciIngredients ?? rv.ingredientReads?.map((x: any) => x.name) ?? [];
  return { slug: r.product_slug, name: r.product_name, brand: r.brand, tier: r.tier, at: r.reviewed_at, inci,
    incidecoder: /incidecoder\.com/.test(rv.inciSourceUrl ?? ""), sane: sanitizeInciList(inci).issues.length === 0 };
}).filter((r) => !only || r.brand.toLowerCase().includes(only));

const seen = new Set<string>();
const groups: Row[][] = [];
for (const a of rows) {
  if (seen.has(a.slug)) continue;
  const g = rows.filter((b) => b.slug === a.slug || (!seen.has(b.slug) && isSameProduct({ productName: a.name, brand: a.brand, inci: a.inci }, { productName: b.name, brand: b.brand, inci: b.inci })));
  g.forEach((x) => seen.add(x.slug));
  if (g.length > 1) groups.push(g);
}

const redirects: string[] = [];
for (const g of groups) {
  const keep = [...g].sort((x, y) => Number(y.incidecoder) - Number(x.incidecoder) || Number(y.sane) - Number(x.sane) || y.inci.length - x.inci.length || y.at.localeCompare(x.at))[0];
  console.log(`\n${keep.brand}: ${g.length} rows`);
  for (const r of g) console.log(`  ${r === keep ? "KEEP" : "drop"}  ${r.tier.padEnd(15)} ${String(r.inci.length).padStart(2)} inci${r.sane ? "" : " (garbled)"}  ${r.slug}`);
  for (const r of g) if (r !== keep) {
    redirects.push(`      { source: "/reviews/${r.slug}", destination: "/reviews/${keep.slug}", permanent: true },`);
    if (apply) {
      const { error: e } = await db.from("product_reviews").delete().eq("product_slug", r.slug);
      if (e) throw e;
    }
  }
}
console.log(groups.length ? `\n${apply ? "Deleted" : "Would delete"} ${redirects.length} rows. Redirects for next.config.ts:\n${redirects.join("\n")}` : "No duplicate groups found.");
if (!apply && groups.length) console.log("\nDry run. Re-run with --apply to delete.");
