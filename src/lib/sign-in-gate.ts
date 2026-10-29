/* The sign-in gate on the product list (/brands).

   Looking at the list is open to everyone. Doing anything with it (opening a product, adding it
   to a comparison, searching, sorting or narrowing the list) needs a signed-in visitor. This file
   holds the two plain facts the gate needs, so they can be tested without a browser: what to do
   with a click, given what is known about the visitor, and the words the sign-in popup uses for
   each thing they tried. The hook that applies them is `useSignInGate`. */

/** What the visitor was trying to do when the popup came up. */
export type GateReason = "open-product" | "compare" | "filter" | "search" | "sort";

/**
 * `allow`: signed in, carry on. `prompt`: not signed in, show the popup.
 * `wait`: the sign-in state has not been read yet, so decide once it has (a signed-in visitor
 * must never be asked to sign in, and a signed-out one must not slip through on a fast click).
 */
export type GateDecision = "allow" | "prompt" | "wait";

export function decideGate(auth: { user: object | null; loading: boolean }): GateDecision {
  if (auth.loading) return "wait";
  return auth.user ? "allow" : "prompt";
}

/** Popup words per reason. They say what the visitor tried and that looking around stays open; "analysis", never "review". */
export const GATE_COPY: Record<GateReason, { title: string; subtitle: string }> = {
  "open-product": {
    title: "Sign in to open this analysis",
    subtitle: "Browsing the list is open to everyone. Sign in to read a product's full analysis.",
  },
  compare: {
    title: "Sign in to compare products",
    subtitle: "Browsing the list is open to everyone. Sign in to put products side by side.",
  },
  filter: {
    title: "Sign in to filter products",
    subtitle: "Browsing the list is open to everyone. Sign in to narrow it by rating, type, brand and price.",
  },
  search: {
    title: "Sign in to search",
    subtitle: "Browsing the list is open to everyone. Sign in to search the analyses by name, brand or ingredient.",
  },
  sort: {
    title: "Sign in to sort products",
    subtitle: "Browsing the list is open to everyone. Sign in to change the order of the list.",
  },
};
