# The Clean Sheet — Product Analyser (Chrome extension)

A browser popup that runs the same analyser as
[thecleansheet.in/review](https://thecleansheet.in/review). While you're on a
product page (Nykaa, Amazon, Flipkart, a brand site) it can analyse the page you're
on, or you can type any product name or link. It shows the Clean Sheet verdict —
tier, score out of 100, and the four gate checks — with a link to the full review.

## How it works

- **The popup never calls the network directly.** It sends a message to the
  background service worker (`background.js`), which does the `fetch` to
  `https://thecleansheet.in/api/review`.
- The background fetch uses `credentials: "include"`, so it carries your
  **existing thecleansheet.in login cookies**. If you're signed in to the site in
  this browser, a full analysis runs with no separate login. If you're not, the
  popup shows a **Sign in** button that opens the site.
- The engine is unchanged: **the AI researches, the code decides.** The extension
  is just a second front door to it.

This split (network in the background worker, not the popup) matters: a
service-worker fetch to a host in `host_permissions` bypasses CORS and sends the
site's cookies, which a fetch from the popup document cannot do.

## Load it locally (development)

1. Open `chrome://extensions` in Chrome (or any Chromium browser).
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Pin the extension, then open any product page (or just click the icon) and try it.

Make sure you're **signed in to thecleansheet.in** in the same browser first, or
the popup will prompt you to sign in.

### If the "Sign in" prompt keeps appearing even though you're logged in

That means the login cookie isn't reaching the background fetch. Two things to check:

- The account cookie must be readable cross-site. Confirm in DevTools →
  Application → Cookies for `https://thecleansheet.in` that the Supabase auth
  cookie is present. If it is `SameSite=Lax`/`Strict` and Chrome declines to send
  it from the extension, the fix is server-side: allow the extension origin (set
  the auth cookie `SameSite=None; Secure`, or add a CORS allowance for the
  `chrome-extension://<id>` origin on `/api/review`). This is the one thing that
  can't be verified without loading the unpacked extension against production.
- `host_permissions` in `manifest.json` must include `https://thecleansheet.in/*`
  (it does).

## Files

| File | Role |
|---|---|
| `manifest.json` | MV3 manifest — popup, background worker, permissions |
| `popup.html` / `popup.css` / `popup.js` | The popup UI and all render states |
| `background.js` | The single authenticated fetch to `/api/review` |
| `icons/` | Action icons (generated from the site logo) |
| `fonts/` | Cooper BT + Helvetica, bundled from `public/fonts` for brand match |

## Permissions, and why

- `activeTab` + `scripting` — read the product name off the current tab **only when
  you click the icon**, to offer "Analyse this page". No always-on content script.
- `storage` — reserved for future use (e.g. remembering recent searches).
- `host_permissions: https://thecleansheet.in/*` — the only site the extension talks to.

## Publishing to the Chrome Web Store (later)

1. Bump `version` in `manifest.json`.
2. Zip the **contents** of this folder (not the folder itself):
   `cd extension && zip -r ../clean-sheet-extension.zip . -x '_*'`
3. Upload the zip in the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   (one-time \$5 developer registration), add screenshots + a privacy note, and submit for review.

## Not yet included (easy follow-ups)

- A content-script badge that overlays the tier directly on the product page.
- Recent-searches history (the `storage` permission is already declared).
- Firefox build (MV3 works with minor `background` key tweaks).
