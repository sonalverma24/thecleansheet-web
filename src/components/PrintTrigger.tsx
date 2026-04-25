"use client";
import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    // Small delay so fonts/styles finish loading
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, []);
  return null;
}
