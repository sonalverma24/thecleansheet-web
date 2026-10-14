import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  PITCH_COOKIE,
  PITCH_SESSION_SECONDS,
  checkPitchPassword,
  isPitchToken,
  mintPitchCookie,
} from "@/lib/pitch-gate";

/* Unlocks the private areas: the retailer pitch demo (/x/<token>) and the
   private client previews (/preview/*). The pitch demo also needs its secret
   path token; a preview page's secret is its own URL, so it needs only the
   password. Every failure returns the same generic 404 so the endpoint reveals
   nothing about which half was wrong. */
export async function POST(req: Request) {
  if (!rateLimit(req, "pitch-unlock", 5)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { token?: unknown; password?: unknown; scope?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  const tokenOk = body.scope === "preview" || isPitchToken(token);
  if (!tokenOk || !checkPitchPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const value = mintPitchCookie();
  if (!value) return NextResponse.json({ ok: false }, { status: 404 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PITCH_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PITCH_SESSION_SECONDS,
  });
  return res;
}
