"use client";

import { useState } from "react";
import { X, Download, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type Props = {
  guideName: string;
  guideFile: string;
  onClose: () => void;
};

export default function DownloadLeadModal({ guideName, guideFile, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    setError("");
    setLoading(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim(), guide: guideName }),
      });
    } catch {
      // Silently continue — user still gets their download
    }

    setDone(true);
    setLoading(false);

    // Trigger download
    const link = document.createElement("a");
    link.href = guideFile;
    link.download = `The Clean Sheet - ${guideName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet / Modal */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-teal-400 via-teal-600 to-teal-800" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ink-100 hover:bg-ink-200 flex items-center justify-center transition-colors z-10"
          aria-label="Close"
        >
          <X size={14} className="text-ink-600" />
        </button>

        <div className="px-6 pt-6 pb-8">
          {!done ? (
            <>
              <div className="mb-5">
                <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-1">Free Download</p>
                <h2 className="text-xl font-bold text-ink-950 leading-tight">
                  The Clean Sheet™ Guide to {guideName}
                </h2>
                <p className="text-sm text-ink-500 mt-2 leading-relaxed">
                  Enter your details and we&apos;ll send your download instantly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    Email address <span className="text-coral-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full border border-teal-100 focus:border-teal-400 rounded-xl px-4 py-3 text-sm text-ink-900 placeholder-ink-300 outline-none transition-colors bg-teal-50/30 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    Phone number <span className="text-ink-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-teal-100 focus:border-teal-400 rounded-xl px-4 py-3 text-sm text-ink-900 placeholder-ink-300 outline-none transition-colors bg-teal-50/30 focus:bg-white"
                  />
                </div>

                {error && <p className="text-xs text-coral-500 font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold py-3.5 rounded-xl transition-colors text-sm mt-1"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Preparing your guide…</>
                  ) : (
                    <><Download size={15} /> Download Guide <ArrowRight size={14} /></>
                  )}
                </button>

                <p className="text-[11px] text-ink-400 text-center leading-relaxed">
                  No spam. We&apos;ll only send you content from The Clean Sheet™.
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-ink-950 mb-2">Your guide is downloading!</h2>
              <p className="text-sm text-ink-500 leading-relaxed mb-6">
                The Clean Sheet™ Guide to {guideName} should appear in your downloads.
              </p>
              <button
                onClick={onClose}
                className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
