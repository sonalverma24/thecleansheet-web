"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowRight, X } from "lucide-react";

const FORM_URL = "https://forms.gle/g3D4CEjsiUGLchbo7";
const TRIGGER_HASH = "#get-certified";

export default function FormModal() {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);

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
    // Also listen for a custom event so client components can trigger without hash navigation
    window.addEventListener("openCertifyForm", openModal);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("openCertifyForm", openModal);
    };
  }, [openModal]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-black/30 w-full max-w-xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 flex-shrink-0">
          <div>
            <p className="font-bold text-ink-950 text-sm">The Clean Sheet™</p>
            <p className="text-ink-400 text-xs mt-0.5">Certification Application</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 text-xs font-semibold flex items-center gap-1 transition-colors"
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

        {/* Form iframe */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 520 }}>
          <iframe
            src={FORM_URL}
            title="The Clean Sheet™ Certification Application"
            className="w-full h-full border-0"
            style={{ minHeight: 520 }}
            allow="clipboard-write"
          />
        </div>
      </div>
    </div>
  );
}
