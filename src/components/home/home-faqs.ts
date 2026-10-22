import { fmt, type SiteStats } from "@/lib/site-stats";

/* Home FAQ copy and its FAQPage structured data. Moved verbatim from the
   previous home page: these answers carry the page's featured-snippet SEO. */

export const buildHomeFaqs = (stats: SiteStats) => [
  {
    q: "How do I check if a beauty product is safe in India?",
    a: "The easiest way is The Clean Sheet's free Product Review tool. Paste a product name or URL and it finds every marketing claim, grades each against real evidence and the actual ingredient list, checks India's advertising and drug-boundary rules, and gives you one clear Clean Sheet standing.",
  },
  {
    q: "What is The Clean Sheet?",
    a: `The Clean Sheet is India's first independent, science-backed clean beauty platform. We provide an AI-powered Product Review tool that checks marketing claims against evidence, a reviewed product registry (${fmt(stats.products)} products from ${fmt(stats.brands)} brands so far), a directory of ${fmt(stats.ingredients)} cosmetic ingredients, and a rigorous product certification for beauty brands. Everything is free for consumers.`,
  },
  {
    q: "Is The Clean Sheet's ingredient analysis free?",
    a: "Yes. The Product Review tool is completely free to use. Paste any product name or URL (Nykaa, Amazon, brand website) and you get a full review: every claim graded against evidence, the real ingredient list, price parity, and a clear Clean Sheet standing.",
  },
  {
    q: "What does the Clean Sheet standing mean?",
    a: "Every reviewed product gets one of three standings. Good Standing (our highest): a well-made, transparent product that passes our independent checks on ingredient safety, regulatory compliance and claim substantiation. Room to Improve: nothing wrong with it, but the proof and transparency don't yet match the claims. Not Recommended: the product makes a claim that isn't permitted in India, or one its own ingredient list contradicts.",
  },
  {
    q: "Which beauty products are reviewed by The Clean Sheet in India?",
    a: "You can browse every reviewed product at thecleansheet.in/brands. Each has a public page showing its Clean Sheet standing, every marketing claim graded against evidence, the real ingredient list, and price parity across platforms. Brands can also apply for certification at thecleansheet.in/brands.",
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
