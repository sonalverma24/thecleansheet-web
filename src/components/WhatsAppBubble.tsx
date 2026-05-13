"use client";

import { useState } from "react";

const WA_LINK = "https://chat.whatsapp.com/BUvEDcUj9Dh14dwSVRVvu4";

export default function WhatsAppBubble() {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Expanded card */}
      <div
        className={`transition-all duration-300 origin-bottom-right ${
          expanded
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/15 border border-green-100 w-60 sm:w-64 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <WhatsAppIcon size={18} className="text-white" />
              <span className="text-white text-xs font-medium tracking-wide">WhatsApp Community</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
              className="text-white/70 hover:text-white transition-colors text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          {/* Body */}
          <div className="px-4 py-3.5">
            <p className="text-ink-800 text-[13px] font-normal leading-snug mb-1">
              Join The Clean Sheet™ community
            </p>
            <p className="text-ink-400 text-[11px] leading-relaxed mb-3.5">
              Science-backed beauty tips, ingredient alerts, and early access. Straight to your WhatsApp.
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-medium py-2.5 rounded-xl transition-colors"
            >
              <WhatsAppIcon size={13} className="text-white" />
              Join for free →
            </a>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join The Clean Sheet WhatsApp Community"
        className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl shadow-green-500/30 transition-transform duration-200 hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: "#25D366" }} />
        <WhatsAppIcon size={26} className="text-white relative z-10" />
      </a>
    </div>
  );
}

function WhatsAppIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
