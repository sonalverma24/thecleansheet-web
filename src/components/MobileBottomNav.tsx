"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShieldCheck, BookOpen, Info } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          label: "Home",      icon: Home        },
  { href: "/standard",  label: "Standard",  icon: ShieldCheck },
  { href: "/education", label: "Education", icon: BookOpen    },
  { href: "/verify",    label: "Verify",    icon: Search      },
  { href: "/about",     label: "About",     icon: Info        },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin, auth, onboarding, and analyzer full-screen pages
  const hidden = ["/admin", "/auth", "/onboarding"].some(p => pathname.startsWith(p));
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-[#b0a8a4]/20">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 py-2.5 min-h-[56px] transition-colors duration-150 ${
                active ? "text-[#248179]" : "text-[#b0a8a4]"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={active ? 1.75 : 1.5}
                className="transition-transform duration-150"
                style={{ transform: active ? "scale(1.05)" : "scale(1)" }}
              />
              <span
                className="text-[10px] tracking-wide"
                style={{
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontWeight: 400,
                  color: active ? "#248179" : "#b0a8a4",
                }}
              >
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-[2px] bg-[#248179] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
      {/* iOS safe area */}
      <div className="h-safe-bottom bg-white" />
    </nav>
  );
}
