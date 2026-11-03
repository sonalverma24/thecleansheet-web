/* Where /auth/callback sends a visitor once they are signed in, read from its `next` address.

   `next` comes from the address bar, so anyone can write anything in it. The callback used to put
   it straight after the site's own address, which let "@other-site.com" turn
   "https://thecleansheet.in@other-site.com" into a redirect to another site (the part before the @ is
   read as a user name). Only a path on this site is accepted here; anything else becomes the fallback. */

export function safeNextPath(next: string | null | undefined, origin: string, fallback = "/account"): string {
  if (!next || !next.startsWith("/")) return fallback;
  let url: URL;
  try {
    url = new URL(next, origin);
  } catch {
    return fallback;
  }
  // The address is read the way a browser reads it (it drops tabs and line breaks and treats "\" as "/"),
  // so "/\t/other.com" and "/\\other.com" come out as another site and are refused here.
  if (url.origin !== origin) return fallback;
  const path = `${url.pathname}${url.search}${url.hash}`;
  return path.startsWith("//") ? fallback : path;
}
