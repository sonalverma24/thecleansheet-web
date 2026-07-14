"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/brands",        label: "Scorecards"   },
  { href: "/review",        label: "Review"       },
  { href: "/services",      label: "Services"      },
  { href: "/learn",         label: "Learn"        },
  { href: "/blog",          label: "Reads"        },
  { href: "/about",         label: "About"        },
];

export default function Navbar() {
  const pathname    = usePathname();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  // Hide desktop navbar spacer on mobile (bottom nav handles it there)
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "glass shadow-sm shadow-ink-200/40"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="The Clean Sheet™"
                width={56}
                height={56}
                className="rounded-full group-hover:scale-110 transition-transform duration-200"
                priority
              />
              <span className="text-[17px] font-semibold text-ink-900 tracking-tight hidden sm:block" style={{ fontFamily: "var(--font-display)" }}>
                The Clean Sheet
                <sup className="text-[9px] text-teal-500 ml-0.5 font-sans font-normal">™</sup>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(({ href, label }) => {
                const active = href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-2 rounded-full text-[13px] transition-all duration-200 ${
                      active
                        ? "text-[#248179] bg-[#248179]/8"
                        : "text-[#282828]/70 hover:text-[#282828] hover:bg-black/4"
                    }`}
                    style={{ fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 400 }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right CTAs */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/account"
                className="p-2 rounded-full text-[#b0a8a4] hover:text-[#282828] transition-colors"
                aria-label="Account"
              >
                <User size={18} strokeWidth={1.5} />
              </Link>
              <Link
                href="/for-brands"
                className="text-[13px] text-white bg-[#fd6158] hover:bg-[#e8564e] px-4 py-2 rounded-full transition-all duration-200"
                style={{ fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 400 }}
              >
                Get Certified
              </Link>
            </div>

            {/* Mobile hamburger - shown on md and below, but only on desktop-first pages */}
            <button
              className="lg:hidden p-2 rounded-xl text-[#b0a8a4] hover:bg-black/4 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#b0a8a4]/20 bg-white">
            <div className="px-4 py-3 space-y-0.5">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center px-4 py-3.5 rounded-2xl text-[14px] transition-colors min-h-[48px] ${
                      active
                        ? "text-[#248179] bg-[#248179]/8"
                        : "text-[#282828] hover:bg-black/4"
                    }`}
                    style={{ fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 400 }}
                  >
                    {label}
                  </Link>
                );
              })}
              <div className="pt-2 pb-1 border-t border-[#b0a8a4]/20 mt-2 flex flex-col gap-2">
                <Link
                  href="/account"
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-[14px] text-[#282828] border border-[#b0a8a4]/30 min-h-[48px] transition-colors hover:bg-black/4"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 400 }}
                >
                  <User size={16} strokeWidth={1.5} />
                  Account
                </Link>
                <Link
                  href="/for-brands"
                  className="flex items-center justify-center px-4 py-3.5 rounded-2xl text-[14px] text-white bg-[#fd6158] min-h-[48px] transition-colors hover:bg-[#e8564e]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 400 }}
                >
                  Get Certified
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      {/* Spacer - desktop only (mobile uses bottom nav) */}
      <div className="h-16 hidden lg:block" />
    </>
  );
}
