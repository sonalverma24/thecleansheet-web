"use client";

import { useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import { COLOUR_CHOICES } from "@/lib/admin-analysis-edits";

type Preview = { oldPill: string; newPill: string; ingredients: number; listSource: string | null; listSourceUrl: string | null; usedYourList: boolean; productName: string };
type Outcome = { published: boolean; problems: string[]; preview: Preview };

const colourName = (k: string) => COLOUR_CHOICES.find((c) => c.key === k)?.label ?? k;
const SOURCE_NAME: Record<string, string> = {
  "brand-page": "the brand's own page", decoder: "INKEE Decoder", nykaa: "Nykaa", "owner-supplied": "your list (typed from the pack)",
};

/** Add an ingredient list typed from the pack and re-analyse the product. Lives on /admin/repository/<slug>. */
export function IngredientsPanel({ slug, ingredients, listSource, listSourceUrl, productPageUrl, onPublished }: {
  slug: string; ingredients: string[]; listSource: string | null; listSourceUrl: string | null; productPageUrl: string | null; onPublished: () => void;
}) {
  const [list, setList] = useState("");
  const [sourceUrl, setSourceUrl] = useState(productPageUrl ?? "");
  const [note, setNote] = useState("");
  const [publishAnyway, setPublishAnyway] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listProblems, setListProblems] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const run = async () => {
    if (!confirm("Re-analyse this product now? It takes one to three minutes and uses a paid model run. The live page only changes if the result is published.")) return;
    setBusy(true); setError(null); setListProblems([]); setOutcome(null);
    try {
      const r = await fetch("/api/admin/reanalyse", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, list: list.trim() || undefined, sourceUrl, note, publishAnyway }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(d.error ?? `Error ${r.status}`); setListProblems(d.listProblems ?? []); return; }
      setOutcome(d);
      if (d.published) onPublished();
    } catch {
      setError("Lost the connection while the analysis ran. Reload the page to see whether it was published.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="ingredients" className="rounded-2xl border border-[#b0a8a4]/20 bg-white p-5 flex flex-col gap-4 scroll-mt-6">
      <div>
        <h2 className="text-[15px] font-bold text-[#282828] flex items-center gap-2"><FlaskConical size={16} /> Ingredients</h2>
        {ingredients.length ? (
          <p className="text-[13px] text-[#4a4a4a] mt-1">
            {ingredients.length} ingredients, from {SOURCE_NAME[listSource ?? ""] ?? listSource ?? "an unknown source"}
            {listSourceUrl && <> (<a href={listSourceUrl} target="_blank" rel="noreferrer" className="text-[#248179] underline">source</a>)</>}.
          </p>
        ) : (
          <p className="text-[13px] text-[#c23d35] mt-1 font-bold">This analysis has no ingredient list, so the safety check could not run.</p>
        )}
        {ingredients.length > 0 && (
          <details className="mt-2 text-[12px] text-[#4a4a4a]"><summary className="cursor-pointer text-[#248179]">Show the list</summary><p className="mt-1">{ingredients.join(", ")}</p></details>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-[#282828]">Ingredient list, exactly as printed on the pack</span>
        <textarea value={list} onChange={(e) => setList(e.target.value)} rows={5} placeholder="Aqua, Glycerin, Niacinamide, …"
          className="w-full rounded-xl border border-[#e5dfd6] p-3 text-[13px] leading-[1.5] font-mono focus:outline-none focus:border-[#248179]" />
        <span className="text-[12px] text-[#8a817c]">Copy it letter for letter from the pack or the pack photo, never from a retailer listing or memory. It is used only if the analysis finds no list on Decoder, the brand&apos;s page or Nykaa. Leave it empty to just re-run the analysis.</span>
      </label>
      {list.trim() && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-[#282828]">Where the product is shown</span>
            <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://brand.com/products/…"
              className="rounded-xl border border-[#e5dfd6] p-2.5 text-[13px] focus:outline-none focus:border-[#248179]" />
            <span className="text-[12px] text-[#8a817c]">The product&apos;s page on the brand&apos;s own website, or its INKEE Decoder page.</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-[#282828]">Where you read the list</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Back of the pack, bought 10 Nov 2026"
              className="rounded-xl border border-[#e5dfd6] p-2.5 text-[13px] focus:outline-none focus:border-[#248179]" />
          </label>
        </>
      )}

      <label className="flex items-start gap-2 text-[13px] text-[#4a4a4a]">
        <input type="checkbox" checked={publishAnyway} onChange={(e) => setPublishAnyway(e.target.checked)} className="mt-0.5" />
        Publish even if the result fails a check (normally a failing result is shown to you and not published)
      </label>

      {error && (
        <div className="text-[13px] text-[#c0392b]">
          {error}
          {listProblems.length > 0 && <ul className="list-disc ml-5 mt-1">{listProblems.map((p) => <li key={p}>{p}</li>)}</ul>}
        </div>
      )}
      {outcome && (
        <div className={`rounded-xl p-3 text-[13px] ${outcome.published ? "bg-[#e3f1ef] text-[#1d5f59]" : "bg-[#fff8eb] text-[#6b4a0f]"}`}>
          <p className="font-bold">{outcome.published ? "Published. The live page now shows the new analysis." : "Not published: the result failed a check."}</p>
          <p className="mt-1">
            Colour {colourName(outcome.preview.oldPill)} → {colourName(outcome.preview.newPill)} · {outcome.preview.ingredients} ingredients
            {outcome.preview.listSource && <> from {SOURCE_NAME[outcome.preview.listSource] ?? outcome.preview.listSource}</>}
          </p>
          {list.trim() && !outcome.preview.usedYourList && outcome.preview.ingredients > 0 && (
            <p className="mt-1">Your list was not used, because the analysis found a list from a primary source.</p>
          )}
          {outcome.problems.length > 0 && <ul className="list-disc ml-5 mt-1">{outcome.problems.map((p) => <li key={p}>{p}</li>)}</ul>}
        </div>
      )}

      <button type="button" onClick={run} disabled={busy}
        className="self-start flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-bold text-white disabled:opacity-60" style={{ background: "#248179" }}>
        {busy ? <><Loader2 size={14} className="animate-spin" /> Analysing… (1–3 minutes, keep this tab open)</> : list.trim() ? "Add list and re-analyse" : "Re-analyse"}
      </button>
    </section>
  );
}
