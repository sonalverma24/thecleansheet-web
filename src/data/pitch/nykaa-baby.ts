import type { PitchProduct } from "./types";

/* Snapshot of the retailer's "Baby Care" listing, captured 14 Oct 2026.
   Order follows the retailer's default (Popularity) sort. Maternity items and
   non-baby oils were left out so every card is a baby or kids care product. */

export const LISTING_TITLE = "Best Baby Care Products Online";
export const LISTING_TOTAL = 589;

const CDN = "https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize";
const P = (slug: string, id: string) => `https://www.nykaa.com/${slug}/p/${id}`;

export const PRODUCTS: PitchProduct[] = [
  {
    id: "10346697", brand: "Nat Habit",
    name: "Nat Habit Brahmi Matsyakshi Summer Dasabuti Baby Hair & Scalp Oil",
    retailerUrl: P("nat-habit-brahmi-matsyakshi-summer-dasabuti-baby-hair-scalp-oil", "10346697"),
    image: `${CDN}/8/e/8ecbd61NATHA00000275bb_bb1.jpg`,
    mrp: 435, price: 370, off: 15, stars: 5, ratingCount: 231, bestseller: true,
  },
  {
    id: "17889837", brand: "Aveeno Baby",
    name: "Aveeno Baby Daily Moisture Wash & Shampoo - Natural Oat Gentle Cleanser For Hair, Sensitive Body Skin",
    retailerUrl: P("aveeno-baby-daily-moisture-wash-shampoo-natural-oat-gentle-cleanser-for-hair-sensitive-body-skin", "17889837"),
    image: `${CDN}/9/f/9f1f6bfAVEEN00000021_1a.jpg`,
    mrp: 1379, price: 1250, off: 9, stars: 5, ratingCount: 5382, sizes: 3, bestseller: true,
  },
  {
    id: "10835165", brand: "Nat Habit",
    name: "Nat Habit Pure Almond Baby Oil",
    retailerUrl: P("nat-habit-pure-almond-baby-oil", "10835165"),
    image: `${CDN}/f/0/f05cabbNATHA00000342_s1.jpg`,
    mrp: 1248, price: 998, off: 20, stars: 4, ratingCount: 286, sizes: 2, bestseller: true,
  },
  {
    id: "17215799", brand: "Aveeno Baby",
    name: "Aveeno Baby Daily Moisture Lotion | Oatmeal Face & Body Moisturizer for Dry, Itchy & Sensitive Skin",
    retailerUrl: P("aveeno-baby-daily-moisture-lotion", "17215799"),
    image: `${CDN}/9/f/9f1f6bfAVEEN00000020_1a.jpg`,
    mrp: 1650, price: 1475, off: 11, stars: 5, ratingCount: 318, bestseller: true,
  },
  {
    id: "20731693", brand: "Bare Anatomy",
    name: "Bare Anatomy Junior Gentle Cleansing Shampoo",
    retailerUrl: P("bare-anatomy-junior-gentle-cleansing-shampoo", "20731693"),
    image: `${CDN}/3/2/32b8bfc8906157904494_1.jpg`,
    mrp: 978, price: 860, off: 12, stars: 4, ratingCount: 4708, sizes: 2, bestseller: true,
  },
  {
    id: "181560", brand: "Aveeno Baby",
    name: "Aveeno Baby Daily Moisture Lotion | Oatmeal Face & Body Moisturizer for Dry, Itchy & Sensitive Skin",
    retailerUrl: P("aveeno-baby-daily-moisturising-lotion", "181560"),
    image: `${CDN}/1/4/145c627381370036647_01.jpg`,
    mrp: 1050, price: 875, off: 17, stars: 4, ratingCount: 1833, bestseller: true,
  },
  {
    id: "10835164", brand: "Nat Habit",
    name: "Nat Habit Pure Virgin Coconut Baby Oil",
    retailerUrl: P("nat-habit-pure-virgin-coconut-baby-oil", "10835164"),
    image: `${CDN}/8/e/8ecbd61NATHA00000340bb_bb1.jpg`,
    mrp: 605, price: 484, off: 20, stars: 4, ratingCount: 630, sizes: 2, bestseller: true,
  },
  {
    id: "22166102", brand: "Cetaphil Baby",
    name: "Cetaphil Baby Soothing Moisturising Cream, 48 Hour Hydration, 8 Hour Barrier Protection",
    retailerUrl: P("cetaphil-baby-soothing-moisturising-cream", "22166102"),
    image: `${CDN}/c/c/cc0c2d43499320017251_1.jpg`,
    mrp: 499, price: 464, off: 7, stars: 4, ratingCount: 494, sizes: 2, bestseller: true, isNew: true,
  },
  {
    id: "757131", brand: "Cetaphil Baby",
    name: "Cetaphil Baby Wash & Shampoo With Organic Calendula, 5 Fold Protection, pH Neutral",
    retailerUrl: P("cetaphil-baby-wash-shampoo-with-organic-calendula", "757131"),
    image: `${CDN}/3/b/3b19299302993936374_1.jpg`,
    mrp: 1499, price: 1379, off: 8, stars: 5, ratingCount: 1541, bestseller: true,
  },
  {
    id: "12710987", brand: "TuCo Kids",
    name: "TuCo Kids Body Lotion, Ages 3-15 - Aloe & Almond",
    retailerUrl: P("tuco-intelligent-kids-mild-lotion", "12710987"),
    image: `${CDN}/f/4/f401002TUCOI00000009_1.jpg`,
    mrp: 375, price: 278, off: 26, stars: 5, ratingCount: 295, sizes: 1,
  },
  {
    id: "278742", brand: "Bioderma",
    name: "Bioderma Ultra-Soothing Foaming Gel Atoderm Intensive Gel Moussant With Niacinamide",
    retailerUrl: P("bioderma-atoderm-intensive-gel-moussant", "278742"),
    image: `${CDN}/7/c/7c9d1b23401560936988_1.jpg`,
    mrp: 849, price: 764, off: 10, stars: 5, ratingCount: 2374,
  },
  {
    id: "12671289", brand: "TuCo Kids",
    name: "TuCo Kids No-Tear Shampoo, Ages 3-15 - Reetha & Henna",
    retailerUrl: P("tuco-intelligent-kids-mild-shampoo", "12671289"),
    image: `${CDN}/f/4/f401002TUCOI00000001_1.jpg`,
    mrp: 450, price: 338, off: 25, stars: 4, ratingCount: 1121, sizes: 1, bestseller: true,
  },
  {
    id: "22786587", brand: "TuCo Kids",
    name: "TuCo Kids Summer Dull Skin Lotion, Ages 3-15 - Turmeric, Kakadu Plum & Rosehip",
    retailerUrl: P("tuco-intelligent-kids-dull-skin-lotion", "22786587"),
    image: `${CDN}/f/4/f401002TUCOI00000033_1.jpg`,
    mrp: 400, price: 208, off: 48, stars: 4, ratingCount: 464, sizes: 2,
  },
  {
    id: "757130", brand: "Cetaphil Baby",
    name: "Cetaphil Baby Daily Lotion With Organic Calendula - 5 Fold Protection & 24-Hour Hydration",
    retailerUrl: P("cetaphil-baby-daily-lotion-with-organic-calendula", "757130"),
    image: `${CDN}/5/e/5e515a3302993936039_v1.jpg`,
    mrp: 1699, price: 1580, off: 7, stars: 5, ratingCount: 1388, bestseller: true,
  },
  {
    id: "81070", brand: "Sebamed",
    name: "Sebamed Baby Protective Facial Cream, pH 5.5, Baby Face Cream, Ideal For Salivary Rashes",
    retailerUrl: P("sebamed-baby-protective-facial-cream-50ml", "81070"),
    image: `${CDN}/2/e/2e7bd7e4103040014870_01.jpg`,
    mrp: 1030, price: 999, off: 3, stars: 4, ratingCount: 1539,
  },
];
