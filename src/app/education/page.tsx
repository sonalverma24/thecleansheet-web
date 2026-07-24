import Link from "next/link";
import Image from "next/image";
import { Reveal, Stagger, Item } from "@/components/motion/Motion";
import { EducationArt } from "@/components/illustrations/PageArt";
import { GraduationCap, CalendarDays, FlaskConical, BadgeCheck, Microscope, Sparkles, LineChart, type LucideIcon } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-posts";

/* ────────────────────────────────────────────────────────────────
   EDUCATION · one knowledge hub. Leads with reading the label, then
   the latest reads, courses and events, then topics (product guides
   fold in the skin-type guides).
──────────────────────────────────────────────────────────────── */

export const metadata = {
  title: "Education",
  description:
    "Plain-language education on beauty and personal care: ingredients, claims, testing and standards, product use, and industry analysis from The Clean Sheet.",
};

const TEAL = "#248179";
const INK = "#282828";
const WARM = "#b0a8a4";
const HAIR = "rgba(40,40,40,0.12)";
const DISPLAY_LIGHT = { fontWeight: 300 } as const;

const CATEGORIES: { title: string; body: string; href?: string; comingSoon?: boolean; Icon: LucideIcon; tint: string }[] = [
  { title: "Courses", body: "Short courses to understand your skin, your products, and the evidence behind them.", href: "/courses", Icon: GraduationCap, tint: "#248179" },
  { title: "Events", body: "Workshops and live sessions from The Clean Sheet.", comingSoon: true, Icon: CalendarDays, tint: "#fd6158" },
  { title: "Ingredients & formulations", body: "What ingredients do, at what concentration, and why the formula matters more than any single one.", href: "/ingredients", Icon: FlaskConical, tint: "#2E9E96" },
  { title: "Claims & evidence", body: "What claims like clinically proven, non-comedogenic or fragrance-free actually require.", href: "/standard/claims", Icon: BadgeCheck, tint: "#c98a1e" },
  { title: "Testing & standards", body: "Plain-language explanations of the lab methods, regulations and standards we rely on.", href: "/standard/register", Icon: Microscope, tint: "#248179" },
  { title: "Product guides", body: "How to choose and use products for your skin, including skin-type guides for oily, dry, combination and normal skin.", href: "/learn", Icon: Sparkles, tint: "#fd6158" },
  { title: "Industry insights", body: "Research, market analysis and editorial from The Clean Sheet.", href: "/blog", Icon: LineChart, tint: "#2E9E96" },
];

export default function EducationPage() {
  const featured = BLOG_POSTS[0];
  const moreReads = BLOG_POSTS.slice(1, 4);
  const topicCats = CATEGORIES.filter((c) => c.title !== "Courses" && c.title !== "Events");

  return (
    <div className="bg-white">
      {/* ═══ Hero · read the label ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pt-6 md:pt-8 pb-8">
        <Reveal>
          <div className="relative rounded-[2rem] overflow-hidden min-h-[440px] md:min-h-[520px] flex items-center">
            <Image
              src="/images/maria-lupan-9PnU-U7V6YE-unsplash.jpg"
              alt="A lineup of serums with their ingredient labels"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1120px"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(11,36,34,0.94) 0%, rgba(11,36,34,0.66) 38%, rgba(11,36,34,0.18) 66%, rgba(11,36,34,0) 100%)" }} />
            <div className="relative px-7 md:px-16 py-14 max-w-2xl">
              <p className="text-[12px] uppercase" style={{ letterSpacing: "0.16em", color: "#80d5cc" }}>Education · Read the label</p>
              <h1 className="font-display text-white text-[38px] md:text-[58px] leading-[1.04] tracking-[-0.02em] mt-5" style={DISPLAY_LIGHT}>
                The answer is
                <br />on the label.
              </h1>
              <p className="text-white/85 text-[16px] md:text-[17px] leading-[1.7] mt-6 max-w-lg">
                The front of the pack sells a story. The back tells the truth. We teach you to read it,
                ingredient by ingredient and claim by claim, so no marketing line goes unchecked.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/ingredients" className="rounded-full px-7 py-3.5 text-[15px] text-[#0b2422] bg-white hover:opacity-90 transition-opacity">Explore ingredients →</Link>
                <Link href="/standard/claims" className="rounded-full px-7 py-3.5 text-[15px] text-white border border-white/40 hover:bg-white/10 transition-colors">What claims must prove</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ Latest reads ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-12 md:py-14">
        <Reveal>
          <div className="flex items-baseline justify-between gap-4 mb-7">
            <h2 className="font-display text-[26px] md:text-[34px] leading-tight" style={{ ...DISPLAY_LIGHT, color: INK }}>Latest reads</h2>
            <Link href="/blog" className="text-[14px] flex-shrink-0" style={{ color: TEAL }}>All articles ›</Link>
          </div>
        </Reveal>
        <Reveal>
          <Link href={`/blog/${featured.slug}`} className="group grid md:grid-cols-2 rounded-2xl overflow-hidden bg-white transition-all hover:shadow-xl hover:shadow-teal-900/5" style={{ border: `1px solid ${HAIR}` }}>
            <div className="relative aspect-[16/11] md:aspect-auto md:min-h-[300px] overflow-hidden">
              <Image src={featured.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 560px" />
            </div>
            <div className="p-7 md:p-9 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-[11px] uppercase" style={{ letterSpacing: "0.06em", color: TEAL }}>
                <span>{featured.category}</span><span style={{ color: WARM }}>{featured.readTime}</span>
              </div>
              <h3 className="font-display text-[24px] md:text-[28px] leading-[1.15] mt-3" style={{ ...DISPLAY_LIGHT, color: INK }}>{featured.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: WARM }}>{featured.excerpt.slice(0, 180)}…</p>
              <span className="mt-5 inline-block text-[14px]" style={{ color: TEAL }}>Read the briefing <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
            </div>
          </Link>
        </Reveal>
        <Stagger className="mt-5 grid sm:grid-cols-3 gap-5" gap={0.08}>
          {moreReads.map((p) => (
            <Item key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group block rounded-2xl overflow-hidden bg-white h-full transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-900/5" style={{ border: `1px solid ${HAIR}` }}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={p.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="(max-width: 640px) 100vw, 360px" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[10.5px] uppercase" style={{ letterSpacing: "0.06em", color: TEAL }}>
                    <span>{p.category}</span><span style={{ color: WARM }}>· {p.readTime}</span>
                  </div>
                  <h3 className="font-display text-[17px] leading-tight mt-2" style={{ ...DISPLAY_LIGHT, color: INK }}>{p.title}</h3>
                </div>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* ═══ Courses & events ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-4">
        <Reveal>
          <h2 className="font-display text-[26px] md:text-[34px] leading-tight mb-7" style={{ ...DISPLAY_LIGHT, color: INK }}>Courses &amp; events</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-5">
          <Reveal>
            <Link href="/courses" className="group relative block rounded-2xl overflow-hidden h-full p-7 md:p-8 min-h-[240px]" style={{ border: `1px solid ${HAIR}`, background: "linear-gradient(135deg, #eef7f5 0%, #ffffff 58%)" }}>
              <div className="relative z-10 max-w-[64%]">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#24817915", color: TEAL }}><GraduationCap size={20} /></div>
                <h3 className="font-display text-[22px] leading-tight" style={{ ...DISPLAY_LIGHT, color: INK }}>Courses</h3>
                <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: WARM }}>Short, plain-language courses to understand your skin, your products, and the evidence behind them.</p>
                <span className="mt-5 inline-block text-[14px]" style={{ color: TEAL }}>Browse courses <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
              </div>
              <EducationArt className="pointer-events-none absolute -right-8 -bottom-8 w-[200px] hidden sm:block" />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden h-full p-7 md:p-8 min-h-[240px]" style={{ border: `1px solid ${HAIR}`, background: "linear-gradient(135deg, #fff2f1 0%, #ffffff 60%)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#fd615815", color: "#fd6158" }}><CalendarDays size={20} /></div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-[22px] leading-tight" style={{ ...DISPLAY_LIGHT, color: INK }}>Events</h3>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full" style={{ letterSpacing: "0.06em", background: "#ffe6e4", color: "#c2453d", border: "1px solid #f6c9c5" }}>Coming soon</span>
              </div>
              <p className="mt-2 text-[14px] leading-[1.6] max-w-sm" style={{ color: WARM }}>Workshops and live sessions from The Clean Sheet, on reading labels, decoding claims, and building an evidence-first routine.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Explore by topic ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-12 md:py-14 pb-24">
        <Reveal>
          <h2 className="font-display text-[26px] md:text-[34px] leading-tight mb-7" style={{ ...DISPLAY_LIGHT, color: INK }}>Explore by topic</h2>
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" gap={0.06}>
          {topicCats.map((c) => {
            const Icon = c.Icon;
            const tile = (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${c.tint}15`, color: c.tint }}>
                <Icon size={20} />
              </div>
            );
            return (
              <Item key={c.title}>
                {c.comingSoon ? (
                  <div className="rounded-2xl p-6 h-full bg-white" style={{ border: `1px solid ${HAIR}` }}>
                    {tile}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-[20px] leading-tight" style={{ ...DISPLAY_LIGHT, color: INK }}>{c.title}</h3>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full" style={{ letterSpacing: "0.06em", background: "#eef0ee", color: "#8a8785", border: "1px solid #ddd" }}>Coming soon</span>
                    </div>
                    <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: WARM }}>{c.body}</p>
                  </div>
                ) : (
                  <Link href={c.href!} className="group block rounded-2xl p-6 h-full bg-white transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-900/5 hover:border-[var(--color-primary)]" style={{ border: `1px solid ${HAIR}` }}>
                    {tile}
                    <h3 className="font-display text-[20px] leading-tight" style={{ ...DISPLAY_LIGHT, color: INK }}>{c.title}</h3>
                    <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: WARM }}>{c.body}</p>
                    <span className="mt-4 inline-block text-[14px]" style={{ color: TEAL }}>Explore <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
                  </Link>
                )}
              </Item>
            );
          })}
        </Stagger>
      </section>
    </div>
  );
}
