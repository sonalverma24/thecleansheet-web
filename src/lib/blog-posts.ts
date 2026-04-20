export type BlogPost = {
  slug: string;
  category: string;
  readTime: string;
  date: string;
  title: string;
  subtitle: string;
  excerpt: string;
  author: string;
  image: string;
  imageEffect?: "blur-caution";
  content: BlogBlock[];
};

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "numbered-heading"; n: string; text: string }
  | { type: "before-after"; before: string; after: string }
  | { type: "callout"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "divider" }
  | { type: "cta"; text: string; href: string; label: string };

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "your-9-step-routine-is-not-a-personality-trait",
    category: "Consumer Safety",
    readTime: "10 min read",
    date: "April 19, 2026",
    title: "Your 9-Step Routine Is Not a Personality Trait",
    subtitle: "TikTok turned skincare into performance art. Your skin didn't ask for a 9-act production. Here's what the science actually says.",
    excerpt: "Somewhere between 2020 and now, skincare stopped being about skin. It became content. It became identity. Let's have an honest conversation about what's actually happening to your face.",
    author: "The Clean Sheet Team",
    image: "/images/9-step-routine.png",
    content: [
      {
        type: "paragraph",
        text: "Somewhere between 2020 and now, skincare stopped being about skin. It became content. It became identity. It became the thing you film at 6 AM with ring lighting and a marble tray while whispering about your \"holy grail\" niacinamide serum like it's a religious experience.",
      },
      {
        type: "paragraph",
        text: "And look, no judgment if that's your thing. But let's have an honest conversation about what's actually happening to your face when you layer nine products every morning because a 22-year-old with a brand deal told you to.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Shelfie Industrial Complex",
      },
      {
        type: "paragraph",
        text: "The skincare \"shelfie\" is arguably the most effective piece of consumer marketing this generation has ever produced, and nobody even had to pay for it. You did it for free. You bought the products, arranged them prettily, photographed them, posted them, tagged the brands, and became a walking billboard. Congratulations.",
      },
      {
        type: "paragraph",
        text: "Here's what the shelfie culture actually incentivises: buying more products. Not better ones. Not the right ones for your skin. Just more. Because a three-product routine doesn't photograph well. It doesn't get engagement. It doesn't feel like you're \"investing in yourself.\"",
      },
      {
        type: "paragraph",
        text: "The dermatological reality is significantly less aesthetic. Most people need a cleanser, a moisturiser, and sunscreen. That's it. Three products. Maybe four if you have a specific concern like acne or hyperpigmentation that warrants one targeted active. The nine-step routine isn't skincare. It's a hobby cosplaying as health.",
      },
      {
        type: "heading",
        level: 2,
        text: "More Products, More Problems",
      },
      {
        type: "paragraph",
        text: "Every product you add to your routine is another set of ingredients interacting with your skin barrier and with each other. Some of those interactions are fine. Some are actively counterproductive.",
      },
      {
        type: "paragraph",
        text: "Layering a retinol with an AHA? You're not being diligent. You're carpet-bombing your moisture barrier. Stacking three different serums with overlapping actives? You're not getting triple the results. You're getting irritation, sensitisation, and sometimes the exact breakouts you were trying to prevent.",
      },
      {
        type: "callout",
        text: "Dermatologists have a term for this: over-treatment. It's increasingly common in patients under 30, and the primary driver isn't bad skin. It's social media.",
      },
      {
        type: "paragraph",
        text: "People with perfectly healthy skin are creating problems by over-exfoliating, over-treating, and over-layering because their feed told them that healthy skin requires effort, performance, and a minimum of seven steps. It doesn't.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Ingredient Hype Cycle Is Real",
      },
      {
        type: "paragraph",
        text: "Remember when hyaluronic acid was going to save us all? Then it was niacinamide. Then retinol. Then snail mucin. Then peptides. Then ceramides. Then bakuchiol for people who were scared of retinol but still wanted to say they were using an active.",
      },
      {
        type: "paragraph",
        text: "Every single one of these ingredients has legitimate science behind it. That's not the problem. The problem is how they're marketed: as must-haves, as non-negotiables, as things your routine is \"incomplete\" without. That framing exists to sell you a new product every quarter. It has nothing to do with what your specific skin needs.",
      },
      {
        type: "paragraph",
        text: "Your skin doesn't follow trends. It doesn't know that peptides are having a moment. It has a barrier, and it either works or it doesn't. The ingredients that help your skin depend on your skin's actual condition, not on what's trending on SkinTok this month.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Influencer Is Not Your Dermatologist",
      },
      {
        type: "paragraph",
        text: "This one should be obvious, but apparently it's not: the person recommending your skincare routine should ideally have a medical degree. Or at least a cosmetic chemistry background. Or, at the absolute minimum, no financial stake in you buying the product they're recommending.",
      },
      {
        type: "paragraph",
        text: "Most skincare influencers fail all three criteria. They are not doctors. They are not chemists. And they are being paid, either directly through sponsorships or indirectly through affiliate links, to recommend the exact products they're enthusiastically reviewing. That doesn't make them liars. But it makes them salespeople. And you should treat their advice accordingly.",
      },
      {
        type: "paragraph",
        text: "The really insidious part is that the format itself hides the incentive. A TikTok \"morning routine\" video doesn't feel like an advertisement. It feels like a friend sharing a tip. That's by design. And it works because you trust the format, even when you'd never trust the same claim in a banner ad.",
      },
      {
        type: "heading",
        level: 2,
        text: "What Your Skin Actually Needs (Sorry, It's Boring)",
      },
      {
        type: "paragraph",
        text: "Here's the unsexy truth that no one on your For You Page will tell you because it doesn't generate content:",
      },
      {
        type: "bullets",
        items: [
          "A gentle cleanser. Not a foaming, stripping, exfoliating, pH-balancing, triple-action cleanser. A gentle one. Your skin's barrier is not a challenge to be overcome.",
          "A moisturiser that works for your skin type. Doesn't need to be expensive. Doesn't need to have seventeen actives. Needs to hydrate and protect your barrier. That's the job.",
          "Sunscreen. Every day. Even if you're indoors. This is the one product that has unambiguous, overwhelming scientific evidence behind it. SPF 30 minimum, broad spectrum, reapplied every two hours if you're in the sun.",
          "One targeted active, if needed. If you have a specific, diagnosed skin concern, talk to an actual dermatologist about one active that addresses it. One.",
        ],
      },
      {
        type: "paragraph",
        text: "That's it. Four things. It doesn't make a good shelfie. It's not a vibe. But it's what your skin actually needs.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Bottom Line",
      },
      {
        type: "paragraph",
        text: "Nobody is saying you can't enjoy skincare as a ritual. If the nine-step routine brings you joy, by all means, keep doing it. But be honest with yourself about why you're doing it. If it's self-care, great. If it's because you genuinely believe your skin requires nine products to function, that belief was manufactured by the people selling you those products.",
      },
      {
        type: "paragraph",
        text: "Your skin is not broken. It's not a project. And it definitely didn't ask you to layer a vitamin C serum, two toners, a retinol, an eye cream, and a sleeping mask on it every night.",
      },
      {
        type: "paragraph",
        text: "Sometimes the most radical thing you can do for your skin is less.",
      },
      {
        type: "cta",
        text: "Want to know if the products in your routine are actually doing anything?",
        href: "/analyzer",
        label: "Ask Clean — Check Your Ingredients",
      },
    ],
  },
  {
    slug: "your-favourite-skincare-brand-is-lying-to-you",
    category: "Consumer Safety",
    readTime: "8 min read",
    date: "April 19, 2026",
    title: "Your Favourite Skincare Brand Is Lying to You (And the Law Just Noticed)",
    subtitle: "How to spot BS claims on Instagram, decode your INCI list, and stop falling for marketing that has literally zero science behind it.",
    excerpt: "\"Chemical-free\" is not a thing. Water is a chemical. You are chemicals. And yet brands keep slapping it on labels because it works. Regulators in India, the EU, and the US are finally done watching from the sidelines.",
    author: "The Clean Sheet Team",
    image: "/images/favourite-skincare-brand.png",
    imageEffect: "blur-caution",
    content: [
      {
        type: "paragraph",
        text: "Let's get one thing out of the way: \"chemical-free\" is not a thing. Water is a chemical. You are chemicals. Everything your favourite influencer-turned-skincare-founder puts in that pastel bottle with the minimalist font? Chemicals. Every single molecule.",
      },
      {
        type: "paragraph",
        text: "And yet brands keep slapping it on labels because it works. It makes you feel like you're choosing something pure, something safe, something better. But here's the plot twist nobody in your Instagram feed is talking about: regulators in India, the EU, and the US are finally done watching from the sidelines. They're coming for the claims. And it's about to get messy.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Vibes-Based Marketing Era Is Over",
      },
      {
        type: "paragraph",
        text: "For years, beauty marketing in India operated on vibes. Slap \"natural\" on the label, add a leaf graphic, film a reel with golden hour lighting, done. No one checked. No one asked \"natural compared to what?\" or \"tested by whom, exactly?\"",
      },
      {
        type: "paragraph",
        text: "That era? Expired. India's Central Consumer Protection Authority started issuing notices to beauty brands for misleading claims. The ASCI processed a record number of beauty-related complaints in 2025. And the EU is requiring documented evidence for every single green claim a brand makes.",
      },
      {
        type: "callout",
        text: "If your favourite serum says \"clinically proven,\" there better be an actual clinical study behind it. Not a vibe. Not an in-house \"panel.\" A real, documented, peer-reviewed or IRB-approved study.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Red Flags on Your Shelf Right Now",
      },
      {
        type: "paragraph",
        text: "Here's a cheat sheet. If you see any of these on a product you own, it's worth a second look:",
      },
      {
        type: "bullets",
        items: [
          "\"Chemical-free\" — Scientifically impossible. A marketing fabrication. Full stop.",
          "\"100% natural\" — Requires full ingredient substantiation. Most brands cannot back this up.",
          "\"Dermatologist tested\" — Tested how? By one dermatologist in a room? On how many people? This claim is meaningless without specifics.",
          "\"Clinically proven\" — Proven by what clinical trial? Where's the paper? If there's no citation, it's decoration.",
          "\"Paraben-free\" used as a selling point — Regulators are now flagging this as fearmongering. Parabens at regulated levels are considered safe. Using their absence as a premium badge is increasingly scrutinised.",
        ],
      },
      {
        type: "paragraph",
        text: "None of this means every brand using these terms is evil. Some brands genuinely reformulate and test rigorously. But the ones that don't? They've been getting away with it for years. That window is closing.",
      },
      {
        type: "heading",
        level: 2,
        text: "India's Law From 1940 Is Finally Getting Replaced",
      },
      {
        type: "paragraph",
        text: "Here's something wild: the law governing every beauty product sold in India was written in 1940. Before independence. Before SPF was a thing. Before the concept of \"active ingredients\" even existed in mainstream skincare.",
      },
      {
        type: "paragraph",
        text: "The Drugs and Cosmetics Act of 1940 is finally being replaced by the Drugs, Medical Devices and Cosmetics Act 2025, which was presented to the Union Health Ministry in October 2025. When it reaches Parliament, it will be the most significant overhaul of cosmetics regulation in India in 85 years.",
      },
      {
        type: "paragraph",
        text: "What does that mean for you? CDSCO, India's central regulator, will get statutory power to enforce immediate product recalls. BIS certification is expected to go mandatory for cosmetics by end of 2026. Brands that have been operating without verified safety documentation are about to face a legal reckoning.",
      },
      {
        type: "callout",
        text: "The gap between brands that did the work and brands that faked it is about to become legally enforceable.",
      },
      {
        type: "heading",
        level: 2,
        text: "How to Actually Protect Yourself",
      },
      {
        type: "paragraph",
        text: "Regulation is catching up, but it's not here yet. For the next 12–18 months, compliant and non-compliant products will sit side-by-side on the same shelves and in the same Instagram ads. So here's what you can do right now:",
      },
      {
        type: "bullets",
        items: [
          "Learn to read the INCI list. It's the real ingredient list, not the marketing version. Every product sold in India must have one. If you can't find it, that's already a red flag.",
          "Ask what's been tested. Not \"is it tested\" — everything is technically \"tested.\" Ask what was tested, how, and by whom. A brand that's done the work will have answers.",
          "Look for third-party verification. BIS marks, independent lab certifications, published safety assessments. If the only proof of quality is the brand's own Instagram caption, that's not proof.",
          "Stop rewarding aesthetic over evidence. A gorgeous label and a clean brand identity are not substitutes for formulation transparency. Some of the safest products on the market have the ugliest packaging.",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "The Bottom Line",
      },
      {
        type: "paragraph",
        text: "The beauty industry in India is at a turning point. The brands that built their business on genuine formulation rigour, proper documentation, and ingredient transparency are about to be vindicated. The ones that coasted on aesthetics and ambiguity are about to be exposed.",
      },
      {
        type: "paragraph",
        text: "You don't need to become a cosmetic chemist. But you do need to stop trusting packaging at face value. The information is there. The regulation is coming. And the brands that are worth your money? They'll welcome the scrutiny.",
      },
      {
        type: "paragraph",
        text: "The rest will rebrand. Again.",
      },
      {
        type: "cta",
        text: "Not sure what's actually in your products?",
        href: "/analyzer",
        label: "Ask Clean — Check Your Ingredients",
      },
    ],
  },
  {
    slug: "when-regulators-start-editing-your-marketing",
    category: "Regulation",
    readTime: "12 min read",
    date: "April 6, 2026",
    title: "When Regulators Start Editing Your Marketing",
    subtitle: "In 2026, regulators are no longer just approving products, they are editing narratives. A new power shift in beauty no one is talking about.",
    excerpt: "In 2026, regulators are no longer just approving products, they are editing narratives. A new power shift in beauty no one is talking about.",
    author: "The Clean Sheet Team",
    image: "/images/regulators-marketing.png",
    content: [
      {
        type: "paragraph",
        text: "For decades, beauty marketing operated under a simple assumption: regulators decide what's safe, marketers decide what's appealing. The product passes safety checks, then the brand tells whatever story it wants about efficacy, purity, and transformation.",
      },
      {
        type: "paragraph",
        text: "That assumption is collapsing.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Marketing Claim Is Becoming the Regulatory Target",
      },
      {
        type: "paragraph",
        text: "In the EU, the Cosmetics Regulation has always required that claims be truthful, evidenced, and fair. But enforcement was inconsistent. In 2025–2026, that changed. The European Commission issued updated guidance specifically targeting 'green claims', words like natural, eco, clean, and sustainable, requiring brands to substantiate each one with documented evidence.",
      },
      {
        type: "paragraph",
        text: "In India, the Central Consumer Protection Authority has begun issuing notices to beauty brands for claims deemed misleading. The ASCI (Advertising Standards Council of India) processed its highest-ever number of beauty-related complaints in 2025.",
      },
      {
        type: "callout",
        text: "\"Chemical-free\" is not a claim. It's a scientific impossibility. And regulators are starting to treat it as one.",
      },
      {
        type: "heading",
        level: 2,
        text: "What Claims Are Now Under Scrutiny",
      },
      {
        type: "bullets",
        items: [
          "\"Chemical-free\", scientifically false, now being flagged",
          "\"100% natural\", requires full INCI substantiation",
          "\"Dermatologist tested\", must specify what was tested and by whom",
          "\"Clinically proven\", requires peer-reviewed or IRB-approved evidence",
          "\"Paraben-free\" as a premium positioning, under scrutiny for fearmongering",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "What This Means for Brands",
      },
      {
        type: "paragraph",
        text: "The era of aspirational, evidence-free marketing in beauty is ending. Not because consumers demanded it, though they are increasingly skeptical, but because regulators are building the infrastructure to enforce it.",
      },
      {
        type: "paragraph",
        text: "Brands that have built marketing on vague naturalness claims without documentation are the most exposed. The fix isn't legal, it's scientific. It requires actual formulation documentation, third-party testing, and honest labelling.",
      },
      {
        type: "cta",
        text: "Is your product's marketing backed by real data?",
        href: "/brands",
        label: "Get Certified",
      },
    ],
  },
  {
    slug: "cosmetic-regulations-india-eu-us-guide",
    category: "Regulation",
    readTime: "25 min read",
    date: "March 28, 2024",
    title: "Cosmetic Regulations: India, EU, US, Practical 2025 Guide",
    subtitle: "A comprehensive guide addressing CDSCO rules, EU Regulation 1223/2009, and US MoCRA requirements across three major markets.",
    excerpt: "A comprehensive guide addressing CDSCO rules, EU Regulation 1223/2009, and US MoCRA requirements across three major markets.",
    author: "The Clean Sheet Team",
    image: "/images/cosmetic-regulations-world.jpg",
    content: [
      {
        type: "paragraph",
        text: "If you're formulating or selling cosmetics across markets, you're operating under three very different regulatory frameworks, each with distinct requirements for safety, labelling, and prohibited substances.",
      },
      {
        type: "paragraph",
        text: "This guide covers the practical differences between India's CDSCO framework, the EU Cosmetics Regulation (EC) No 1223/2009, and the US MoCRA (Modernization of Cosmetics Regulation Act).",
      },
      {
        type: "heading",
        level: 2,
        text: "India, CDSCO & the Drugs and Cosmetics Act",
      },
      {
        type: "paragraph",
        text: "India's primary cosmetics law is the Drugs and Cosmetics Act, 1940 (being replaced in 2025–26). The Central Drugs Standard Control Organisation (CDSCO) oversees licensing and enforcement.",
      },
      {
        type: "bullets",
        items: [
          "Prohibited substances list: IS 4707 Part 2 (updated September 2025)",
          "Imported cosmetics require import license under D&C Rules, Schedule Q",
          "No pre-market approval required for most cosmetics",
          "INCI nomenclature technically required but enforcement has been inconsistent",
          "BIS certification being piloted and expected mandatory by end of 2026",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "EU, Regulation (EC) No 1223/2009",
      },
      {
        type: "paragraph",
        text: "The EU has the most comprehensive cosmetics regulatory framework globally. All cosmetics must have a Product Information File (PIF), a Cosmetic Product Safety Report (CPSR) signed by a qualified assessor, and be notified on the CPNP portal before sale.",
      },
      {
        type: "bullets",
        items: [
          "1,328 substances prohibited (Annex II)",
          "Restricted substances list (Annex III) with concentration limits",
          "Mandatory CPSR by a qualified safety assessor",
          "CPNP portal notification required pre-market",
          "Claims substantiation required and auditable",
          "Nanomaterial notification required",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "US, MoCRA (2022, enforced 2024–25)",
      },
      {
        type: "paragraph",
        text: "The Modernization of Cosmetics Regulation Act of 2022 was the first major update to US cosmetics law since 1938. Full FDA enforcement began in 2024.",
      },
      {
        type: "bullets",
        items: [
          "Facility registration and product listing now mandatory (FDA)",
          "Safety substantiation required and must be on file",
          "Adverse event reporting requirements",
          "Fragrance allergen disclosure coming into effect",
          "Talc and PFAS testing requirements for some categories",
        ],
      },
      {
        type: "callout",
        text: "The global direction is clear: more documentation, more transparency, more liability. Building a compliance system now is cheaper than retrofitting it later.",
      },
      {
        type: "cta",
        text: "Want your product evaluated against all three frameworks?",
        href: "/brands",
        label: "Apply for Certification",
      },
    ],
  },
  {
    slug: "baby-skincare-comparative-safety-report",
    category: "Health",
    readTime: "15 min read",
    date: "December 21, 2024",
    title: "Baby Skincare Products – Comparative Safety & Effectiveness Report",
    subtitle: "Evaluation analyzing safety, effectiveness, transparency, and regulatory compliance across 50+ baby skincare products sold in India.",
    excerpt: "Evaluation analyzing safety, effectiveness, transparency, and regulatory compliance across 50+ baby skincare products sold in India.",
    author: "The Clean Sheet Team",
    image: "/images/baby-skincare.jpg",
    content: [
      {
        type: "paragraph",
        text: "Baby skincare is one of the most emotionally charged, and least regulated, segments in Indian beauty. Parents pay premium prices for products marketed as 'gentle', 'natural', and 'safe for babies'. The gap between those claims and the actual formulations is often significant.",
      },
      {
        type: "paragraph",
        text: "We evaluated over 50 baby skincare products sold in India across four categories: body wash & shampoo, moisturisers & lotions, diaper rash creams, and baby oils. Every product was assessed using The Clean Sheet framework across safety, efficacy, transparency, and regulatory compliance.",
      },
      {
        type: "heading",
        level: 2,
        text: "Key Findings",
      },
      {
        type: "bullets",
        items: [
          "68% of products contain fragrance or parfum without allergen disclosure",
          "42% use preservatives with moderate-to-high sensitization potential",
          "Only 23% had complete INCI lists accessible on product packaging",
          "12% contained ingredients on the updated IS 4707 Part 2 restricted list",
          "Premium-priced products showed no significant safety advantage over budget alternatives",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "The Fragrance Problem",
      },
      {
        type: "paragraph",
        text: "Fragrance, listed as 'parfum' or 'fragrance', is the single largest source of hidden allergens in baby skincare. It's a catch-all term that can contain hundreds of undisclosed compounds, including known sensitizers. Yet 68% of products we evaluated used it without any allergen breakdown.",
      },
      {
        type: "callout",
        text: "\"Fragrance-free\" and \"unscented\" are not the same. Unscented products often contain masking fragrances. Always look for \"fragrance-free\" specifically.",
      },
      {
        type: "heading",
        level: 2,
        text: "What to Look for When Buying Baby Skincare",
      },
      {
        type: "bullets",
        items: [
          "Full INCI list on the packaging, not just the website",
          "No 'parfum' or 'fragrance' listed as an ingredient",
          "Preservative system with low sensitization potential (e.g., sodium benzoate, potassium sorbate)",
          "pH appropriate for baby skin (4.5–5.5 for most products)",
          "Third-party safety testing documentation available on request",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "The Price Myth",
      },
      {
        type: "paragraph",
        text: "There is no correlation between price and safety in the baby skincare segment. Several budget products outperformed premium products on our safety and transparency scores. Marketing spend, not formulation quality, drives pricing in this category.",
      },
      {
        type: "cta",
        text: "Want to check a specific baby product?",
        href: "/analyzer",
        label: "Ask Clean — Check Any Product",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
