import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { getAllGuideSlugs } from "@/lib/skin-guides";
import { getAllIngredientSlugs } from "@/lib/ingredient-utils";
import { getAllBrandSummaries, getBrandBySlug } from "@/data/brands";
import { listStoredReviews } from "@/lib/product-review-engine";

const BASE = "https://thecleansheet.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                          lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/analyzer`,            lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/certified`,           lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/ingredients`,         lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/certification`,       lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/consumers`,           lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/brands`,              lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`,                lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/learn`,               lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/courses`,             lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`,               lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/methodology`,         lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`,             lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/disclaimer`,          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/privacy-policy`,      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms-of-use`,        lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const guideRoutes: MetadataRoute.Sitemap = getAllGuideSlugs().map((slug) => ({
    url: `${BASE}/learn/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const ingredientRoutes: MetadataRoute.Sitemap = getAllIngredientSlugs().map((slug) => ({
    url: `${BASE}/ingredients/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const brandSummaries = getAllBrandSummaries();

  const brandRoutes: MetadataRoute.Sitemap = brandSummaries.map((b) => ({
    url: `${BASE}/brands/${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const productRoutes: MetadataRoute.Sitemap = brandSummaries.flatMap((b) => {
    const brand = getBrandBySlug(b.slug);
    return (brand?.products ?? []).map((p) => ({
      url: `${BASE}/brands/${b.slug}/${p.slug}`,
      lastModified: new Date(p.analyzedAt),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));
  });

  // Live-reviewed products persisted by the review tool. Each has a permanent,
  // server-rendered page at /reviews/[slug]; without this they were crawlable
  // by URL but undiscoverable (absent from the sitemap and internal links).
  const storedReviews = await listStoredReviews(1000);
  const reviewRoutes: MetadataRoute.Sitemap = storedReviews.map((r) => ({
    url: `${BASE}/reviews/${r.productSlug}`,
    lastModified: r.reviewedAt ? new Date(r.reviewedAt) : now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes, ...guideRoutes, ...ingredientRoutes, ...brandRoutes, ...productRoutes, ...reviewRoutes];
}
