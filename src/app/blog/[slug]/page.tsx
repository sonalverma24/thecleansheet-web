import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { getPostBySlug, getAllSlugs, BLOG_POSTS, type BlogBlock } from "@/lib/blog-posts";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const ogImage = post.image.startsWith("/")
    ? `https://thecleansheet.in${post.image}`
    : post.image;

  return {
    title: post.title,
    description: post.subtitle,
    alternates: { canonical: `https://thecleansheet.in/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.subtitle,
      url: `https://thecleansheet.in/blog/${slug}`,
      siteName: "The Clean Sheet",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      section: post.category,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.subtitle,
      images: [ogImage],
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  Regulation:        "bg-teal-100 text-teal-700 border-teal-200",
  Health:            "bg-safe-100 text-safe-600 border-safe-600/20",
  Science:           "bg-amber-100 text-amber-700 border-amber-200",
  "Consumer Safety": "bg-coral-100 text-coral-600 border-coral-600/20",
};

function renderBlock(block: BlogBlock, i: number) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={i} className="text-ink-700 leading-relaxed text-lg mb-6">
          {block.text}
        </p>
      );

    case "heading":
      if (block.level === 2)
        return (
          <h2 key={i} className="text-2xl lg:text-3xl font-medium text-ink-950 mt-14 mb-5 pt-8 border-t border-teal-100">
            {block.text}
          </h2>
        );
      return (
        <h3 key={i} className="text-xl font-medium text-ink-900 mt-8 mb-4">
          {block.text}
        </h3>
      );

    case "numbered-heading":
      return (
        <div key={i} className="flex items-start gap-4 mt-10 mb-5">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-medium text-sm">
            {block.n}
          </div>
          <h3 className="text-xl font-medium text-ink-900 pt-1.5">{block.text}</h3>
        </div>
      );

    case "before-after":
      return (
        <div key={i} className="grid sm:grid-cols-2 gap-4 my-8">
          <div className="bg-danger-100 border border-red-200 rounded-2xl p-5">
            <div className="text-xs font-medium text-red-600 uppercase tracking-wider mb-2">Before</div>
            <p className="text-ink-700 text-sm leading-relaxed">{block.before}</p>
          </div>
          <div className="bg-safe-100 border border-green-200 rounded-2xl p-5">
            <div className="text-xs font-medium text-safe-600 uppercase tracking-wider mb-2">After</div>
            <p className="text-ink-700 text-sm leading-relaxed">{block.after}</p>
          </div>
        </div>
      );

    case "callout":
      return (
        <blockquote key={i} className="my-8 pl-6 border-l-4 border-teal-500 bg-teal-50 rounded-r-2xl py-5 pr-6">
          <p className="text-teal-900 font-medium text-lg leading-relaxed italic">{block.text}</p>
        </blockquote>
      );

    case "bullets":
      return (
        <ul key={i} className="my-6 space-y-3">
          {block.items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-ink-700">
              <CheckCircle2 size={18} className="text-teal-500 flex-shrink-0 mt-1" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "divider":
      return <hr key={i} className="my-10 border-teal-100" />;

    case "cta":
      return (
        <div key={i} className="my-12 bg-teal-800 rounded-3xl p-8 text-center">
          <p className="text-teal-200 text-lg mb-6">{block.text}</p>
          <Link
            href={block.href}
            className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-normal px-7 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98]"
          >
            {block.label}
            <ArrowRight size={16} />
          </Link>
        </div>
      );

    default:
      return null;
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const categoryClass = CATEGORY_COLORS[post.category] ?? "bg-ink-100 text-ink-600 border-ink-200";

  // Related posts (other posts, max 2)
  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  const ogImage = post.image.startsWith("/")
    ? `https://thecleansheet.in${post.image}`
    : post.image;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://thecleansheet.in" },
          { "@type": "ListItem", position: 2, name: "Journal", item: "https://thecleansheet.in/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: `https://thecleansheet.in/blog/${slug}` },
        ],
      },
      {
        "@type": "Article",
        headline: post.title,
        description: post.subtitle,
        image: ogImage,
        datePublished: post.date,
        author: {
          "@type": "Organization",
          name: post.author,
          url: "https://thecleansheet.in",
        },
        publisher: {
          "@type": "Organization",
          name: "The Clean Sheet",
          url: "https://thecleansheet.in",
          logo: { "@type": "ImageObject", url: "https://thecleansheet.in/logo.png" },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://thecleansheet.in/blog/${slug}`,
        },
        articleSection: post.category,
        keywords: ["clean beauty", "skincare", "ingredient safety", "India", post.category],
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      {/* ── Hero image ──────────────────────────── */}
      <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className={`object-cover${post.imageEffect === "blur-caution" ? " blur-[4px] scale-110" : ""}`}
          priority
        />
        {post.imageEffect === "blur-caution" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <div className="bg-amber-400 text-amber-950 rounded-2xl px-6 py-4 flex flex-col items-center gap-2 shadow-2xl">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              <span className="text-sm font-medium uppercase tracking-widest">Caution</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-950/60 to-teal-950/20" />

        {/* Back link */}
        <div className="absolute top-6 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full"
            style={{ color: '#ffffff' }}
          >
            <ArrowLeft size={14} />
            Back to Journal
          </Link>
        </div>

        {/* Meta overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 pb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center text-xs font-normal px-2.5 py-1 rounded-full border border-white/30 bg-white/15 backdrop-blur-sm" style={{ color: '#ffffff' }}>
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <Clock size={12} />
              {post.readTime}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-tight max-w-3xl" style={{ color: '#ffffff' }}>
            {post.title}
          </h1>
        </div>
      </div>

      {/* ── Article body ────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Subtitle + meta bar */}
        <div className="py-8 border-b border-teal-100 mb-8">
          <p className="text-xl text-ink-600 leading-relaxed mb-6">{post.subtitle}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center">
                <BookOpen size={13} className="text-white" />
              </div>
              <span className="font-medium text-ink-700">{post.author}</span>
            </div>
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Content blocks */}
        <div className="pb-16">
          {post.content.map((block, i) => renderBlock(block, i))}
        </div>
      </div>

      {/* ── Get Your Product Verified CTA ───────── */}
      <section className="border-t border-teal-100 py-16 bg-teal-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-teal-300 text-xs font-normal px-3 py-1.5 rounded-full mb-6">
            For Brands
          </div>
          <h2 className="text-3xl lg:text-4xl font-medium text-white tracking-tight mb-4">
            Get your product verified.
          </h2>
          <p className="text-teal-300 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            India's regulatory landscape is changing. The Clean Sheet™ certification separates compliant brands from those flying blind. The founding cohort is open now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#get-certified"
              className="inline-flex items-center justify-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-normal px-7 py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98]"
            >
              Apply for Certification
              <ArrowRight size={16} />
            </a>
            <Link
              href="/brands"
              className="inline-flex items-center justify-center gap-2 border border-white/25 hover:border-white/50 text-white font-medium px-7 py-4 rounded-2xl transition-all duration-200"
            >
              See the process
            </Link>
          </div>
        </div>
      </section>

      {/* ── Related posts ───────────────────────── */}
      {related.length > 0 && (
        <section className="border-t border-teal-100 py-16 bg-teal-50/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-xs font-normal text-ink-400 uppercase tracking-widest mb-8">
              More from The Journal
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
                  <article className="bg-white rounded-3xl border border-teal-100 overflow-hidden hover:shadow-xl hover:shadow-teal-900/8 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className={`object-cover transition-transform duration-500 group-hover:scale-105${p.imageEffect === "blur-caution" ? " blur-[3px] scale-105" : ""}`}
                      />
                      {p.imageEffect === "blur-caution" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <div className="bg-amber-400 text-amber-950 rounded-xl px-3 py-2 flex flex-col items-center gap-1 shadow-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            <span className="text-xs font-medium uppercase tracking-widest">Caution</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-950/30" />
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center text-xs font-normal px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[p.category] ?? "bg-ink-100 text-ink-600 border-ink-200"}`}>
                          {p.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-ink-400 mb-3">
                        <Clock size={12} />
                        {p.readTime}
                      </div>
                      <h3 className="font-medium text-ink-950 text-lg leading-snug mb-2 group-hover:text-teal-700 transition-colors flex-1">
                        {p.title}
                      </h3>
                      <div className="flex items-center justify-between pt-4 border-t border-teal-50 mt-auto">
                        <span className="text-xs text-ink-400">{p.date}</span>
                        <span className="flex items-center gap-1 text-teal-600 text-xs font-normal group-hover:gap-1.5 transition-all">
                          Read <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
