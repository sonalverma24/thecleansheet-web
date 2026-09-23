/* ────────────────────────────────────────────────────────────────
   Background service worker.

   All network calls to thecleansheet.in happen HERE, not in the popup.
   Why: an extension service-worker fetch to a host listed in
   host_permissions bypasses CORS and carries the site's own cookies
   (credentials: "include"). So if the user is signed in to
   thecleansheet.in in this browser, /api/review sees their session and
   runs a full analysis — no separate login inside the extension.

   The popup is a plain document (chrome-extension:// origin); a fetch
   from there would be blocked by CORS. So the popup only sends messages.
──────────────────────────────────────────────────────────────── */

const SITE = "https://thecleansheet.in";
const REVIEW_ENDPOINT = `${SITE}/api/review`;

/** Run the analyser for a name-or-URL query. Resolves to a plain object
 *  the popup can render: the engine payload on success, or { error }. */
async function runReview(query) {
  let res;
  try {
    res = await fetch(REVIEW_ENDPOINT, {
      method: "POST",
      credentials: "include", // send thecleansheet.in login cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
  } catch {
    // Network down, offline, or the request never reached the server.
    return { error: "network" };
  }

  if (res.status === 401) return { error: "auth_required" };
  if (res.status === 429) return { error: "rate_limited" };
  if (res.status === 503) return { error: "busy" };

  let data;
  try {
    data = await res.json();
  } catch {
    return { error: "fail" };
  }

  if (!res.ok && !data?.type) return { error: "fail" };
  if (data?.error === "busy") return { error: "busy" };
  return data;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "analyze" && typeof msg.query === "string") {
    runReview(msg.query).then(sendResponse);
    return true; // keep the message channel open for the async reply
  }
  return false;
});
