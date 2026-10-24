"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import type { UnratedKind } from "@/lib/unrated-kind";
import { track } from "@/lib/analytics";

/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · The notice for a product we do not rate

   A nutraceutical or a prescription drug gets no review and no rating. Where its review would be (the product's own page, or the search box that just analysed
   it) this notice is shown instead, as a popup:
     nutraceutical     "We can't rate nutraceuticals yet", with an email box: we write when we can.
     prescription-drug "This is a prescription drug", and nothing to sign up for: we do not plan to rate those.

   mode "popup": a dialog until it is closed.  mode "page": a dialog that opens with the page, and when it is closed leaves the same words in the page, so a closed
   popup does not leave an empty page behind.
──────────────────────────────────────────────────────────────── */

const FONT_DISPLAY = "var(--font-display)";
const FONT_SANS = "var(--font-sans)";

export const UNRATED_COPY: Record<UnratedKind, { title: string; body: (name: string) => string; ask?: string }> = {
  nutraceutical: {
    title: "We can't rate nutraceuticals yet",
    body: (name) => `${name} is a nutraceutical, something you take by mouth. The Clean Sheet rates cosmetics for now, so there is no rating or review for it.`,
    ask: "Want to know when that changes? Leave your email and we'll write to you as soon as we start rating nutraceuticals.",
  },
  "prescription-drug": {
    title: "This is a prescription drug",
    body: (name) => `${name} is a prescription medicine, not a cosmetic, so we don't rate it. Use it only as your doctor has prescribed, and ask your doctor or pharmacist if you have questions about it.`,
  },
};

type Status = "idle" | "loading" | "success" | "error";

function NotifyForm({ kind, productName, brand, productSlug }: { kind: UnratedKind; productName: string; brand?: string; productSlug?: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/unrated-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kind, productName, brand, productSlug }),
      });
      if (res.ok) {
        track("unrated_notify_submitted", { kind });
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <p role="status" className="mt-4 text-sm text-[#1d6761] leading-snug" style={{ fontFamily: FONT_SANS }}>{"Thank you. We'll email you once we can rate nutraceuticals."}</p>;
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col sm:flex-row gap-2.5" style={{ fontFamily: FONT_SANS }}>
      <label htmlFor={`${id}-email`} className="sr-only">Your email</label>
      <input
        id={`${id}-email`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
        disabled={status === "loading"}
        className="flex-1 min-w-0 rounded-xl border border-[#b0a8a4]/60 bg-white px-3.5 py-3 text-[15px] text-[#282828] placeholder:text-[#b0a8a4] focus:outline-none focus:border-[#248179] disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-xl bg-[#248179] px-5 py-3 text-sm font-medium text-white whitespace-nowrap hover:bg-[#1d6e67] transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Notify me"}
      </button>
      {status === "error" && <p role="alert" className="sm:basis-full text-sm text-[#c23d35] leading-snug">Something went wrong. Please try again.</p>}
    </form>
  );
}

function Body({ kind, productName, brand, productSlug, headingId }: { kind: UnratedKind; productName: string; brand?: string; productSlug?: string; headingId: string }) {
  const copy = UNRATED_COPY[kind];
  return (
    <>
      <h2 id={headingId} className="text-[22px] text-[#282828] leading-tight mb-2.5" style={{ fontFamily: FONT_DISPLAY }}>{copy.title}</h2>
      <p className="text-[15px] text-[#4a4a4a] leading-[1.55]" style={{ fontFamily: FONT_SANS }}>{copy.body(productName)}</p>
      {copy.ask && (
        <>
          <p className="mt-3 text-[15px] text-[#282828] leading-[1.55]" style={{ fontFamily: FONT_SANS }}>{copy.ask}</p>
          <NotifyForm kind={kind} productName={productName} brand={brand} productSlug={productSlug} />
        </>
      )}
    </>
  );
}

export default function UnratedNotice({
  kind, productName, brand, productSlug, mode = "popup", onClose,
}: {
  kind: UnratedKind;
  productName: string;
  brand?: string;
  productSlug?: string;
  mode?: "popup" | "page";
  onClose?: () => void;
}) {
  const headingId = useId();
  const [open, setOpen] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = () => { setOpen(false); onClose?.(); };

  useEffect(() => { track("unrated_notice_shown", { kind }); }, [kind]);

  // While the dialog is open: Escape closes it, Tab stays inside it, the page behind does not scroll, and focus moves in (and back out on close).
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled])")];
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      before?.focus?.();
    };
    // close() only flips this component's own state and calls the parent's callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) {
    if (mode === "popup") return null;
    // Closed, on a page: the same words stay in the page.
    return (
      <section aria-labelledby={headingId} className="mx-auto w-full max-w-[560px] rounded-2xl border border-[#b0a8a4]/30 bg-white p-7 shadow-sm">
        <Body kind={kind} productName={productName} brand={brand} productSlug={productSlug} headingId={headingId} />
      </section>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center pointer-events-none">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          tabIndex={-1}
          className="pointer-events-auto relative w-full sm:w-[460px] max-h-[90vh] overflow-y-auto bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-[#b0a8a4]/20 p-7 pb-9 sm:pb-7 focus:outline-none"
        >
          <button onClick={close} className="absolute top-4 right-4 p-1.5 rounded-full text-[#b0a8a4] hover:text-[#282828] hover:bg-[#faf7f2] transition-colors" aria-label="Close">
            <X size={18} />
          </button>
          <div className="pr-6">
            <Body kind={kind} productName={productName} brand={brand} productSlug={productSlug} headingId={headingId} />
          </div>
        </div>
      </div>
    </>
  );
}
