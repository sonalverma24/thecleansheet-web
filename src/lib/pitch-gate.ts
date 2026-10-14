import { createHmac, timingSafeEqual } from "node:crypto";

/* ────────────────────────────────────────────────────────────────
   Access control for the private retailer pitch demo (src/app/x/[token]).

   Two layers, both driven by env vars so nothing secret lives in git:
     PITCH_PATH_TOKEN    the unguessable URL segment: /x/<token>
     PITCH_PASSWORD      what you type on the gate screen
     PITCH_COOKIE_SECRET HMAC key that signs the unlock cookie

   If any of the three is missing the whole feature is OFF (the route 404s),
   which is also the kill switch: delete PITCH_PATH_TOKEN and redeploy.
   Changing PITCH_COOKIE_SECRET signs everyone out.
──────────────────────────────────────────────────────────────── */

export const PITCH_COOKIE = "tcs_pg";
export const PITCH_SESSION_SECONDS = 8 * 60 * 60;

function env() {
  const token = process.env.PITCH_PATH_TOKEN;
  const password = process.env.PITCH_PASSWORD;
  const secret = process.env.PITCH_COOKIE_SECRET;
  if (!token || !password || !secret) return null;
  return { token, password, secret };
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** True when the pitch feature is configured at all. */
export function pitchEnabled(): boolean {
  return env() !== null;
}

/** Does the URL segment match the secret path token? */
export function isPitchToken(candidate: string): boolean {
  const e = env();
  return !!e && safeEqual(candidate, e.token);
}

export function checkPitchPassword(candidate: string): boolean {
  const e = env();
  return !!e && safeEqual(candidate, e.password);
}

function sign(expiry: string, secret: string): string {
  return createHmac("sha256", secret).update(`pitch.${expiry}`).digest("hex");
}

/** Cookie value: "<expiry-epoch-seconds>.<hmac>". */
export function mintPitchCookie(): string | null {
  const e = env();
  if (!e) return null;
  const expiry = String(Math.floor(Date.now() / 1000) + PITCH_SESSION_SECONDS);
  return `${expiry}.${sign(expiry, e.secret)}`;
}

export function verifyPitchCookie(value: string | undefined): boolean {
  const e = env();
  if (!e || !value) return false;
  const [expiry, sig] = value.split(".");
  if (!expiry || !sig) return false;
  if (Number(expiry) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, sign(expiry, e.secret));
}
