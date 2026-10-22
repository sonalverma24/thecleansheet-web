import Image from "next/image";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import EducationHero from "@/components/education/EducationHero";
import { Reveal } from "@/components/motion/Motion";
import { BLOG_POSTS } from "@/lib/blog-posts";

/* Education: the real Education hero (shared with /education), then the latest
   blog reads with their thumbnails. */

const READS = BLOG_POSTS.slice(0, 3);

export default function EducationSection() {
  return (
    <section id="learn" className="scroll-mt-24 bg-[#282828] text-white">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-28 flex flex-col gap-10 md:gap-14">
        <EducationHero heading="h2" />

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h3 className="font-display font-light text-[28px] sm:text-[34px] leading-[1.1] tracking-[-0.01em] text-white">Latest reads</h3>
            <Link href="/blog" className="text-[14px] text-white/80 hover:text-white underline underline-offset-[3px] transition-colors">
              All articles
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-5 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:overflow-visible md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {READS.map((post, i) => {
              const caution = post.imageEffect === "blur-caution";
              return (
                <Reveal key={post.slug} delay={i * 0.08} className="flex-none w-[280px] snap-start md:w-auto">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group h-full bg-white text-[#282828] rounded-[14px] overflow-hidden flex flex-col transition-shadow hover:shadow-[0_18px_40px_rgba(0,0,0,0.3)]"
                  >
                    <div className="relative aspect-[3/2] overflow-hidden bg-[#e3f1ef]">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                        className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${caution ? "blur-[3px] scale-105" : ""}`}
                      />
                      {caution && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="bg-[#d2ff34] px-4 py-3 flex flex-col items-center gap-1 text-[#282828]">
                            <TriangleAlert size={24} />
                            <span className="text-[10px] uppercase tracking-[0.14em]">Caution</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-2.5 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#248179]">
                        {post.category} <span className="text-[#b0a8a4]">·</span> {post.readTime}
                      </span>
                      <span className="font-display font-light text-[22px] leading-[1.15] tracking-[-0.01em] flex-1">{post.title}</span>
                      <span className="text-[12px] text-[#4a4a4a]">{post.date}</span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
