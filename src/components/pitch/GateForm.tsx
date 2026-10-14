"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* Neutral password screen for the private pitch demo. Deliberately carries no
   branding, so a glance at the tab or the page reveals nothing. */
export default function GateForm({ token = "", scope = "x" }: { token?: string; scope?: "x" | "preview" }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/pitch-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, scope }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      setFailed(true);
    } catch {
      setFailed(true);
    }
    setBusy(false);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-white px-6" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
      <form onSubmit={submit} className="w-full max-w-[280px]">
        <label htmlFor="pg" className="sr-only">Password</label>
        <input
          id="pg"
          type="password"
          autoFocus
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-[#d6d6d6] px-3.5 py-3 text-[15px] text-[#001325] outline-none focus:border-[#001325]"
        />
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-3 w-full rounded-md bg-[#001325] py-3 text-[14px] font-medium text-white disabled:opacity-40"
        >
          {busy ? "Checking" : "Continue"}
        </button>
        <p role="status" className="mt-3 h-4 text-center text-[12px] text-[#a33]">
          {failed ? "Incorrect password" : ""}
        </p>
      </form>
    </div>
  );
}
