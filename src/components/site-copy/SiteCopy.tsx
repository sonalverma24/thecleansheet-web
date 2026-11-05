"use client";

/* On-page wording editor.

   <T k="home.hero.title">Wording in the code</T> shows the admin's edited wording when there is one, else its children.
   An admin (ADMIN_EMAILS) sees an "Edit text" button at the bottom-left of every page. With it on, every editable line
   gets a dashed outline; clicking one opens a small editor. Saving goes live at once for everyone. Visitors who are not
   admins never load anything extra: the admin check only runs for a signed-in visitor. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Pencil, X, RotateCcw, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { SiteCopy } from "@/lib/site-copy";

type Ctx = {
  copy: SiteCopy;
  editing: boolean;
  open: (key: string, fallback: string) => void;
};

const SiteCopyContext = createContext<Ctx>({ copy: {}, editing: false, open: () => {} });

export function SiteCopyProvider({ initial, children }: { initial: SiteCopy; children: React.ReactNode }) {
  const { user } = useAuth();
  const [copy, setCopy] = useState<SiteCopy>(initial);
  const [admin, setAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState<{ key: string; fallback: string } | null>(null);

  useEffect(() => {
    if (!user) { setAdmin(false); setEditing(false); return; }
    let live = true;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d: { admin?: boolean }) => { if (live) setAdmin(d.admin === true); })
      .catch(() => {});
    return () => { live = false; };
  }, [user]);

  const open = useCallback((key: string, fallback: string) => setTarget({ key, fallback }), []);
  const value = useMemo(() => ({ copy, editing: admin && editing, open }), [copy, admin, editing, open]);

  return (
    <SiteCopyContext.Provider value={value}>
      {children}
      {admin && (
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="fixed left-4 bottom-4 z-[60] flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold shadow-[0_6px_20px_rgba(40,40,40,0.18)] print:hidden"
          style={{ background: editing ? "#282828" : "#248179", color: "#fff" }}
          aria-pressed={editing}
        >
          {editing ? <X size={14} /> : <Pencil size={14} />}
          {editing ? "Done editing" : "Edit text"}
        </button>
      )}
      {admin && target && (
        <CopyEditor
          k={target.key}
          fallback={target.fallback}
          current={copy[target.key]}
          onClose={() => setTarget(null)}
          onSaved={(value) => {
            setCopy((c) => {
              const next = { ...c };
              if (value === null) delete next[target.key]; else next[target.key] = value;
              return next;
            });
            setTarget(null);
          }}
        />
      )}
    </SiteCopyContext.Provider>
  );
}

/** One editable line of site wording. Children must be plain text: the wording as written in the code. */
export function T({ k, children }: { k: string; children: string }) {
  const { copy, editing, open } = useContext(SiteCopyContext);
  const text = copy[k] ?? children;
  if (!editing) return <>{text}</>;
  return (
    <span
      role="button"
      tabIndex={0}
      title={`Edit "${k}"`}
      data-copy-key={k}
      onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); open(k, children); }}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); open(k, children); } }}
      className="cursor-text rounded-[3px] outline outline-1 outline-dashed outline-offset-2 outline-[#248179] hover:bg-[#e3f1ef]/70"
    >
      {text}
    </span>
  );
}

function CopyEditor({ k, fallback, current, onClose, onSaved }: {
  k: string; fallback: string; current: string | undefined; onClose: () => void; onSaved: (value: string | null) => void;
}) {
  const [value, setValue] = useState(current ?? fallback);
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { area.current?.focus(); area.current?.select(); }, []);

  const send = async (body: object, kind: "save" | "reset", result: string | null) => {
    setBusy(kind); setError(null);
    try {
      const res = await fetch("/api/admin/copy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? `Could not save (${res.status})`); return; }
      onSaved(result);
    } catch {
      setError("Could not reach the server");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[15px] font-bold text-[#282828]">Edit wording</p>
            <p className="text-[11px] text-[#8a817c] font-mono break-all">{k}{current !== undefined ? " · edited" : ""}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#8a817c] hover:text-[#282828]"><X size={18} /></button>
        </div>
        <textarea
          ref={area}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send({ key: k, value }, "save", value); if (e.key === "Escape") onClose(); }}
          rows={Math.min(10, Math.max(3, Math.ceil(value.length / 60)))}
          className="w-full rounded-xl border border-[#e5dfd6] p-3 text-[14px] leading-[1.5] text-[#282828] focus:outline-none focus:border-[#248179]"
        />
        {current !== undefined && (
          <p className="mt-2 text-[12px] text-[#8a817c]">Original: <span className="text-[#4a4a4a]">{fallback}</span></p>
        )}
        {error && <p className="mt-2 text-[12px] text-[#c0392b]">{error}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          {current !== undefined ? (
            <button type="button" disabled={!!busy} onClick={() => send({ key: k, reset: true }, "reset", null)}
              className="flex items-center gap-1.5 text-[13px] text-[#4a4a4a] hover:text-[#282828] disabled:opacity-50">
              {busy === "reset" ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Reset to original
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-[13px] text-[#4a4a4a] border border-[#e5dfd6]">Cancel</button>
            <button type="button" disabled={!!busy || !value.trim() || value === (current ?? fallback)}
              onClick={() => send({ key: k, value }, "save", value)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
              style={{ background: "#248179" }}>
              {busy === "save" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save and publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
