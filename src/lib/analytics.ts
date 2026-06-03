/**
 * Lightweight analytics stub.
 * Logs to console now; swap the body for real analytics (GA4, Mixpanel, PostHog) later.
 */
export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  console.log("[TCS]", event, data ?? {});
  // Example swap-in:
  // window.gtag?.("event", event, data);
}
