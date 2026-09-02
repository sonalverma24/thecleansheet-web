import { redirect } from "next/navigation";

// Sign-in now lives on a single page: /account (Google + inline email magic
// link). This legacy route redirects there so old links/bookmarks still work.
export default function LoginRedirect() {
  redirect("/account");
}
