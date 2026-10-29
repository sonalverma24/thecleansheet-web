import Link from "next/link";

/* The four pages that no longer sit in the desktop top nav. Every one is one
   click from the home page, on mobile too. */

const LINKS = [
  { href: "/products", eyebrow: "ANALYSER", title: "Every product we’ve analysed", note: "Browse the public registry." },
  { href: "/standard", eyebrow: "THE STANDARD", title: "How we judge a claim", note: "The framework, in the open." },
  { href: "/verify", eyebrow: "VERIFY", title: "Check a seal", note: "Confirm a product’s status." },
  { href: "/about", eyebrow: "ABOUT", title: "Why we exist", note: "Evidence over marketing." },
];

export default function MoreFromTcs() {
  return (
    <section aria-labelledby="more-from-tcs" className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
      <h2 id="more-from-tcs" className="sr-only">More from The Clean Sheet</h2>
      <div className="grid grid-cols-1 gap-px bg-[#e5dfd6] border border-[#e5dfd6] rounded-[14px] overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group bg-white p-6 flex flex-col gap-2 transition-colors hover:bg-[#e3f1ef]"
          >
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#248179]">{l.eyebrow}</span>
            <span className="font-display font-light text-[22px] leading-[1.15] text-[#282828]">{l.title}</span>
            <span className="flex justify-between items-center text-[13px] text-[#4a4a4a]">
              {l.note}
              <span aria-hidden className="font-bold text-[#248179] transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
