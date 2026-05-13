import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, Rss, Shield, TriangleAlert } from "lucide-react";
import { BLOG_POSTS, BlogPost } from "@/lib/blog-posts";
const ILLUSTRATIONS: Record<string, React.ComponentType> = {};

function PostImage({ post, fill = true, className = "" }: { post: BlogPost; fill?: boolean; className?: string }) {
  const isBlurCaution = post.imageEffect === "blur-caution";
  return (
    <div className="relative w-full h-full">
      <Image
        src={post.image}
        alt={post.title}
        fill={fill}
        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isBlurCaution ? "blur-[3px] scale-105" : ""} ${className}`}
      />
      {isBlurCaution && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
          <div className="bg-amber-400 text-amber-950 rounded-2xl px-4 py-3 flex flex-col items-center gap-1 shadow-xl">
            <TriangleAlert size={28} strokeWidth={2.5} />
            <span className="text-xs font-medium uppercase tracking-widest">Caution</span>
          </div>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "The Journal, The Clean Sheet™",
  description: "Science, regulation, and transparency in beauty. Insights on skincare ingredients, cosmetic law, and what it really means to be clean.",
};

const POSTS = BLOG_POSTS;

const CATEGORY_COLORS: Record<string, string> = {
  Regulation:        "bg-teal-100 text-teal-700 border-teal-200",
  Health:            "bg-safe-100 text-safe-600 border-safe-600/20",
  Science:           "bg-amber-100 text-amber-700 border-amber-200",
  "Consumer Safety": "bg-coral-100 text-coral-600 border-coral-600/20",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-normal px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[category] ?? "bg-ink-100 text-ink-600 border-ink-200"}`}>
      {category}
    </span>
  );
}

export default function BlogPage() {
  const [featured, second, ...rest] = POSTS;

  return (
    <div className="bg-white">

      {/* ── Editorial Masthead ───────────────────────────── */}
      <section className="relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #0f2e2b 0%, #134e4a 35%, #0f3d3a 60%, #1a1a2e 100%)"
      }}>
        {/* Textured noise overlay */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px"
        }} />
        {/* Radial glow, top left */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 65%)" }} />
        {/* Radial glow, bottom right */}
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #5eead4 0%, transparent 65%)" }} />
        {/* Soft coral accent top-right */}
        <div className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fb7185 0%, transparent 65%)" }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          {/* Single compact row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-px h-8 bg-teal-400/50 flex-shrink-0" />
              <div>
                <div className="text-teal-300/60 text-[10px] font-normal tracking-[0.3em] uppercase mb-1">
                  Vol. I &middot; 2026 &middot; India
                </div>
                <h1 className="text-3xl sm:text-4xl font-medium tracking-tight leading-none" style={{ color: '#ffffff' }}>
                  The&nbsp;
                  <span style={{ background: "linear-gradient(90deg, #5eead4, #99f6e4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Journal.</span>
                </h1>
              </div>
            </div>
            <p className="text-teal-200/60 text-sm leading-relaxed max-w-xs sm:text-right">
              Science &amp; truth about what you put on your skin. No brand deals.
            </p>
          </div>

          {/* Tags row */}
          <div className="border-t border-white/10 pt-4 flex flex-wrap gap-x-5 gap-y-2">
            {["Cosmetic Regulation", "Ingredient Science", "Consumer Safety", "India Policy", "Brand Accountability"].map((tag) => (
              <span key={tag} className="text-teal-300/45 text-[10px] font-medium tracking-wider uppercase hover:text-teal-300/75 transition-colors">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Story ───────────────────────────────── */}
      <section className="pt-0">
        <div className="max-w-7xl mx-auto">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div className="grid lg:grid-cols-5 min-h-[520px]">
              {/* Image - takes 3 cols */}
              <div className="relative lg:col-span-3 aspect-[4/3] lg:aspect-auto overflow-hidden">
                {ILLUSTRATIONS[featured.slug] ? (
                  <div className="w-full h-full">
                    {(() => { const Illus = ILLUSTRATIONS[featured.slug]; return <Illus />; })()}
                  </div>
                ) : (
                  <PostImage post={featured} />
                )}
                {!ILLUSTRATIONS[featured.slug] && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-950/30 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-950/60 via-transparent to-transparent" />
                  </>
                )}
                {/* Issue label */}
                <div className="absolute top-6 left-6">
                  <div className="bg-white/15 backdrop-blur-md border border-white/25 text-xs font-medium px-3 py-1.5 rounded-full tracking-widest uppercase" style={{ color: '#ffffff' }}>
                    Lead Story
                  </div>
                </div>
              </div>

              {/* Content - takes 2 cols */}
              <div className="lg:col-span-2 bg-teal-950 flex flex-col justify-center p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <CategoryBadge category={featured.category} />
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: '#5eead4' }}>
                    <Clock size={12} />
                    {featured.readTime}
                  </span>
                </div>
                <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: '#0d9488' }}>
                  {featured.date}
                </div>
                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-medium tracking-tight leading-snug mb-5 transition-colors duration-300" style={{ color: '#ffffff' }}>
                  {featured.title}
                </h2>
                <p className="leading-relaxed mb-8 text-sm lg:text-base" style={{ color: '#99f6e4' }}>
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-teal-800">
                  <div>
                    <div className="text-sm font-normal" style={{ color: '#ffffff' }}>{featured.author}</div>
                  </div>
                  <div className="flex items-center gap-2 font-normal text-sm transition-all" style={{ color: '#5eead4' }}>
                    Read <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Second feature + sidebar ─────────────────────── */}
      {second && (
        <section className="py-12 lg:py-16 border-b border-teal-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="text-xs font-normal text-ink-400 uppercase tracking-widest">Editor's Pick</div>
              <div className="flex-1 h-px bg-teal-100" />
            </div>
            <Link href={`/blog/${second.slug}`} className="group block">
              <div className="grid sm:grid-cols-5 gap-0 bg-white rounded-3xl overflow-hidden border border-teal-100 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500">
                <div className="sm:col-span-2 relative aspect-[4/3] sm:aspect-auto overflow-hidden">
                  <PostImage post={second} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-950/30" />
                  <div className="absolute top-4 left-4">
                    <CategoryBadge category={second.category} />
                  </div>
                </div>
                <div className="sm:col-span-3 flex flex-col justify-center p-7 lg:p-10">
                  <div className="flex items-center gap-2 text-xs text-ink-400 mb-4">
                    <Clock size={12} />
                    {second.readTime}
                    <span className="mx-1 text-ink-200">&middot;</span>
                    {second.date}
                  </div>
                  <h2 className="text-xl lg:text-2xl font-medium text-ink-950 tracking-tight leading-snug mb-3 group-hover:text-teal-700 transition-colors">
                    {second.title}
                  </h2>
                  <p className="text-ink-500 leading-relaxed text-sm mb-6">{second.excerpt}</p>
                  <div className="flex items-center gap-2 text-teal-600 font-normal text-sm group-hover:gap-3 transition-all">
                    Read full article <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Article Grid ─────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="py-12 lg:py-16 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="text-xs font-normal text-ink-400 uppercase tracking-widest">All Articles</div>
              <div className="flex-1 h-px bg-teal-100" />
              <div className="text-xs text-ink-400">{POSTS.length} articles</div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                  <article className="bg-white rounded-3xl border border-teal-100 overflow-hidden hover:shadow-xl hover:shadow-teal-900/8 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <PostImage post={post} />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-950/25" />
                      <div className="absolute top-4 left-4">
                        <CategoryBadge category={post.category} />
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-ink-400 mb-3">
                        <Clock size={12} />
                        {post.readTime}
                      </div>
                      <h3 className="font-medium text-ink-950 text-lg leading-snug mb-3 group-hover:text-teal-700 transition-colors flex-1">
                        {post.title}
                      </h3>
                      <p className="text-ink-500 text-sm leading-relaxed mb-5 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-teal-50 mt-auto">
                        <div className="text-xs text-ink-400">{post.date}</div>
                        <div className="flex items-center gap-1 text-teal-600 text-xs font-normal group-hover:gap-1.5 transition-all">
                          Read <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Get Your Product Verified CTA ────────────────── */}
      <section className="py-16 lg:py-20 bg-teal-50 border-t border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-teal-600 bg-teal-100 border border-teal-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Shield size={14} />
                For Brands
              </div>
              <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight leading-tight mb-5">
                Get your product
                <br />
                verified.
              </h2>
              <p className="text-ink-600 text-lg leading-relaxed mb-8 max-w-lg">
                India's regulatory landscape is tightening. Brands with verified, science-backed certifications are separating from those that aren't. The window to be in the founding cohort is open now.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#get-certified"
                  className="inline-flex items-center justify-center gap-2.5 bg-teal-800 hover:bg-teal-900 text-white font-normal px-7 py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-teal-800/30 active:scale-[0.98]"
                >
                  Apply for Certification
                  <ArrowRight size={16} />
                </a>
                <Link
                  href="/brands"
                  className="inline-flex items-center justify-center gap-2 border border-teal-300 hover:border-teal-500 text-teal-700 font-medium px-7 py-4 rounded-2xl transition-all duration-200"
                >
                  See how it works
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "0-100", label: "Transparent score", sub: "No black boxes" },
                { value: "4 pillars", label: "Evaluation framework", sub: "Safety · Efficacy · Transparency · Sustainability" },
                { value: "EU + India", label: "Multi-regulatory", sub: "SCCS, FDA, BIS cross-referenced" },
                { value: "QR verified", label: "Consumer-facing", sub: "Scan at the shelf" },
              ].map(({ value, label, sub }) => (
                <div key={value} className="bg-white rounded-3xl border border-teal-100 p-5 hover:shadow-md hover:shadow-teal-100 transition-all">
                  <div className="text-2xl font-medium text-teal-700 mb-1">{value}</div>
                  <div className="font-normal text-ink-950 text-sm mb-1">{label}</div>
                  <div className="text-ink-400 text-xs leading-relaxed">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────── */}
      <section className="pb-24 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-teal-950">
            {/* Subtle texture */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-800/30 blur-3xl translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-900/40 blur-3xl -translate-x-1/4 translate-y-1/4" />
            </div>
            <div className="relative z-10 px-8 py-16 lg:py-20 text-center max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-teal-300 text-xs font-normal px-3 py-1.5 rounded-full mb-6">
                <Rss size={12} />
                The Journal
              </div>
              <h2 className="text-3xl lg:text-4xl font-medium text-white tracking-tight mb-4">
                Stay ahead of
                <br />
                the clean standard.
              </h2>
              <p className="text-teal-300 text-lg leading-relaxed mb-8">
                New articles on ingredients, regulation, and safety, straight to your inbox. No brand deals. No sponsored content.
              </p>
              <form
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-teal-400 px-5 py-3.5 rounded-2xl focus:outline-none focus:border-teal-400 text-sm"
                />
                <button
                  type="submit"
                  className="bg-coral-500 hover:bg-coral-600 text-white font-normal px-6 py-3.5 rounded-2xl transition-colors whitespace-nowrap text-sm"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-teal-600 text-xs mt-3">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
