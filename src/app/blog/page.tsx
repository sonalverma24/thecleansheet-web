import Image from "next/image";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { BLOG_POSTS, BlogPost } from "@/lib/blog-posts";
import { Reveal, Stagger, Item, TitleReveal } from "@/components/motion/Motion";
import { IngredientLattice } from "@/components/graphics/HeroArt";

/* ────────────────────────────────────────────────────────────────
   READS — the journal. Evidence-First Editorial.
   Cooper headlines, thin rules, brand-colour category marks.
──────────────────────────────────────────────────────────────── */

export const metadata = {
  title: "Reads, The Clean Sheet™",
  description: "Science, regulation, and transparency in beauty. Insights on skincare ingredients, cosmetic law, and what it really means to be clean.",
};

const INK = "#282828";
const HAIR = "rgba(40,40,40,0.15)";

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  Regulation:        { bg: "var(--color-primary)",  color: "#fff" },
  "Consumer Safety": { bg: "var(--color-coral)",    color: "#fff" },
  Science:           { bg: "var(--color-lime)",     color: INK },
  Health:            { bg: "var(--color-lime)",     color: INK },
};

function CategoryTag({ category }: { category: string }) {
  const s = CATEGORY_STYLE[category] ?? { bg: "var(--color-surface-subtle)", color: INK };
  return (
    <span className="px-3 py-1 text-[10px] uppercase" style={{ letterSpacing: "0.12em", background: s.bg, color: s.color }}>
      {category}
    </span>
  );
}

function PostImage({ post, className = "" }: { post: BlogPost; className?: string }) {
  const isBlurCaution = post.imageEffect === "blur-caution";
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={post.image}
        alt={post.title}
        fill
        className={`object-cover transition-transform duration-700 group-hover:scale-[1.04] ${isBlurCaution ? "blur-[3px] scale-105" : ""}`}
      />
      {isBlurCaution && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
          <div className="bg-[var(--color-lime)] px-4 py-3 flex flex-col items-center gap-1" style={{ color: INK }}>
            <TriangleAlert size={24} />
            <span className="text-[10px] uppercase" style={{ letterSpacing: "0.14em" }}>Caution</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="bg-white">
      {/* ═══ Masthead ═══ */}
      <section className="relative max-w-[1200px] mx-auto px-4 md:px-16 pt-16 md:pt-24 pb-12 md:pb-16">
        {/* Hero art: floating ingredient lattice — desktop only */}
        <div className="hidden lg:block absolute right-16 top-16 w-[400px] h-[240px]" aria-hidden>
          <IngredientLattice className="w-full h-full shadow-2xl" />
        </div>
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>
            The Clean Sheet · Journal
          </p>
        </Reveal>
        <h1 className="font-display mt-6 text-[44px] md:text-[64px] leading-[1.05] tracking-[-0.02em] text-[var(--color-charcoal)]">
          <TitleReveal lines={["Reads."]} />
        </h1>
        <Reveal delay={0.25}>
          <p className="mt-5 text-[17px] leading-[1.7] text-[var(--color-warm-gray)] max-w-xl">
            Science, regulation, and transparency in beauty. No press releases,
            no sponsored posts, no marketing dressed up as advice.
          </p>
        </Reveal>
      </section>

      {/* ═══ Featured ═══ */}
      {featured && (
        <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-20 md:pb-28">
          <Reveal>
            <Link href={`/blog/${featured.slug}`} className="group grid lg:grid-cols-2 gap-10 items-center pt-10" style={{ borderTop: `1px solid ${INK}` }}>
              <PostImage post={featured} className="aspect-[4/3] w-full" />
              <div>
                <div className="flex items-center gap-4">
                  <CategoryTag category={featured.category} />
                  <span className="text-[12px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.1em" }}>
                    Featured · {featured.readTime}
                  </span>
                </div>
                <h2 className="font-display mt-6 text-[30px] md:text-[40px] leading-[1.15] text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)] transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-5 text-[16px] leading-[1.7] text-[var(--color-warm-gray)] max-w-lg">
                  {featured.subtitle}
                </p>
                <p className="mt-6 text-[12px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.1em" }}>
                  {featured.date} · {featured.author}
                </p>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ═══ All posts — thin-rule rows ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-24 md:pb-32">
        <Stagger gap={0.1}>
          {rest.map((post) => (
            <Item key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group grid md:grid-cols-[200px_1fr_auto] gap-6 md:gap-10 items-center py-8"
                style={{ borderTop: `1px solid ${HAIR}` }}
              >
                <PostImage post={post} className="aspect-[3/2] w-full max-w-[200px] hidden md:block" />
                <div className="min-w-0">
                  <div className="flex items-center gap-4 pb-3">
                    <CategoryTag category={post.category} />
                    <span className="text-[12px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.1em" }}>
                      {post.date} · {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-display text-[24px] md:text-[28px] leading-[1.2] text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.7] text-[var(--color-warm-gray)] max-w-2xl">
                    {post.subtitle}
                  </p>
                </div>
                <span className="hidden md:block text-[20px] text-[var(--color-warm-gray)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" aria-hidden>
                  →
                </span>
              </Link>
            </Item>
          ))}
          <Item>
            <div style={{ borderTop: `1px solid ${HAIR}` }} />
          </Item>
        </Stagger>
      </section>

      {/* ═══ Closing CTA ═══ */}
      <section style={{ background: INK }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-20 md:py-24">
          <Reveal>
            <h2 className="font-display text-[30px] md:text-[40px] leading-[1.15] max-w-2xl" style={{ color: "#fcf9f8" }}>
              Read the label. Then read the evidence.
            </h2>
            <Link
              href="/review"
              className="mt-8 inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] hover:opacity-90 transition-opacity"
              style={{ background: "var(--color-lime)", color: INK }}
            >
              Review a product <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
