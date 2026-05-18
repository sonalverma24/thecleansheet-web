"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowRight, X, Loader2 } from "lucide-react";

const FORM_URL  = "https://docs.google.com/forms/d/e/1FAIpQLScJoHJxzWCK4Cg6B_e7AIp2FArk1hbiurKbwqx7gSrKY2sdFw/viewform?embedded=true";
const FORM_FULL = "https://docs.google.com/forms/d/e/1FAIpQLScJoHJxzWCK4Cg6B_e7AIp2FArk1hbiurKbwqx7gSrKY2sdFw/viewform?usp=send_form";
const TRIGGER_HASH = "#get-certified";

export default function FormModal() {
  const [open,    setOpen]    = useState(false);
  const [loaded,  setLoaded]  = useState(false);

  const openModal = useCallback(() => {
    setLoaded(false); // reset loader each time modal opens
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    if (typeof window !== "undefined" && window.location.hash === TRIGGER_HASH) {
      history.pushState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === TRIGGER_HASH) openModal();
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    window.addEventListener("openCertifyForm", openModal);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("openCertifyForm", openModal);
    };
  }, [openModal]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ animation: "tcs-modalIn 0.2s ease both" }}>
      <style>{`
        @keyframes tcs-modalIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes tcs-slideUp   { from { opacity:0; transform:translateY(20px) scale(0.98) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl shadow-black/30 w-full max-w-xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh", animation: "tcs-slideUp 0.25s cubic-bezier(0.4,0,0.2,1) both" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 flex-shrink-0">
          <div>
            <p className="font-medium text-ink-950 text-sm">The Clean Sheet™</p>
            <p className="text-ink-400 text-xs mt-0.5">Certification Application</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={FORM_FULL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 text-xs font-normal flex items-center gap-1 transition-colors"
            >
              Open in new tab <ArrowRight size={11} />
            </a>
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-ink-100 hover:bg-ink-200 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X size={14} className="text-ink-600" />
            </button>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 relative" style={{ minHeight: 540 }}>

          {/* Loading skeleton, shown until iframe fires onLoad */}
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10">
              <Loader2 size={28} className="text-teal-500 animate-spin" />
              <p className="text-ink-400 text-sm">Loading form…</p>
            </div>
          )}

          <iframe
            src={FORM_URL}
            title="The Clean Sheet™ Certification Application"
            onLoad={() => setLoaded(true)}
            className="w-full border-0 transition-opacity duration-300"
            style={{ height: 540, opacity: loaded ? 1 : 0 }}
            allow="clipboard-write"
          />
        </div>
      </div>
    </div>
  );
}
