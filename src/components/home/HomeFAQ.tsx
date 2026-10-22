import { ChevronRight } from "lucide-react";

export default function HomeFAQ({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <section className="bg-white border-t border-[#e5dfd6]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <p className="text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-[#248179] text-center mb-4">COMMON QUESTIONS</p>
        <h2 className="font-display font-light text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-0.01em] text-[#282828] text-center mb-10">
          Everything you wanted to know about clean beauty in India
        </h2>
        <div className="divide-y divide-[#e5dfd6] border border-[#e5dfd6] rounded-[14px] overflow-hidden bg-white">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none hover:bg-[#e3f1ef]/50 transition-colors">
                <span className="font-bold text-[15px] sm:text-[16px] text-[#282828]">{q}</span>
                <ChevronRight size={16} className="text-[#248179] flex-shrink-0 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-5 text-[#4a4a4a] leading-relaxed text-[14px] sm:text-[15px]">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
