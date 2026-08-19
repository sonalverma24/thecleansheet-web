"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  product_slug: string;
  product_name: string | null;
  brand: string | null;
  image_url: string | null;
  reviewed_at: string | null;
};

export function RepositoryAdminClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/repository")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setRows(d.rows ?? []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyMissing && r.image_url) return false;
      if (!t) return true;
      return (
        (r.product_name ?? "").toLowerCase().includes(t) ||
        (r.brand ?? "").toLowerCase().includes(t) ||
        r.product_slug.toLowerCase().includes(t)
      );
    });
  }, [rows, q, onlyMissing]);

  const missingCount = rows.filter((r) => !r.image_url).length;

  async function saveImage(slug: string) {
    const imageUrl = (drafts[slug] ?? "").trim();
    if (!/^https?:\/\//i.test(imageUrl)) {
      setFlash("Enter a valid http(s) image URL first.");
      return;
    }
    setBusy(slug);
    setFlash(null);
    try {
      const res = await fetch("/api/admin/repository", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-image", slug, imageUrl }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error ?? `HTTP ${res.status}`);
      setRows((prev) => prev.map((r) => (r.product_slug === slug ? { ...r, image_url: imageUrl } : r)));
      setDrafts((prev) => ({ ...prev, [slug]: "" }));
      setFlash(`Image updated for ${slug}.`);
    } catch (e) {
      setFlash(`Failed: ${String(e instanceof Error ? e.message : e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function remove(slug: string, name: string) {
    if (!window.confirm(`Remove this review permanently?\n\n${name}\n${slug}`)) return;
    setBusy(slug);
    setFlash(null);
    try {
      const res = await fetch("/api/admin/repository", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", slug }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error ?? `HTTP ${res.status}`);
      setRows((prev) => prev.filter((r) => r.product_slug !== slug));
      setFlash(`Removed ${slug}.`);
    } catch (e) {
      setFlash(`Failed: ${String(e instanceof Error ? e.message : e)}`);
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p className="text-sm text-[#b0a8a4]">Loading repository…</p>;
  if (error) return <p className="text-sm text-[#fd6158]">Error: {error}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, brand, or slug…"
          className="flex-1 min-w-[220px] rounded-xl border border-[#b0a8a4]/30 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#248179]"
        />
        <label className="flex items-center gap-2 text-sm text-[#282828]">
          <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
          Missing image only ({missingCount})
        </label>
        <span className="text-xs text-[#b0a8a4]">{filtered.length} shown</span>
      </div>

      {flash && (
        <div className="mb-4 rounded-xl border border-[#248179]/25 bg-[#248179]/8 px-4 py-2.5 text-sm text-[#282828]">
          {flash}
        </div>
      )}

      <div className="space-y-2.5">
        {filtered.map((r) => (
          <div key={r.product_slug} className="rounded-2xl border border-[#b0a8a4]/20 bg-white p-3 flex items-start gap-3">
            <div className="w-14 h-14 rounded-lg bg-[#f3efe9] flex items-center justify-center overflow-hidden flex-shrink-0">
              {r.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image_url} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="text-[9px] font-bold text-[#fd6158] text-center leading-tight">NO<br />IMAGE</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#282828] truncate">{r.product_name ?? "(untitled)"}</div>
              <div className="text-[11px] text-[#b0a8a4] font-mono truncate">{r.brand ?? "—"} · {r.product_slug}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  value={drafts[r.product_slug] ?? ""}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [r.product_slug]: e.target.value }))}
                  placeholder="Paste new image URL…"
                  className="flex-1 min-w-[200px] rounded-lg border border-[#b0a8a4]/30 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#248179]"
                />
                <button
                  onClick={() => saveImage(r.product_slug)}
                  disabled={busy === r.product_slug}
                  className="rounded-lg bg-[#248179] text-white text-xs px-3 py-1.5 disabled:opacity-50"
                >
                  {busy === r.product_slug ? "…" : "Save image"}
                </button>
                <a
                  href={`/reviews/${r.product_slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[#b0a8a4]/30 text-[#282828] text-xs px-3 py-1.5"
                >
                  View
                </a>
                <button
                  onClick={() => remove(r.product_slug, r.product_name ?? r.product_slug)}
                  disabled={busy === r.product_slug}
                  className="rounded-lg border border-[#fd6158]/40 text-[#fd6158] text-xs px-3 py-1.5 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-[#b0a8a4]">No reviews match.</p>}
      </div>
    </div>
  );
}
