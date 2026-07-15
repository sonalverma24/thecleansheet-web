"use client";

/* ────────────────────────────────────────────────────────────────
   Verified Products — shared UI
   Used on /review (registry band) and /verified (public page).
   Dark editorial sheet: thin rules, status dots, usage guidance.
──────────────────────────────────────────────────────────────── */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { VerifiedProduct, UsageGuidance } from "@/lib/types";

const INK = "#282828";
const CREAM = "#fcf9f8";
const TEAL_SOFT = "#80d5cc";
const CORAL = "#fd6158";
const LIME = "#d2ff34";
const WARM = "#b0a8a4";
const HAIR_DARK = "rgba(252,249,248,0.14)";

function scoreColorDark(s: number) {
  if (s >= 70) return LIME;
  if (s >= 45) return TEAL_SOFT;
  return CORAL;
}

function StatusDot({ color, solid = true }: { color: string; solid?: boolean }) {
  return (
    <span
      className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0"
      style={solid ? { background: color } : { border: `1px solid ${color}` }}
    />
  );
}

function Eyebrow({ children, color = WARM }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-[12px] uppercase" style={{ color, letterSpacing: "0.14em" }}>
      {children}
    </p>
  );
}

export function GuidanceBlock({ guidance }: { guidance: UsageGuidance }) {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-x-14 gap-y-8">
        <div>
          {guidance.howToUse?.length > 0 && (
            <div className="flex flex-col gap-4">
              {guidance.howToUse.map((step, i) => (
                <p key={i} className="flex items-baseline gap-4 text-[15px] leading-relaxed" style={{ color: CREAM }}>
                  <span className="text-[12px] flex-shrink-0" style={{ color: LIME }}>{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </p>
              ))}
            </div>
          )}
          {guidance.frequency && (
            <p className="mt-5 text-[13px] uppercase" style={{ letterSpacing: "0.1em", color: WARM }}>
              Frequency · <span style={{ color: CREAM, textTransform: "none", letterSpacing: 0 }}>{guidance.frequency}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-6">
          {guidance.pairWith?.length > 0 && (
            <div>
              <p className="text-[12px] uppercase pb-3" style={{ letterSpacing: "0.12em", color: LIME }}>Pair with</p>
              {guidance.pairWith.map((p, i) => (
                <p key={i} className="flex items-baseline gap-3 py-1.5 text-[14px] leading-relaxed" style={{ color: CREAM }}>
                  <StatusDot color={LIME} />{p}
                </p>
              ))}
            </div>
          )}
          {guidance.avoidWith?.length > 0 && (
            <div>
              <p className="text-[12px] uppercase pb-3" style={{ letterSpacing: "0.12em", color: CORAL }}>Avoid with</p>
              {guidance.avoidWith.map((p, i) => (
                <p key={i} className="flex items-baseline gap-3 py-1.5 text-[14px] leading-relaxed" style={{ color: CREAM }}>
                  <StatusDot color={CORAL} />{p}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
      {guidance.proTip && (
        <p className="mt-8 text-[14px] leading-relaxed max-w-2xl" style={{ color: TEAL_SOFT }}>
          🇮🇳 {guidance.proTip}
        </p>
      )}
    </div>
  );
}

export function VerifiedRow({ p }: { p: VerifiedProduct }) {
  const [open, setOpen] = useState(false);
  const col = scoreColorDark(p.score);
  return (
    <div style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
      <button onClick={() => setOpen(!open)} className="w-full text-left py-6 flex items-center gap-5 md:gap-7">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.productName}
            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl flex-shrink-0"
            style={{ border: `1px solid ${HAIR_DARK}` }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ border: `1px solid ${HAIR_DARK}`, background: "rgba(252,249,248,0.04)" }} aria-hidden>
            <span className="font-display text-[28px] md:text-[34px] leading-none" style={{ color: TEAL_SOFT }}>
              {(p.brand || p.productName || "?").trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {p.brand && <p className="text-[12px] uppercase pb-1" style={{ letterSpacing: "0.1em", color: WARM }}>{p.brand}</p>}
          <p className="font-display text-[20px] md:text-[24px] leading-tight" style={{ color: CREAM }}>{p.productName}</p>
        </div>
        <div className="flex items-center gap-5 flex-shrink-0">
          <span className="hidden sm:inline-flex text-[11px] uppercase px-3.5 py-1.5 rounded-full" style={{ letterSpacing: "0.1em", background: col, color: INK }}>
            ✓ Verified
          </span>
          <span className="text-[18px] leading-none transition-transform duration-300" style={{ color: WARM, transform: open ? "rotate(45deg)" : "none", display: "inline-block" }}>+</span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }} className="overflow-hidden">
            <div className="pb-10 max-w-3xl">
              {p.summary && <p className="text-[15px] leading-[1.7] pb-8" style={{ color: WARM }}>{p.summary}</p>}
              {p.usageGuidance ? (
                <>
                  <Eyebrow color={LIME}>How to use it right</Eyebrow>
                  <div className="mt-5">
                    <GuidanceBlock guidance={p.usageGuidance} />
                  </div>
                </>
              ) : (
                <p className="text-[14px]" style={{ color: WARM }}>Usage guidance will appear after this product&apos;s next review.</p>
              )}
              <p className="pt-8 text-[12px]" style={{ color: WARM }}>
                Verified {new Date(p.verifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {p.methodologyVersion}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function VerifiedList({ products }: { products: VerifiedProduct[] }) {
  if (products.length === 0) {
    return (
      <p className="text-[15px] leading-[1.7] max-w-xl" style={{ color: WARM }}>
        The registry is filling up. Products that clear The Clean Sheet bar in a full
        review appear here automatically, with exact usage guidance.
      </p>
    );
  }
  return (
    <div>
      {products.map((p) => <VerifiedRow key={p.slug} p={p} />)}
      <div style={{ borderTop: `1px solid ${HAIR_DARK}` }} />
    </div>
  );
}

export { INK as VERIFIED_INK, CREAM as VERIFIED_CREAM, WARM as VERIFIED_WARM, LIME as VERIFIED_LIME };
