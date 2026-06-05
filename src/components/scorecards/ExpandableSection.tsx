"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ExpandableSection({
  title,
  children,
  defaultOpen = false,
}: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      setHeight(contentRef.current.scrollHeight);
      // After animation, let it auto-size (for dynamic content)
      const t = setTimeout(() => setHeight(undefined), 320);
      return () => clearTimeout(t);
    } else {
      // Snapshot current height before collapsing
      setHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [open]);

  return (
    <div className="border-b border-ink-100 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-0 py-4 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-ink-800 group-hover:text-teal-700 transition-colors">
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-ink-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        ref={contentRef}
        style={{
          height: height !== undefined ? `${height}px` : "auto",
          overflow: "hidden",
          transition: "height 0.28s ease",
        }}
      >
        <div className="pb-5">{children}</div>
      </div>
    </div>
  );
}
