import { redirect } from "next/navigation";

// The claims-first analyzer now lives at /review — the single canonical tool.
export default function AnalyserRedirect() {
  redirect("/review");
}
