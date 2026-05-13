"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import Image from "next/image";

const LINKS = {
  Platform: [
    { href: "/analyzer",      label: "Ask Clean"           },
    { href: "/certified",     label: "Certified Products"  },
    { href: "/brands",        label: "For Brands"          },
    { href: "/certification", label: "Certification"       },
    { href: "/learn",         label: "Learn"               },
  ],
  Learn: [
    { href: "/ingredients",         label: "Ingredient Glossary"  },
    { href: "/learn#scoring",       label: "How We Score"         },
    { href: "/learn#inci",          label: "Understanding INCI"   },
    { href: "/learn#india",         label: "India Regulations"    },
  ],
  Company: [
    { href: "/about",         label: "About Us"            },
    { href: "/about",         label: "Our Mission"         },
    { href: "/contact",       label: "Contact"             },
    { href: "/privacy-policy",label: "Privacy Policy"      },
    { href: "/terms-of-use",  label: "Terms of Use"        },
    { href: "/disclaimer",    label: "Disclaimer"          },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-teal-950 text-teal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-12 sm:mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group w-fit">
              <Image
                src="/logo.png"
                alt="The Clean Sheet™"
                width={44}
                height={44}
                className="rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <span
                className="font-medium text-white text-lg tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                The Clean Sheet
                <sup className="text-[9px] text-teal-400 ml-0.5 font-sans font-normal">™</sup>
              </span>
            </Link>
            <p className="text-teal-400 text-sm leading-relaxed max-w-xs mb-6">
              India's first science-backed certification standard for beauty and personal care products.
              Evidence over marketing. Always.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://thecleansheet.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="w-9 h-9 rounded-xl bg-teal-800 hover:bg-teal-700 flex items-center justify-center transition-colors"
              >
                <Globe size={15} className="text-teal-300" />
              </a>
              <a
                href="https://www.instagram.com/thecleansheet.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-teal-800 hover:bg-teal-700 flex items-center justify-center transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-300">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@thecleansheetindia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-teal-800 hover:bg-teal-700 flex items-center justify-center transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-300">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Nav columns */}
          <div className="md:contents grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(LINKS).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-normal text-xs uppercase tracking-widest mb-4" style={{ color: "#ffffff" }}>
                  {category}
                </h3>
                <ul className="space-y-2.5">
                  {items.map(({ href, label }) => (
                    <li key={label}>
                      <Link href={href} className="text-teal-400 hover:text-teal-200 text-sm transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Apply CTA column */}
            <div>
              <h3 className="font-normal text-xs uppercase tracking-widest mb-4" style={{ color: "#ffffff" }}>
                Certification
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => window.dispatchEvent(new Event("openCertifyForm"))}
                    className="text-teal-400 hover:text-teal-200 text-sm transition-colors text-left"
                  >
                    Apply for Certification
                  </button>
                </li>
                <li>
                  <Link href="/certification" className="text-teal-400 hover:text-teal-200 text-sm transition-colors">
                    How it Works
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-teal-800 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-teal-600 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} The Clean Sheet™. All rights reserved. Est. 2025, India.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6">
            <Link href="/contact" className="text-teal-600 hover:text-teal-400 text-xs transition-colors">Contact</Link>
            <a href="mailto:hello@thecleansheet.in" className="text-teal-600 hover:text-teal-400 text-xs transition-colors">hello@thecleansheet.in</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
