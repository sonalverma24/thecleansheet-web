"use client";

import { type ReactNode } from "react";

export default function OpenFormButton({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("openCertifyForm"))}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}
