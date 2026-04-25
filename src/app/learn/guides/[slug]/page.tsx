import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, Sun, Moon, FlaskConical } from "lucide-react";
import { getGuideBySlug, getAllGuideSlugs } from "@/lib/skin-guides";
import DownloadGuideButton from "@/components/DownloadGuideButton";

const GUIDE_FILES: Record<string, string> = {
  "oily-skin":        "/guides/Oily_Skin_Care_Revised_v2.pdf",
  "dry-skin":         "/guides/Dry_Skin_Care_Guide.pdf",
  "combination-skin": "/guides/Combination_Skin_Care_Guide.pdf",
  "normal-skin":      "/guides/Normal_Skin_Care_Guide.pdf",
};

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | The Clean Sheet™`,
    description: guide.tagline,
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const guideFile = GUIDE_FILES[slug] ?? "/guides/Oily_Skin_Care_Revised_v2.pdf";

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-teal-100">
        <div className={`absolute inset-0 bg-gradient-to-br ${guide.accentFrom} ${guide.accentTo} opacity-[0.07]`} />

        {/* Molecule — desktop only */}
        <div className="hidden sm:block absolute top-0 right-0 w-72 lg:w-96 h-72 lg:h-96 opacity-[0.04] pointer-events-none select-none" aria-hidden>
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 relative">
          <Link
            href="/learn#skin-type-guides"
            className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Learn
          </Link>

          <div className="inline-flex items-center gap-2 text-teal-600 bg-teal-50 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <FlaskConical size={12} />
            Skin Type Guide · The Clean Sheet™
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-950 tracking-tight leading-tight mb-3">
            {guide.skinType}
          </h1>
          <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-2xl mb-6">
            {guide.tagline}
          </p>

          {/* Silver lining + download */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 max-w-2xl">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3.5 flex gap-3 flex-1">
              <Sparkles size={15} className="text-teal-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-800 leading-relaxed">
                <strong className="font-semibold">The upside: </strong>{guide.silverLining}
              </p>
            </div>
            <DownloadGuideButton guideName={guide.skinType} guideFile={guideFile} />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12 sm:space-y-14">

        {/* ── 1. Understanding ── */}
        <section>
          <SectionLabel number="01" label="Understanding Your Skin" />
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            {guide.causes.map(({ label, items }) => (
              <div key={label} className="bg-white rounded-2xl sm:rounded-3xl border border-teal-100 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">{label}</h3>
                <ul className="space-y-2.5">
                  {items.map((item, i) => {
                    const [head, ...rest] = item.split(": ");
                    return (
                      <li key={i} className="flex gap-2.5 text-sm text-ink-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-[7px]" />
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
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guide.habits.map((habit, i) => {
              const [head, ...rest] = habit.split(": ");
              return (
                <div key={i} className="bg-white rounded-2xl border border-teal-100 p-4 shadow-sm flex gap-3">
                  <CheckCircle2 size={15} className="text-teal-500 flex-shrink-0 mt-0.5" />
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
          <div className="mt-5 space-y-2.5">
            {guide.mistakes.map((mistake, i) => {
              const [head, ...rest] = mistake.split(": ");
              return (
                <div key={i} className="bg-caution-100/60 border border-caution-500/20 rounded-2xl px-4 py-3.5 flex gap-3">
                  <AlertTriangle size={14} className="text-caution-500 flex-shrink-0 mt-0.5" />
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
          <div className="mt-5 space-y-3">
            {guide.ingredientSections.map(({ heading, tips }) => (
              <div key={heading} className="bg-white rounded-2xl sm:rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-teal-50 bg-teal-50/60">
                  <h3 className="text-xs font-bold text-teal-700 uppercase tracking-widest">{heading}</h3>
                </div>
                <div className="p-4 sm:p-5 space-y-2.5">
                  {tips.map((tip, i) => {
                    const [head, ...rest] = tip.split(": ");
                    return (
                      <div key={i} className="flex gap-2.5 text-sm text-ink-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-[7px]" />
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
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            {/* AM */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 px-5 py-3 flex items-center gap-2">
                <Sun size={13} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Morning Routine</span>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                {guide.morningRoutine.map(({ step, action, detail }) => (
                  <div key={step} className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <div className="text-sm">
                      <span className="font-semibold text-ink-900">{action}: </span>
                      <span className="text-ink-600">{detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PM */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-teal-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-teal-900 to-teal-800 px-5 py-3 flex items-center gap-2">
                <Moon size={13} className="text-teal-300" />
                <span className="text-xs font-bold text-teal-200 uppercase tracking-widest">Night Routine</span>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                {guide.nightRoutine.map(({ step, action, detail }) => (
                  <div key={step} className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <div className="text-sm">
                      <span className="font-semibold text-ink-900">{action}: </span>
                      <span className="text-ink-600">{detail}</span>
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
          <div className="mt-5 bg-gradient-to-br from-teal-800 to-teal-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-3">
              {guide.checklist.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <CheckCircle2 size={15} className="text-teal-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-teal-100 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="pb-8">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Sparkles size={18} className="text-teal-500 flex-shrink-0 hidden sm:block" />
            <p className="text-ink-700 flex-1 text-sm leading-relaxed">
              <strong className="text-ink-900">Want to check if a product suits your skin?</strong>{" "}
              Run any product through Ask Clean. Our AI engine scores it in seconds.
            </p>
            <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
              <DownloadGuideButton guideName={guide.skinType} guideFile={guideFile} />
              <Link
                href="/analyzer"
                className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors text-center whitespace-nowrap"
              >
                Try Ask Clean →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-black text-teal-300 font-mono">{number}</span>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-ink-950 tracking-tight">{label}</h2>
    </div>
  );
}
