import { redirect } from "next/navigation";

// The analyser lives on /products now: search a product there and its review opens directly.
export default function AnalyserRedirect() {
  redirect("/products");
}
