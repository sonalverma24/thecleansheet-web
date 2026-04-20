"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/analyzer",  label: "Ask Clean"           },
  { href: "/certified", label: "Certified Products"  },
  { href: "/brands",    label: "For Brands"          },
  { href: "/courses",   label: "Courses"             },
  { href: "/learn",     label: "Learn"               },
  { href: "/blog",      label: "Journal"             },
  { href: "/about",     label: "About"               },
];

export default function Navbar() {
  const pathname    = usePathname();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isAnalyzer = pathname === "/analyzer";

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
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="The Clean Sheet™"
                width={40}
                height={40}
                className="rounded-full group-hover:scale-105 transition-transform duration-200"
                priority
              />
              <span className="font-bold text-ink-900 tracking-tight hidden sm:block" style={{ fontFamily: "var(--font-display)" }}>
                The Clean Sheet
                <sup className="text-[9px] text-teal-500 ml-0.5 font-sans font-normal">™</sup>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname === href
                      ? "bg-teal-600 text-white"
                      : "text-ink-600 hover:text-ink-900 hover:bg-ink-50"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              {!isAnalyzer && (
                <Link
                  href="/analyzer"
                  className="flex items-center gap-1.5 bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-coral-500/30 active:scale-95"
                >
                  <Sparkles size={13} />
                  Try Ask Clean
                </Link>
              )}
              <a
                href="#get-certified"
                className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors"
              >
                Get Certified →
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-ink-700 hover:bg-ink-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-ink-100 bg-white max-h-[calc(100svh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center px-4 py-3.5 rounded-2xl text-sm font-medium transition-colors min-h-[48px] ${
                    pathname === href
                      ? "bg-teal-600 text-white"
                      : "text-ink-800 hover:bg-teal-50"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-3 border-t border-ink-100 mt-3 space-y-2">
                <Link
                  href="/analyzer"
                  className="flex items-center justify-center gap-2 w-full bg-coral-500 text-white text-sm font-semibold px-4 py-3.5 rounded-2xl min-h-[48px]"
                >
                  <Sparkles size={14} />
                  Try Ask Clean
                </Link>
                <a
                  href="#get-certified"
                  className="flex items-center justify-center gap-2 w-full border border-teal-200 text-teal-700 text-sm font-semibold px-4 py-3.5 rounded-2xl min-h-[48px] hover:bg-teal-50 transition-colors"
                >
                  Get Certified →
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
      <div className="h-16" />
    </>
  );
}
