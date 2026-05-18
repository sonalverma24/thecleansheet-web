"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 transition-colors group"
    >
      <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
      Back
    </button>
  );
}
