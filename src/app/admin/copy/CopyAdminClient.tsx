"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";

type Row = { key: string; value: string; updated_by: string; updated_at: string };

/** Where an edited line lives, from the first part of its key. */
const PAGE_OF: Record<string, string> = { home: "/", footer: "/", about: "/about", methodology: "/methodology" };

export function CopyAdminClient() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/copy", { cache: "no-store" })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error ${r.status}`); setRows(d.rows); })
      .catch((e: Error) => setError(e.message));
  }, []);

  const reset = async (key: string) => {
    if (!confirm(`Put the original wording back for "${key}"?`)) return;
    setBusy(key); setError(null);
    try {
      const r = await fetch("/api/admin/copy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, reset: true }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error ${r.status}`);
      setRows((rs) => (rs ?? []).filter((x) => x.key !== key));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (error && !rows) return <p className="text-sm text-[#c0392b]">{error}</p>;
  if (!rows) return <p className="text-sm text-[#8a817c] flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading…</p>;
  if (!rows.length) return <p className="text-sm text-[#8a817c]">No wording has been changed yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-[#c0392b]">{error}</p>}
      {rows.map((r) => (
        <div key={r.key} className="rounded-2xl border border-[#b0a8a4]/20 bg-white p-4 flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            <a href={PAGE_OF[r.key.split(".")[0]] ?? "/"} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-[#248179] break-all">{r.key} ↗</a>
            <p className="text-[14px] text-[#282828] mt-1 whitespace-pre-wrap">{r.value}</p>
            <p className="text-[11px] text-[#8a817c] mt-1">{r.updated_by} · {new Date(r.updated_at).toLocaleString("en-IN")}</p>
          </div>
          <button type="button" onClick={() => reset(r.key)} disabled={busy === r.key}
            className="flex-none flex items-center gap-1 rounded-lg border border-[#e5dfd6] px-3 py-1.5 text-[12px] text-[#4a4a4a] disabled:opacity-50">
            {busy === r.key ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Reset
          </button>
        </div>
      ))}
    </div>
  );
}
