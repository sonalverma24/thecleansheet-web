import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopMarketplace from "./ShopMarketplace";

export const metadata: Metadata = {
  title: "Shop Safe - Verified Beauty Products",
  description:
    "Browse India's safest beauty and personal care products. Filter by score, skin type, concern, and more. Every product scored by The Clean Sheet.",
};

export default function ShopPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_SHOP !== "true") notFound();
  return <ShopMarketplace />;
}
