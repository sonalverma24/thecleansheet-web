"use client";
import { useState } from "react";
import { X, Send } from "lucide-react";
import { track } from "@/lib/analytics";

interface ProductRequestFormProps {
  defaultProductName?: string;
  onClose: () => void;
}

export function ProductRequestForm({
  defaultProductName = "",
  onClose,
}: ProductRequestFormProps) {
  const [productName, setProductName] = useState(defaultProductName);
  const [brandName, setBrandName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !brandName.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/product-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, brandName, productUrl, reason }),
      });
      if (res.ok) {
        setStatus("success");
        track("product_review_requested", { productName, brandName });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-ink-100 transition-colors"
          aria-label="Close"
        >
          <X size={16} className="text-ink-500" />
        </button>

        {status === "success" ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-4">✓</div>
            <h3 className="font-medium text-ink-900 mb-2">Request received</h3>
            <p className="text-sm text-ink-500 mb-6">
              We&apos;ll review your request and aim to publish a scorecard for this product.
            </p>
            <button
              onClick={onClose}
              className="text-sm text-teal-600 hover:text-teal-800 underline"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="font-medium text-ink-900 mb-1.5">Request a scorecard review</h3>
            <p className="text-xs text-ink-500 mb-5">
              We&apos;ll add it to our review queue and publish a full evidence-based scorecard.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Product name <span className="text-coral-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  placeholder="e.g. Hyaluronic Acid 2% Serum"
                  className="w-full border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Brand name <span className="text-coral-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  placeholder="e.g. The Ordinary"
                  className="w-full border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Product URL <span className="text-ink-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="Nykaa, Amazon, or brand website"
                  className="w-full border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Why do you want this reviewed? <span className="text-ink-400">(optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. I want to know if the fragrance is skin-safe for my daughter"
                  className="w-full border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 resize-none"
                />
              </div>
            </div>

            {status === "error" && (
              <p className="text-xs text-coral-600 mt-3">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !productName.trim() || !brandName.trim()}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-ink-200 disabled:text-ink-400 text-white text-sm font-medium py-3 rounded-xl transition-colors"
            >
              {status === "loading" ? (
                "Submitting..."
              ) : (
                <>
                  <Send size={14} />
                  Submit request
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
