"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => el.classList.add("is-revealed"), delay);
          observer.unobserve(el);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -28px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal-hidden ${className}`}>
      {children}
    </div>
  );
}
