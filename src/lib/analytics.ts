/**
 * Analytics dispatcher.
 *
 * Forwards custom events to the two trackers loaded globally in layout.tsx:
 *   - GA4  via window.gtag('event', name, params)
 *   - Meta Pixel via window.fbq('trackCustom', name, params)
 *
 * Both are loaded with strategy="afterInteractive", so on very early clicks the
 * globals may not exist yet — the optional-chaining calls no-op safely in that
 * window. In dev we also log to the console for quick inspection.
 */

type GtagFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;
type FbqFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    fbq?: FbqFn;
  }
}

export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const params = data ?? {};

  if (process.env.NODE_ENV !== "production") {
    console.log("[TCS]", event, params);
  }

  try {
    window.gtag?.("event", event, params);
  } catch {
    /* tracker not ready or blocked — ignore */
  }
  try {
    window.fbq?.("trackCustom", event, params);
  } catch {
    /* tracker not ready or blocked — ignore */
  }
}
