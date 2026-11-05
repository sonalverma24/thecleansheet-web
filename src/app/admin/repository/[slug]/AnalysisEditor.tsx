"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { COLOUR_CHOICES, EDITABLE_FIELDS, type AdminAnalysisEdits } from "@/lib/admin-analysis-edits";
import type { DecisionKey } from "@/lib/analyser-x";

type Loaded = {
  slug: string;
  productName: string;
  brand: string;
  reviewedAt: string | null;
  colour: DecisionKey;
  original: Record<string, string | string[]>;
  hasCheatCode: boolean;
  edits: AdminAnalysisEdits | null;
};

const asText = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join("\n") : v ?? "");
const colourOf = (k: DecisionKey | undefined) => COLOUR_CHOICES.find((c) => c.key === k);

export function AnalysisEditor({ slug }: { slug: string }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [colour, setColour] = useState<DecisionKey | "">("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"save" | "clear" | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const fill = (d: Loaded) => {
    setData(d);
    setColour(d.edits?.colour ?? "");
    setDrafts(Object.fromEntries(EDITABLE_FIELDS.map((f) => [f.id, asText(d.edits?.text?.[f.id] ?? d.original[f.id])])));
  };

  useEffect(() => {
    fetch(`/api/admin/analysis?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error ${r.status}`); fill(d); })
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  const post = async (body: object, kind: "save" | "clear") => {
    setBusy(kind); setError(null); setSaved(null);
    try {
      const r = await fetch("/api/admin/analysis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, ...body }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error ${r.status}`);
      if (data) fill({ ...data, edits: d.edits });
      setSaved(kind === "clear" ? "All edits removed. The page shows the analysis as the rules made it." : "Saved. The live page, its listing card and comparisons now show this.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const save = () => {
    if (!data) return;
    const text: Record<string, string | string[]> = {};
    for (const f of EDITABLE_FIELDS) {
      const v = drafts[f.id] ?? "";
      text[f.id] = f.kind === "list" ? v.split("\n").map((l) => l.trim()).filter(Boolean) : v.trim();
    }
    post({ colour: colour || undefined, text }, "save");
  };

  if (error && !data) return <p className="text-sm text-[#c0392b]">{error}</p>;
  if (!data) return <p className="text-sm text-[#8a817c] flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading…</p>;

  const machine = colourOf(data.colour);
  const editedIds = new Set(Object.keys(data.edits?.text ?? {}));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/repository" className="text-[13px] text-[#248179] flex items-center gap-1 mb-3"><ArrowLeft size={14} /> Repository</Link>
        <p className="text-[12px] text-[#8a817c] font-mono">{data.brand} · {data.slug}</p>
        <h1 className="text-2xl text-[#282828]" style={{ fontFamily: "Cooper BT, Georgia, serif" }}>{data.productName}</h1>
        <div className="mt-2 flex flex-wrap gap-3 text-[13px]">
          <a href={`/analysis/${data.slug}`} target="_blank" rel="noreferrer" className="text-[#248179] underline underline-offset-2">Open live page ↗</a>
          {data.edits && <span className="text-[#8a817c]">Last edited by {data.edits.editedBy} on {new Date(data.edits.editedAt).toLocaleString("en-IN")}</span>}
        </div>
      </div>

      <div className="rounded-xl border border-[#D97706]/30 bg-[#fff8eb] p-3 text-[13px] text-[#6b4a0f] flex gap-2">
        <TriangleAlert size={16} className="flex-none mt-0.5" />
        <span>Edits replace what the analysis wrote. If this product is re-analysed, the new analysis replaces these edits, so note anything you want to keep.</span>
      </div>

      <section className="rounded-2xl border border-[#b0a8a4]/20 bg-white p-5">
        <h2 className="text-[15px] font-bold text-[#282828]">Rating colour</h2>
        <p className="text-[13px] text-[#8a817c] mt-1">
          The rules give this product <b style={{ color: machine?.colour }}>{machine?.label ?? data.colour}</b>. Choose another colour only when you are sure: the sections below the colour still show the rules&apos; findings, so the page can disagree with itself.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setColour("")}
            className={`rounded-full px-3.5 py-1.5 text-[13px] border ${colour === "" ? "border-[#282828] bg-[#282828] text-white" : "border-[#e5dfd6] text-[#4a4a4a]"}`}>
            Use the rules ({machine?.label})
          </button>
          {COLOUR_CHOICES.filter((c) => c.key !== data.colour).map((c) => (
            <button key={c.key} type="button" onClick={() => setColour(c.key)}
              className="rounded-full px-3.5 py-1.5 text-[13px] border"
              style={colour === c.key ? { background: c.colour, borderColor: c.colour, color: "#fff" } : { borderColor: "#e5dfd6", color: c.colour }}>
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#b0a8a4]/20 bg-white p-5 flex flex-col gap-5">
        <div>
          <h2 className="text-[15px] font-bold text-[#282828]">Wording on the page</h2>
          <p className="text-[13px] text-[#8a817c] mt-1">Lists take one line per entry. A line you leave as it is keeps following the analysis.</p>
        </div>
        {EDITABLE_FIELDS.map((f) => {
          if (f.id === "cheatCode.text" && !data.hasCheatCode) return null;
          const original = asText(data.original[f.id]);
          const draft = drafts[f.id] ?? "";
          const changed = draft.trim() !== original.trim();
          return (
            <label key={f.id} className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between gap-2 text-[13px] font-bold text-[#282828]">
                <span>{f.label}{f.kind === "list" ? " (one per line)" : ""}{editedIds.has(f.id) && <span className="ml-2 text-[11px] font-normal text-[#248179]">edited</span>}</span>
                {changed && (
                  <button type="button" onClick={() => setDrafts((d) => ({ ...d, [f.id]: original }))} className="flex items-center gap-1 text-[12px] font-normal text-[#4a4a4a]">
                    <RotateCcw size={12} /> Original
                  </button>
                )}
              </span>
              <textarea
                value={draft}
                onChange={(e) => setDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                rows={Math.min(8, Math.max(2, draft.split("\n").length + Math.floor(draft.length / 90)))}
                className={`w-full rounded-xl border p-3 text-[14px] leading-[1.5] text-[#282828] focus:outline-none focus:border-[#248179] ${changed ? "border-[#248179] bg-[#f3faf9]" : "border-[#e5dfd6]"}`}
                placeholder={original ? undefined : "(empty on the page)"}
              />
            </label>
          );
        })}
      </section>

      {error && <p className="text-sm text-[#c0392b]">{error}</p>}
      {saved && <p className="text-sm text-[#248179]">{saved}</p>}

      <div className="sticky bottom-4 flex flex-wrap justify-between gap-2 rounded-2xl bg-white/95 border border-[#e5dfd6] p-3 shadow-lg">
        {data.edits ? (
          <button type="button" disabled={!!busy} onClick={() => { if (confirm("Remove every edit on this analysis?")) post({ clear: true }, "clear"); }}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] text-[#4a4a4a] border border-[#e5dfd6] disabled:opacity-50">
            {busy === "clear" ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Remove all edits
          </button>
        ) : <span />}
        <button type="button" disabled={!!busy} onClick={save}
          className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-bold text-white disabled:opacity-50" style={{ background: "#248179" }}>
          {busy === "save" && <Loader2 size={14} className="animate-spin" />} Save and publish
        </button>
      </div>
    </div>
  );
}
