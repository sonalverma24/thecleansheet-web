/* ────────────────────────────────────────────────────────────────
   Verified Products registry
   Products scoring ≥ VERIFIED_THRESHOLD are recommended by
   The Clean Sheet and listed with usage guidance.

   Storage: JSON file at data/verified-products.json (works locally
   and on any persistent host) with an in-memory mirror as fallback
   for read-only serverless filesystems. Swap for Supabase when the
   product database lands.
──────────────────────────────────────────────────────────────── */

import fs from "fs";
import path from "path";
import type { VerifiedProduct } from "@/lib/types";

export const VERIFIED_THRESHOLD = 75;

const FILE = path.join(process.cwd(), "data", "verified-products.json");

// In-memory mirror — source of truth within a server process
let MEMORY: Map<string, VerifiedProduct> | null = null;

function loadFromDisk(): Map<string, VerifiedProduct> {
  try {
    const raw = fs.readFileSync(FILE, "utf-8");
    const arr = JSON.parse(raw) as VerifiedProduct[];
    return new Map(arr.map((p) => [p.slug, p]));
  } catch {
    return new Map();
  }
}

function getStore(): Map<string, VerifiedProduct> {
  if (!MEMORY) MEMORY = loadFromDisk();
  return MEMORY;
}

function persist(store: Map<string, VerifiedProduct>) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify([...store.values()], null, 2), "utf-8");
  } catch {
    /* read-only filesystem (serverless) — memory mirror still serves the session */
  }
}

export function slugify(productName: string, brand: string): string {
  return `${brand} ${productName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function upsertVerifiedProduct(p: VerifiedProduct) {
  const store = getStore();
  const existing = store.get(p.slug);
  // Keep the richest record: don't overwrite an image/guidance with nulls
  store.set(p.slug, {
    ...p,
    imageUrl: p.imageUrl ?? existing?.imageUrl ?? null,
    usageGuidance: p.usageGuidance ?? existing?.usageGuidance ?? null,
    integrityScore: p.integrityScore ?? existing?.integrityScore ?? null,
  });
  persist(store);
}

export function listVerifiedProducts(): VerifiedProduct[] {
  return [...getStore().values()].sort(
    (a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime(),
  );
}
