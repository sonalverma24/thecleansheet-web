"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { GATE_COPY, decideGate, type GateReason } from "@/lib/sign-in-gate";
import { useAuth } from "./AuthProvider";

/* The sign-in gate for an interactive list (see lib/sign-in-gate.ts for the rules).

     const { signedIn, guard, openLink } = useSignInGate();
     guard("compare", () => addToComparison(id));        // runs now if signed in, else the popup
     <Link href={href} onClick={(e) => openLink(e, href)} />   // a link that needs a sign-in

   After sign-in the visitor comes back to the page they were on (or, for a link, the product
   they clicked), through the same /auth/callback route every other sign-in popup uses. */

type Pending = { reason: GateReason; action: () => void; returnPath: string };

export function useSignInGate() {
  const { user, loading, openLoginModal } = useAuth();
  const router = useRouter();
  const pending = useRef<Pending | null>(null);

  const prompt = useCallback(
    (reason: GateReason, returnPath: string) => {
      track("signin_prompted", { reason });
      openLoginModal({ returnPath, ...GATE_COPY[reason] });
    },
    [openLoginModal],
  );

  // A click that came in before the sign-in state was known is settled as soon as it is.
  useEffect(() => {
    const decision = decideGate({ user, loading });
    if (decision === "wait" || !pending.current) return;
    const { reason, action, returnPath } = pending.current;
    pending.current = null;
    if (decision === "allow") action();
    else prompt(reason, returnPath);
  }, [loading, user, prompt]);

  /** Runs `action` now for a signed-in visitor (returns true); otherwise shows the popup, which sends them back to `returnPath` (default: this page as it is) once they are in. */
  const guard = useCallback(
    (reason: GateReason, action: () => void, returnPath?: string): boolean => {
      const back = returnPath ?? `${window.location.pathname}${window.location.search}`;
      const decision = decideGate({ user, loading });
      if (decision === "allow") {
        action();
        return true;
      }
      if (decision === "wait") pending.current = { reason, action, returnPath: back };
      else prompt(reason, back);
      return false;
    },
    [user, loading, prompt],
  );

  const signedIn = !loading && !!user;

  /** For a link into a product: a signed-in visitor gets the ordinary link (new-tab clicks included); anyone else gets the popup, and lands on `href` after signing in. The `href` stays on the link for crawlers. */
  const openLink = useCallback(
    (e: MouseEvent, href: string) => {
      if (signedIn) return;
      e.preventDefault();
      guard("open-product", () => router.push(href), href);
    },
    [signedIn, guard, router],
  );

  return { signedIn, guard, openLink };
}
