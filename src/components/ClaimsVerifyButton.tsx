"use client";

import { useState } from "react";
import { X, ArrowRight } from "lucide-react";

export function ClaimsVerifyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl text-sm sm:text-base transition-all hover:shadow-2xl hover:shadow-teal-600/30 active:scale-[0.97]"
      >
        Get your claims verified today
        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl" style={{ maxHeight: "90vh" }}>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-ink-100 hover:bg-ink-200 text-ink-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <iframe
              src="https://forms.gle/h43vNq13BSS4baa77"
              title="Get your claims verified"
              className="w-full rounded-2xl"
              style={{ height: "75vh", border: "none" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
