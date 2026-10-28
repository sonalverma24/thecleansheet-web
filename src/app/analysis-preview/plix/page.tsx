import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { notFound } from 'next/navigation';
import { deriveVerdict } from '@/lib/product-review-engine';
import { pillsFor } from '@/lib/pills-for-review';
import { PillsPage } from '@/components/scorecards/PillsPage';
import { ANALYSER_APPROVED_BASELINE } from '@/lib/analyser-x/version';
import type { ProductReviewResult } from '@/lib/product-review-engine';
export const dynamic='force-dynamic';
export default function PlixPreview(){
 if(process.env.NODE_ENV==='production') notFound();
 const file=join(process.cwd(),'.local-preview/plix-approved-2026-10-28.json');
 if(!existsSync(file)) return <><meta httpEquiv="refresh" content="10"/><main className="p-12">PLIX analysis is running. This page refreshes automatically.</main></>;
 const result=JSON.parse(readFileSync(file,'utf8')) as ProductReviewResult;
 if(result.type!=='product-review') return <main className="p-12"><h1>The live analyser could not finish this product</h1><pre>{JSON.stringify(result,null,2)}</pre></main>;
 const {product,brand,model}=pillsFor(result.review,deriveVerdict(result.review));
 return <><div className="px-6 py-3 bg-amber-50 text-sm">Local preview · {ANALYSER_APPROVED_BASELINE} · no production data saved. Decision: <strong>{model.decision.label}</strong>{model.decision.reasons.map(r=><p key={r.ruleId}>{r.text}</p>)}</div><PillsPage product={product} brand={brand} model={model}/></>;
}
