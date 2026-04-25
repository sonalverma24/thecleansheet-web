import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, Sun, Moon, FlaskConical } from "lucide-react";
import { getGuideBySlug, getAllGuideSlugs } from "@/lib/skin-guides";

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: `${guide.title}, The Clean Sheet™`,
    description: guide.tagline,
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-teal-100">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${guide.accentFrom} ${guide.accentTo} opacity-[0.07]`} />

        {/* Decorative molecule graphic (same as analyzer page) */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.04] pointer-events-none select-none" aria-hidden>
          <svg width="100%" height="100%" viewBox="0 0 480 480" fill="none">
            {[[60,120,160,80],[160,80,260,140],[260,140,360,80],[360,80,440,140],
              [160,80,140,20],[360,80,380,20],[260,140,260,240],[160,80,100,160],
              [260,240,200,320],[260,240,320,320]].map(([x1,y1,x2,y2],i)=>(
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0d9488" strokeWidth="1.5" strokeDasharray="4 4"/>
            ))}
            {[{cx:60,cy:120,r:5},{cx:160,cy:80,r:7},{cx:260,cy:140,r:6},{cx:360,cy:80,r:7},
              {cx:440,cy:140,r:5},{cx:140,cy:20,r:4},{cx:380,cy:20,r:4},{cx:260,cy:240,r:6},
              {cx:100,cy:160,r:4},{cx:200,cy:320,r:4},{cx:320,cy:320,r:4}].map(({cx,cy,r},i)=>(
              <circle key={i} cx={cx} cy={cy} r={r} fill="#0d9488" fillOpacity="0.5"/>
            ))}
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">
          <Link
            href="/learn#skin-type-guides"
            className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Learn
          </Link>

          <div className="inline-flex items-center gap-2 text-teal-600 bg-teal-50 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <FlaskConical size={12} />
            Skin Type Guide · The Clean Sheet™
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-ink-950 tracking-tight leading-tight mb-4">
            {guide.skinType}
          </h1>
          <p className="text-xl text-ink-600 leading-relaxed max-w-2xl mb-8">
            {guide.tagline}
          </p>

          {/* Silver lining card */}
          <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex gap-3 max-w-2xl">
            <Sparkles size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-teal-800 leading-relaxed">
              <strong className="font-semibold">The upside: </strong>{guide.silverLining}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {/* ── 1. Understanding ── */}
        <section>
          <SectionLabel number="01" label="Understanding Your Skin" />
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {guide.causes.map(({ label, items }) => (
              <div key={label} className="bg-white rounded-3xl border border-teal-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4">{label}</h3>
                <ul className="space-y-3">
                  {items.map((item, i) => {
                    const [head, ...rest] = item.split(": ");
                    return (
                      <li key={i} className="flex gap-2.5 text-sm text-ink-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-2" />
                        <span>
                          {rest.length ? <><strong className="text-ink-900">{head}:</strong> {rest.join(": ")}</> : item}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. Essential Habits ── */}
        <section>
          <SectionLabel number="02" label="Essential Habits & Hygiene" />
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guide.habits.map((habit, i) => {
              const [head, ...rest] = habit.split(": ");
              return (
                <div key={i} className="bg-white rounded-2xl border border-teal-100 p-4 shadow-sm flex gap-3">
                  <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-700 leading-relaxed">
                    {rest.length ? <><strong className="text-ink-900">{head}:</strong> {rest.join(": ")}</> : habit}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. Mistakes ── */}
        <section>
          <SectionLabel number="03" label="Common Mistakes to Avoid" />
          <div className="mt-6 space-y-3">
            {guide.mistakes.map((mistake, i) => {
              const [head, ...rest] = mistake.split(": ");
              return (
                <div key={i} className="bg-caution-100/60 border border-caution-500/20 rounded-2xl px-5 py-4 flex gap-3">
                  <AlertTriangle size={15} className="text-caution-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-700 leading-relaxed">
                    {rest.length ? <><strong className="text-ink-900">{head}:</strong> {rest.join(": ")}</> : mistake}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. Ingredients ── */}
        <section>
          <SectionLabel number="04" label="Ingredient Guide & Product Selection" />
          <div className="mt-6 space-y-4">
            {guide.ingredientSections.map(({ heading, tips }) => (
              <div key={heading} className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
                <div className="px-6 py-3 border-b border-teal-50 bg-teal-50/60">
                  <h3 className="text-xs font-bold text-teal-700 uppercase tracking-widest">{heading}</h3>
                </div>
                <div className="p-5 space-y-2.5">
                  {tips.map((tip, i) => {
                    const [head, ...rest] = tip.split(": ");
                    return (
                      <div key={i} className="flex gap-2.5 text-sm text-ink-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-2" />
                        <span>
                          {rest.length ? <><strong className="text-ink-900">{head}:</strong> {rest.join(": ")}</> : tip}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Daily Routine ── */}
        <section>
          <SectionLabel number="05" label="Your Simplified Daily Routine" />
          <div className="mt-6 grid sm:grid-cols-2 gap-5">
            {/* AM */}
            <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 px-6 py-3 flex items-center gap-2">
                <Sun size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Morning Routine</span>
              </div>
              <div className="p-5 space-y-3">
                {guide.morningRoutine.map(({ step, action, detail }) => (
                  <div key={step} className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-ink-900">{action}: </span>
                      <span className="text-sm text-ink-600">{detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PM */}
            <div className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-teal-900 to-teal-800 px-6 py-3 flex items-center gap-2">
                <Moon size={14} className="text-teal-300" />
                <span className="text-xs font-bold text-teal-200 uppercase tracking-widest">Night Routine</span>
              </div>
              <div className="p-5 space-y-3">
                {guide.nightRoutine.map(({ step, action, detail }) => (
                  <div key={step} className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-ink-900">{action}: </span>
                      <span className="text-sm text-ink-600">{detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Checklist ── */}
        <section>
          <SectionLabel number="06" label="Summary Checklist" />
          <div className="mt-6 bg-gradient-to-br from-teal-800 to-teal-900 rounded-3xl p-6 lg:p-8">
            <div className="grid sm:grid-cols-2 gap-3">
              {guide.checklist.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <CheckCircle2 size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-teal-100 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="pb-8">
          <div className="bg-teal-50 border border-teal-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Sparkles size={18} className="text-teal-500 flex-shrink-0" />
            <p className="text-ink-700 flex-1 text-sm leading-relaxed">
              <strong className="text-ink-900">Want to check if a product is right for your skin?</strong>{" "}
              Run any product through Ask Clean. Our AI engine scores it against your skin type in seconds.
            </p>
            <Link
              href="/analyzer"
              className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              Try Ask Clean →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-black text-teal-300 font-mono">{number}</span>
      <h2 className="text-xl lg:text-2xl font-bold text-ink-950 tracking-tight">{label}</h2>
    </div>
  );
}
