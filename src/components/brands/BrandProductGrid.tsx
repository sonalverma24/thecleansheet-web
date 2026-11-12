"use client";

import { useMemo, useState } from "react";
import type { ProductScorecard } from "@/data/brands/types";
import MarketCard, { productId } from "@/components/registry/MarketCard";
import { CompareTray } from "@/components/compare/CompareTray";
import { CompareNotice } from "@/components/compare/CompareNotice";
import { compareBlock, compareTypeOf } from "@/lib/compare-group";
import { seedImageFor } from "@/lib/home-shelf";
import { track } from "@/lib/analytics";

/* The products of one brand, on its profile page, drawn with the same card as /products (a pack shot, brand, name, the rating circle, the ticks, one line from
   the analysis, the price and a Compare button). The comparison rules are the /products ones (compare-group.ts: only products of one type, up to the limit); the tray
   and the message are the same components. Unlike /products there is no filter to switch, so the message has no "Show only" button. */

export default function BrandProductGrid({ products }: { products: ProductScorecard[] }) {
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ kind: "unfiled" | "full" | "type"; message: string } | null>(null);

  const typeById = useMemo(() => new Map(products.map((p) => [productId(p), compareTypeOf(p)])), [products]);
  const pickedTypes = comparingIds.map((id) => typeById.get(id) ?? null);
  const blockFor = (id: string) => compareBlock({ picked: pickedTypes, alreadyIn: comparingIds.includes(id), candidateType: typeById.get(id) ?? null });

  const toggle = (id: string) => {
    if (comparingIds.includes(id)) {
      setComparingIds(comparingIds.filter((i) => i !== id));
      setNotice(null);
      return;
    }
    const block = blockFor(id);
    if (block) {
      setNotice({ kind: block.kind, message: block.message });
      track("compare_blocked", { kind: block.kind });
      return;
    }
    setNotice(null);
    setComparingIds([...comparingIds, id]);
  };

  const comparing = useMemo(
    () => comparingIds.map((id) => products.find((p) => productId(p) === id)).filter((p): p is ProductScorecard => !!p),
    [comparingIds, products],
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {products.map((p) => (
          <MarketCard
            key={productId(p)}
            product={p}
            comparing={comparingIds.includes(productId(p))}
            compareBlock={blockFor(productId(p))?.message ?? null}
            onCompare={toggle}
          />
        ))}
      </div>
      {notice && (
        <CompareNotice
          title={notice.kind === "type" ? "Compare like with like" : notice.kind === "full" ? "Your list is full" : "This one cannot be compared yet"}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}
      <CompareTray
        items={comparing.map((p) => ({ id: productId(p), slug: p.slug, name: p.productName, image: seedImageFor(p) ?? p.image ?? null }))}
        type={pickedTypes[0] ?? null}
        onRemove={toggle}
        onClearAll={() => { setComparingIds([]); setNotice(null); }}
      />
      {comparingIds.length > 0 && <div className="h-20" />}
    </>
  );
}
