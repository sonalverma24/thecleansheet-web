import { fmt, type SiteStats } from "@/lib/site-stats";

/* Home FAQ copy and its FAQPage structured data. Moved verbatim from the
   previous home page: these answers carry the page's featured-snippet SEO. */

export const buildHomeFaqs = (stats: SiteStats) => [
  {
    q: "How do I check if a beauty product is safe in India?",
    a: "The easiest way is The Clean Sheet's free Product Analyser. Paste a product name or URL and it finds every marketing claim, grades each against real evidence and the actual ingredient list, checks India's advertising and drug-boundary rules, and gives you one clear Clean Sheet standing.",
  },
  {
    q: "What is The Clean Sheet?",
    a: `The Clean Sheet is India's first independent, science-backed clean beauty platform. We provide an AI-powered Product Analyser that checks marketing claims against evidence, an analysed product registry (${fmt(stats.products)} products from ${fmt(stats.brands)} brands so far), a directory of ${fmt(stats.ingredients)} cosmetic ingredients, and a rigorous product certification for beauty brands. Everything is free for consumers.`,
  },
  {
    q: "Is The Clean Sheet's ingredient analysis free?",
    a: "Yes. The Product Analyser is completely free to use. Paste any product name or URL (Nykaa, Amazon, brand website) and you get a full analysis: every claim graded against evidence, the real ingredient list, price parity, and a clear Clean Sheet rating.",
  },
  {
    q: "What does the Clean Sheet rating mean?",
    a: "Every analysed product gets one rating circle, in one of four colours. Green: our checks found no concern in what we could read, and the claims are in proportion to the evidence. Yellow: there is something to read first, such as a claim with no test behind it, an ingredient worth noting or a point in the formula. Red: we found a prohibited ingredient or a serious shortfall in our checks. Grey: we could not rate it, usually because we could not find a full ingredient list, or because it is assessed as a medicine. Open any product page for the reasons and sources behind its colour. A colour is our reading of public information, not a statement about the brand.",
  },
  {
    q: "Which beauty products are analysed by The Clean Sheet in India?",
    a: "You can browse every analysed product at thecleansheet.in/brands. Each has a public page showing its Clean Sheet rating, every marketing claim graded against evidence, the real ingredient list, and price parity across platforms. Brands can also apply for certification at thecleansheet.in/brands.",
  },
  {
    q: "Is niacinamide safe for Indian skin?",
    a: "Yes, niacinamide (Vitamin B3) is considered safe and is rated Low concern by The Clean Sheet. It is permitted under Indian, EU, US & Korean cosmetic regulations with no concentration limit. It is commonly used in serums and moisturisers for its brightening, pore-minimising, and anti-inflammatory properties.",
  },
  {
    q: "Are parabens banned in India?",
    a: "Parabens are not fully banned in India but are restricted. Short-chain parabens like methylparaben and propylparaben are permitted up to 0.4% (individual) or 0.8% (mixed) under Indian cosmetics regulations. However, they are classified as Medium concern by The Clean Sheet due to potential endocrine effects at high concentrations.",
  },
];

export const buildHomeFaqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});
