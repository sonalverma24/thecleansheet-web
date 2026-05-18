import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { getAllGuideSlugs } from "@/lib/skin-guides";
import { getAllIngredientSlugs } from "@/lib/ingredient-utils";

const BASE = "https://thecleansheet.in";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...staticRoutes, ...blogRoutes, ...guideRoutes, ...ingredientRoutes];
}
