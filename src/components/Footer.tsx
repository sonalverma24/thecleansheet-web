"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import Image from "next/image";

const LINKS = {
  Standard: [
    { href: "/standard",          label: "The Standard"        },
    { href: "/standard/claims",   label: "Claims Library"      },
    { href: "/standard/register", label: "Standards Register"  },
  ],
  Verify: [
    { href: "/brands",   label: "Check a Product"           },
    { href: "/verify",   label: "Certified Registry (soon)" },
  ],
  Education: [
    { href: "/learn",        label: "Learn"               },
    { href: "/blog",         label: "Reads"               },
    { href: "/ingredients",  label: "Ingredient Glossary" },
  ],
  About: [
    { href: "/about",          label: "About"          },
    { href: "/for-brands",     label: "For Brands"     },
    { href: "/contact",        label: "Contact"        },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-use",   label: "Terms of Use"   },
    { href: "/disclaimer",     label: "Disclaimer"     },
  ],
};

const SOCIAL = "w-9 h-9 rounded-lg border border-[#e5dfd6] hover:bg-[#e3f1ef] hover:border-[#248179] flex items-center justify-center transition-colors text-[#248179]";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e5dfd6]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-28 md:pt-16 md:pb-16">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-12 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 w-fit">
              <Image src="/logo.png" alt="The Clean Sheet™" width={44} height={44} className="rounded-full" />
              <span className="font-display font-light text-[22px] leading-none tracking-[-0.01em] text-[#282828]">
                The Clean Sheet<sup className="text-[9px] text-[#248179] ml-0.5">™</sup>
              </span>
            </Link>
            <p className="text-[#4a4a4a] text-sm leading-relaxed max-w-xs mb-6">
              Building independent evidence infrastructure for beauty and personal care.
              Evidence over marketing, always.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a href="https://thecleansheet.in" target="_blank" rel="noopener noreferrer" aria-label="Website" className={SOCIAL}>
                <Globe size={15} />
              </a>
              <a href="https://www.instagram.com/thecleansheet.in" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={SOCIAL}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@thecleansheetindia" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={SOCIAL}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Nav columns */}
          <div className="md:contents grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(LINKS).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-sans font-bold text-[11px] uppercase tracking-[0.18em] mb-4 text-[#282828]">
                  {category}
                </h3>
                <ul className="space-y-2.5">
                  {items.map(({ href, label }) => (
                    <li key={label}>
                      <Link href={href} className="text-[#4a4a4a] hover:text-[#248179] text-sm transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#e5dfd6] pt-8">
          <p className="text-[#4a4a4a] text-xs leading-relaxed max-w-3xl mb-6">
            Private certification framework. The Clean Sheet is an
            independent private certification designed in alignment with ISO/IEC 17065
            and ISO/IEC 17067. The certification framework is independently validated with industry experts.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-[#b0a8a4] tracking-[0.04em]">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} The Clean Sheet™. All rights reserved.
            </p>
            <p className="text-center">www.thecleansheet.in</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6">
              <Link href="/contact" className="hover:text-[#248179] transition-colors">Contact</Link>
              <a href="mailto:hello@thecleansheet.in" className="hover:text-[#248179] transition-colors">hello@thecleansheet.in</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
