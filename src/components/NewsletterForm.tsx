"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-teal-300 text-sm py-4">
        You&apos;re subscribed. We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          className="flex-1 bg-white/10 border border-white/20 text-white placeholder-teal-400 px-5 py-3.5 rounded-2xl focus:outline-none focus:border-teal-400 text-sm disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-coral-500 hover:bg-coral-600 text-white font-normal px-6 py-3.5 rounded-2xl transition-colors whitespace-nowrap text-sm disabled:opacity-60"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-2">Something went wrong. Please try again.</p>
      )}
    </>
  );
}
