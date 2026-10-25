/**
 * Lightweight first-touch and most-recent-identifiable-touch attribution.
 * Never stores names, email addresses, or full referrer URLs.
 * This is a best-effort browser record; private shares and cross-device magic
 * links may have no reliable source. Do not infer a named source from "direct".
 */
export type AcquisitionTouch = {
  seenAt: string;
  source: string;
  medium: string;
  campaign: string | null;
  referrerHost: string | null;
  landingPath: string;
};

export type AcquisitionState = {
  first: AcquisitionTouch;
  last: AcquisitionTouch;
};

const STORAGE_KEY = "tcs_acquisition_v1";
const INTENT_KEY = "tcs_auth_intent_v1";
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

function limited(value: string | null, length = 120): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, length) : null;
}

function referrerHost(): string | null {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname.toLowerCase();
    const own = window.location.hostname.toLowerCase();
    if (host === own || host === "thecleansheet.in" || host === "www.thecleansheet.in") return null;
    // Authentication redirects must never become marketing referral sources.
    if (host === "accounts.google.com" || host === "mail.google.com" || host.endsWith(".supabase.co")) return null;
    return limited(host);
  } catch {
    return null;
  }
}

function identify(host: string): { source: string; medium: string } {
  if (/(^|\.)google\./.test(host)) return { source: "google", medium: "organic" };
  if (/(^|\.)bing\.com$/.test(host)) return { source: "bing", medium: "organic" };
  if (/(^|\.)instagram\.com$/.test(host) || host === "l.instagram.com") return { source: "instagram", medium: "referral" };
  if (/(^|\.)facebook\.com$/.test(host) || host === "l.facebook.com") return { source: "facebook", medium: "referral" };
  if (/(^|\.)linkedin\.com$/.test(host)) return { source: "linkedin", medium: "referral" };
  if (/(^|\.)youtube\.com$/.test(host)) return { source: "youtube", medium: "referral" };
  if (host === "wa.me" || host === "web.whatsapp.com") return { source: "whatsapp", medium: "referral" };
  return { source: host, medium: "referral" };
}

function currentTouch(): { touch: AcquisitionTouch; identifiable: boolean } {
  const params = new URLSearchParams(window.location.search);
  const host = referrerHost();
  const explicitSource = limited(params.get("utm_source"));
  const explicitMedium = limited(params.get("utm_medium"));
  const campaign = limited(params.get("utm_campaign"));
  const known = host ? identify(host) : null;
  const source = explicitSource?.toLowerCase() ?? known?.source ?? "direct / unknown";
  const medium = explicitMedium?.toLowerCase() ?? known?.medium ?? "none";

  return {
    touch: {
      seenAt: new Date().toISOString(),
      source,
      medium,
      campaign,
      referrerHost: host,
      landingPath: window.location.pathname.slice(0, 500) || "/",
    },
    identifiable: !window.location.pathname.startsWith("/auth/") && Boolean(explicitSource || explicitMedium || campaign || host),
  };
}

export function readAcquisition(): AcquisitionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as AcquisitionState;
    if (!state.first?.seenAt || !state.last?.source) return null;
    const age = Date.now() - Date.parse(state.first.seenAt);
    return Number.isFinite(age) && age >= 0 && age <= MAX_AGE_MS ? state : null;
  } catch {
    return null;
  }
}

export function captureAcquisition(): AcquisitionState | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = readAcquisition();
    const { touch, identifiable } = currentTouch();
    // Never change the original first landing page. Direct revisits do not
    // displace the last identifiable referring channel.
    const state: AcquisitionState = existing
      ? { first: existing.first, last: identifiable ? touch : existing.last }
      : { first: touch, last: touch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  } catch {
    return null;
  }
}

/** Call immediately before redirecting to Google or sending an email link. */
export function noteAuthIntent(): void {
  if (typeof window === "undefined") return;
  try {
    captureAcquisition();
    window.localStorage.setItem(INTENT_KEY, JSON.stringify({
      path: window.location.pathname.slice(0, 500) || "/",
      time: Date.now(),
    }));
  } catch {
    // Browser storage is not always available.
  }
}

export function getSignupPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    const intent = JSON.parse(raw) as { path?: string; time?: number };
    if (!intent.time || Date.now() - intent.time > MAX_AGE_MS) return null;
    return intent.path?.startsWith("/") ? intent.path.slice(0, 500) : null;
  } catch {
    return null;
  }
}

export function clearAuthIntent(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(INTENT_KEY); } catch { /* no-op */ }
}
