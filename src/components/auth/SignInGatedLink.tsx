"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSignInGate } from "./useSignInGate";

/* A plain product link that asks for a sign-in when clicked. The server HTML still carries the
   real anchor and href, so crawlers and no-JS visitors reach the page as before. */
export default function SignInGatedLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const { openLink } = useSignInGate();
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => openLink(e, href)}
      onAuxClick={(e) => {
        if (e.button === 1) openLink(e, href);
      }}
    >
      {children}
    </Link>
  );
}
