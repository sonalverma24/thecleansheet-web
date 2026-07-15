import { redirect } from "next/navigation";

// The claims-first analyzer now lives at /review — the single canonical tool.
export default function AnalyzerRedirect() {
  redirect("/review");
}
