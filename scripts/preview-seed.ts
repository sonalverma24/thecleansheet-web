/* Rules for scripts/seed-preview-db.mts, which copies the public catalogue from production into
   a separate Supabase project so Vercel Preview deployments never touch production data.

   Pure: nothing here reads the network or the filesystem, so every rule is unit tested.
   Three rules matter most:
     1. Only allow-listed columns are ever copied. A new column in production (an email, a user
        id) is therefore left out by default instead of leaking by default.
     2. The target must provably be a different project from the source. Checked by host, by
        project reference, and by the project reference inside each API key, because a
        correct-looking URL with the production key in the env file would otherwise slip through.
     3. Problems are reported as text that never contains a key. */

/** Columns of public.product_reviews that are copied (see supabase/migrations/20260716120000). */
export const PRODUCT_REVIEW_COLUMNS = [
  "product_slug", "product_name", "brand", "tier", "image_url", "result", "rubric_rev", "reviewed_at",
] as const;

/** Columns of public.ingredients that are copied. The id and created_at are regenerated. */
export const INGREDIENT_COLUMNS = [
  "inci_name", "slug", "common_names", "function", "description", "concern_level",
  "why_used", "why_matters", "regulatory_note",
] as const;

/** Columns that identify a person. Never copied; checked by name after the write. */
export const PRIVATE_COLUMNS = ["requested_by_user_id", "requested_by_email"] as const;

const PRIVATE_KEY_RE = /requested_?by|requester|user_?id|e-?mail/i;

export interface JwtClaims { ref?: string; role?: string }

/** Decode the payload of a Supabase JWT key without verifying it. Newer opaque keys
    (sb_secret_...) are not JWTs and return null. */
export function jwtClaims(key: string): JwtClaims | null {
  const parts = key.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const obj = JSON.parse(json) as Record<string, unknown>;
    return {
      ref: typeof obj.ref === "string" ? obj.ref : undefined,
      role: typeof obj.role === "string" ? obj.role : undefined,
    };
  } catch {
    return null;
  }
}

function parseUrl(raw: string): URL | null {
  try { return new URL(raw.trim()); } catch { return null; }
}

const isLocalHost = (host: string) => host === "localhost" || host === "127.0.0.1" || host === "[::1]";

/** The project reference of a hosted Supabase URL (abcd1234.supabase.co), else null. */
export function projectRefFromUrl(raw: string): string | null {
  const u = parseUrl(raw);
  if (!u) return null;
  const m = /^([a-z0-9]+)\.supabase\.co$/i.exec(u.hostname);
  return m ? m[1].toLowerCase() : null;
}

export interface SourceEndpoint { url: string; anonKey: string }
export interface TargetEndpoint { url: string; serviceKey: string }

/** Reasons the target must NOT be written to. Empty means it is safe to proceed. */
/** `label` names the project being checked in messages ("preview" for the seed script, "restored"
    for the restore script); the rules are the same: it must provably not be the other project. */
export function checkTarget(source: SourceEndpoint, target: TargetEndpoint, label = "preview"): string[] {
  const problems: string[] = [];
  const t = parseUrl(target.url ?? "");
  const s = parseUrl(source.url ?? "");

  if (!target.url?.trim()) problems.push(`the ${label} project's URL is missing`);
  else if (!t) problems.push(`the ${label} project's URL is not a valid URL`);
  if (!target.serviceKey?.trim()) problems.push(`the ${label} project's service-role key is missing`);
  if (!s) problems.push("the source (production) URL is missing or invalid, so the target cannot be compared with it");
  if (!source.anonKey?.trim()) problems.push("the source (production) anon key is missing; it is used so the read is read-only by construction");
  if (problems.length) return problems;

  const tu = t as URL;
  const su = s as URL;

  const local = isLocalHost(tu.hostname);
  if (!local && tu.protocol !== "https:") problems.push(`the ${label} URL must be https`);
  if (!local && !/\.supabase\.co$/i.test(tu.hostname)) {
    problems.push(`the ${label} URL is not a *.supabase.co host (or localhost); a custom domain cannot be checked against production, so use the project's supabase.co URL`);
  }

  if (tu.host.toLowerCase() === su.host.toLowerCase()) problems.push(`the ${label} URL is the same host as production`);

  const targetClaims = jwtClaims(target.serviceKey);
  const sourceClaims = jwtClaims(source.anonKey);
  const sourceRefs = new Set<string>(
    [projectRefFromUrl(source.url), sourceClaims?.ref].filter((x): x is string => !!x).map((x) => x.toLowerCase()),
  );
  const targetRefs = [projectRefFromUrl(target.url), targetClaims?.ref]
    .filter((x): x is string => !!x).map((x) => x.toLowerCase());

  for (const ref of targetRefs) {
    if (sourceRefs.has(ref)) problems.push(`the ${label} URL or key belongs to the production project`);
  }
  const urlRef = projectRefFromUrl(target.url);
  if (urlRef && targetClaims?.ref && urlRef !== targetClaims.ref.toLowerCase()) {
    problems.push(`the service-role key belongs to a different project than the ${label} URL`);
  }
  if (targetClaims?.role && targetClaims.role !== "service_role") {
    problems.push(`the ${label} key has the role "${targetClaims.role}", not service_role`);
  }
  if (target.serviceKey.trim() === source.anonKey.trim()) problems.push(`the ${label} key is the production anon key`);

  return [...new Set(problems)];
}

/** Keep only the allow-listed columns of a row. */
export function pickColumns<T extends readonly string[]>(row: Record<string, unknown>, columns: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const c of columns) if (c in row) out[c] = row[c];
  return out;
}

/** Paths of any key inside a JSON value whose name looks like a requester, user id or email. */
export function findPrivateKeys(value: unknown, path = "", out: string[] = [], limit = 20): string[] {
  if (out.length >= limit || value === null || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => findPrivateKeys(v, `${path}[${i}]`, out, limit));
    return out;
  }
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (out.length >= limit) break;
    const p = path ? `${path}.${k}` : k;
    if (PRIVATE_KEY_RE.test(k)) out.push(p);
    findPrivateKeys(v, p, out, limit);
  }
  return out;
}
