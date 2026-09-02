/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Ingredient directory (curated core + discovered)
   The /ingredients directory is the union of:
     • the curated core  - the rich static 734-ingredient dataset
     • discovered rows   - ingredients seen in scanned products that are
                           not in the core, stored in Supabase `ingredients`
                           and enriched by a background model search.
   So every ingredient of every product ever analysed appears in the
   directory, and any new one is added automatically on the next review.
──────────────────────────────────────────────────────────────── */

import { ALL_INGREDIENTS, toSlug, type Ingredient } from "@/lib/ingredient-utils";
import { lookupIngredient, normIngredient } from "@/lib/ingredient-db";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateResilient } from "@/lib/gemini";

/* Concern levels the `ingredients` table CHECK constraint allows. */
type Concern = "low" | "medium" | "high" | "restricted" | "gap" | "beneficial" | "claim";
const CONCERNS: Concern[] = ["low", "medium", "high", "restricted", "gap", "beneficial", "claim"];

export interface DiscoveredRow {
  inci_name: string;
  slug: string;
  common_names: string[] | null;
  function: string | null;
  description: string | null;
  concern_level: Concern | null;
  why_used: string | null;
  why_matters: string | null;
  regulatory_note: string | null;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");

/** Map a discovered DB row into the rich `Ingredient` display shape, so the
    directory renders core and discovered ingredients uniformly. Unknown fields
    are marked as pending rather than faked. */
export function discoveredToIngredient(r: DiscoveredRow): Ingredient {
  const concern = r.concern_level ? r.concern_level[0].toUpperCase() + r.concern_level.slice(1) : "";
  const pending = !r.function; // not yet enriched
  return {
    INCI_Name: r.inci_name,
    CAS_Number: "",
    EC_Number: "",
    Chemical_Name: "",
    Function: r.function ?? "Profile being compiled",
    Category_Code: "",
    Category_Name: r.function ?? "",
    Ingredient_Origin: "",
    Concern_Level_TCS: concern || (pending ? "" : "Low"),
    EU_Status: "", EU_Annex: "", India_Status: "", US_FDA_Status: "", Korea_Status: "",
    Vegan: "", Natural_ISO16128: "", SVHC_Flag: "", CMR_Flag: "",
    IARC_Group: "", Allergen_Flag: "", Endocrine_Flag: "",
    Max_Concentration_EU: "", Max_Concentration_India: "",
    Format_Restriction: "", Baby_Restriction: "",
    Common_Products: "", Key_Safety_Notes: r.why_matters ?? r.description ?? (pending ? "Newly discovered from a scanned product; full profile being compiled." : ""),
    TCS_Evaluator_Flag: "",
    Source_Reference: r.regulatory_note ?? "Discovered from a scanned product",
    Last_Updated: "",
  } as Ingredient;
}

/** Read every discovered ingredient from the table. */
export async function getDiscoveredIngredients(): Promise<Ingredient[]> {
  try {
    const { data } = await createAdminClient()
      .from("ingredients")
      .select("inci_name, slug, common_names, function, description, concern_level, why_used, why_matters, regulatory_note")
      .order("inci_name", { ascending: true });
    return (data ?? []).map((r) => discoveredToIngredient(r as DiscoveredRow));
  } catch {
    return [];
  }
}

/** The full directory: curated core (rich) + discovered (deduped by INCI name).
    Core wins on a name collision, since it carries the richer regulatory data. */
export async function getDirectoryIngredients(): Promise<Ingredient[]> {
  const discovered = await getDiscoveredIngredients();
  const coreKeys = new Set(ALL_INGREDIENTS.map((i) => normIngredient(i.INCI_Name)));
  const extras = discovered.filter((d) => !coreKeys.has(normIngredient(d.INCI_Name)));
  return [...ALL_INGREDIENTS, ...extras];
}

const DISCOVERED_COLS = "inci_name, slug, common_names, function, description, concern_level, why_used, why_matters, regulatory_note";

/** One ingredient by URL slug, from the curated core first, then the discovered
    table (matched on the stored slug, then on toSlug of the name as a fallback so
    a link generated from the display name still resolves). null when unknown. */
export async function getDirectoryIngredientBySlug(slug: string): Promise<Ingredient | null> {
  const core = ALL_INGREDIENTS.find((i) => toSlug(i.INCI_Name) === slug);
  if (core) return core;
  try {
    const db = createAdminClient();
    const { data: exact } = await db.from("ingredients").select(DISCOVERED_COLS).eq("slug", slug).maybeSingle();
    if (exact) return discoveredToIngredient(exact as DiscoveredRow);
    const { data: all } = await db.from("ingredients").select(DISCOVERED_COLS);
    const hit = (all ?? []).find((r) => toSlug(String((r as DiscoveredRow).inci_name)) === slug);
    return hit ? discoveredToIngredient(hit as DiscoveredRow) : null;
  } catch {
    return null;
  }
}

/** Which of these INCI names are NOT already known (neither in the curated core
    nor already a discovered row). Used to decide what to insert + enrich. */
export async function unknownIngredients(names: string[]): Promise<string[]> {
  const out: string[] = [];
  const seen = new Set<string>();
  const discovered = await getDiscoveredIngredients();
  const known = new Set([
    ...ALL_INGREDIENTS.map((i) => normIngredient(i.INCI_Name)),
    ...discovered.map((d) => normIngredient(d.INCI_Name)),
  ]);
  for (const name of names) {
    const key = normIngredient(name);
    if (!key || key.length < 2 || known.has(key) || seen.has(key)) continue;
    // Also skip if the ingredient DB accessor resolves it to a core row via a variant.
    if (lookupIngredient(name)) continue;
    seen.add(key);
    out.push(name.trim());
  }
  return out;
}

/** Insert new ingredient NAMES (unenriched) so they appear in the directory
    immediately; enrichment fills the profile afterwards. Idempotent on inci_name. */
export async function addDiscoveredNames(names: string[]): Promise<number> {
  const fresh = await unknownIngredients(names);
  if (!fresh.length) return 0;
  // Dedup by slug too: `slug` is also unique, so two names that slugify the same
  // would otherwise fail the whole batch.
  const bySlug = new Map<string, { inci_name: string; slug: string; common_names: string[] }>();
  for (const n of fresh) {
    const slug = slugify(n);
    if (!slug || bySlug.has(slug)) continue;
    bySlug.set(slug, { inci_name: n, slug, common_names: [] });
  }
  const rows = [...bySlug.values()];
  const db = createAdminClient();
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error } = await db.from("ingredients").upsert(chunk, { onConflict: "inci_name", ignoreDuplicates: true });
    if (!error) { inserted += chunk.length; continue; }
    // Fallback: insert row-by-row so one bad row (e.g. a slug clash with an
    // existing row) never drops the rest.
    for (const r of chunk) {
      const { error: e } = await db.from("ingredients").upsert([r], { onConflict: "inci_name", ignoreDuplicates: true });
      if (!e) inserted++;
    }
  }
  return inserted;
}

/* ═══════════════ Background enrichment (the "search") ═══════════════ */

const ENRICH_PROMPT = `You are a cosmetic-chemistry reference. For one INCI ingredient, return ONLY JSON:
{"function":"2-4 words, the primary role e.g. 'Humectant' or 'UV filter'","concernLevel":"low|medium|high|restricted|gap|beneficial|claim","description":"one factual sentence","whyUsed":"one sentence on its role in formulas","whyMatters":"one sentence on what a shopper should know","regulatoryNote":"one short sentence on EU/India cosmetic status"}
Keep "function" to its single primary role, not a list. Be factual and conservative. A common, well-tolerated ingredient is "low". Use "restricted" only for a genuinely concentration-limited/regulated ingredient, "high" only for a real hazard. Do not invent restrictions. No prose outside the JSON.`;

function parseEnrich(text: string): Partial<DiscoveredRow> | null {
  try {
    const s = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const o = JSON.parse(s) as Record<string, string>;
    const concern = String(o.concernLevel || "").toLowerCase() as Concern;
    return {
      function: o.function?.slice(0, 120) || null,
      description: o.description?.slice(0, 400) || null,
      concern_level: CONCERNS.includes(concern) ? concern : "low",
      why_used: o.whyUsed?.slice(0, 400) || null,
      why_matters: o.whyMatters?.slice(0, 400) || null,
      regulatory_note: o.regulatoryNote?.slice(0, 300) || null,
    };
  } catch {
    return null;
  }
}

/** Background search for one ingredient: ask the model, write the profile back.
    Safe to call repeatedly; only fills a row that is still unenriched. */
export async function enrichDiscoveredIngredient(name: string): Promise<boolean> {
  try {
    const fields = parseEnrich(await generateResilient(ENRICH_PROMPT, `Ingredient (INCI name): ${name}`));
    if (!fields?.function) return false;
    const { error } = await createAdminClient().from("ingredients").update(fields).eq("inci_name", name);
    return !error;
  } catch {
    return false;
  }
}

/** Enrich up to `limit` discovered ingredients that have no function yet.
    Runs sequentially so grounded-search rate limits are respected. Meant to be
    driven by a scheduled job or an admin endpoint, not a user request. */
export async function enrichPendingIngredients(limit = 20): Promise<{ enriched: number; remaining: number }> {
  try {
    const db = createAdminClient();
    const { data } = await db.from("ingredients").select("inci_name").is("function", null).limit(limit);
    const pending = (data ?? []).map((r) => String((r as { inci_name: string }).inci_name));
    let enriched = 0;
    for (const name of pending) if (await enrichDiscoveredIngredient(name)) enriched++;
    const { count } = await db.from("ingredients").select("inci_name", { count: "exact", head: true }).is("function", null);
    return { enriched, remaining: count ?? 0 };
  } catch {
    return { enriched: 0, remaining: 0 };
  }
}

export { CONCERNS, slugify as ingredientSlug };
