// ─── TCS Content Script ───────────────────────────────────────────────────────
// Injects a floating "Analyse with TCS" widget on recognised product pages.
// Uses Shadow DOM so styles never conflict with the host page.
//
// Key upgrade: scrapes ingredients directly from the page's JS state
// (Nykaa __PRELOADED_STATE__, Amazon DOM tables, Purplle __INITIAL_STATE__)
// before calling the API. When found, the INCI is sent as `ingredientsHint`
// alongside the URL — the API uses it directly, bypassing Jina scraping entirely.

(function () {
  "use strict";

  if (document.getElementById("tcs-widget-root")) return;

  const API_BASE = "https://thecleansheet.in";

  const host = window.location.hostname;
  const platform = host.includes("nykaa") ? "nykaa"
    : host.includes("purplle") ? "purplle"
    : host.includes("amazon") ? "amazon"
    : host.includes("flipkart") ? "flipkart"
    : host.includes("myntra") ? "myntra"
    : null;

  if (!platform) return;

  // ─── Platform scrapers (from v5, adapted) ───────────────────────────────────
  // These read ingredients from the page's own JS state — much more reliable
  // than Jina scraping because we're inside the page's execution context.

  // Recursively searches an object for a key whose string value looks like
  // a comma-separated ingredient list (length > 20, contains commas).
  function deepFind(obj, key, depth) {
    depth = depth || 0;
    if (depth > 6 || !obj || typeof obj !== "object") return null;
    for (const k of Object.keys(obj)) {
      if (k.toLowerCase() === key.toLowerCase()) {
        const val = obj[k];
        if (typeof val === "string" && val.length > 20 && val.includes(",")) return val;
      }
      const found = deepFind(obj[k], key, depth + 1);
      if (found) return found;
    }
    return null;
  }

  function scrapeNykaa() {
    // Nykaa injects its full Redux store as window.__PRELOADED_STATE__
    // Reading it from inside the content script gives us the real ingredient list
    // that would otherwise be hidden behind JavaScript-rendered accordions.
    try {
      const state = window.__PRELOADED_STATE__;
      if (state) {
        const paths = [
          () => state?.productPage?.productDetails?.ingredients,
          () => state?.productPage?.productDetails?.product_details?.ingredients,
          () => state?.productPage?.product?.ingredients,
          () => state?.appReducer?.productDetails?.ingredients,
          () => state?.pdpReducer?.productDetails?.ingredients,
          () => state?.productReducer?.productDetails?.ingredients,
        ];
        for (const path of paths) {
          try {
            const val = path();
            if (val && typeof val === "string" && val.length > 10) return val;
          } catch (_) {}
        }
        // Deep search fallback
        const found = deepFind(state, "ingredients");
        if (found) return found;
      }
    } catch (_) {}

    // Parse the __PRELOADED_STATE__ script tag directly if window object isn't set yet
    for (const script of document.querySelectorAll("script")) {
      const text = script.textContent;
      if (!text.includes("__PRELOADED_STATE__")) continue;
      try {
        const match = text.match(/window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\});?\s*(?:window\.|$)/);
        if (match) {
          const json = JSON.parse(match[1]);
          const found = deepFind(json, "ingredients");
          if (found) return found;
        }
      } catch (_) {
        // Try regex extraction directly on the raw text
        const ingMatch = text.match(/"ingredients"\s*:\s*"([^"]{20,})"/);
        if (ingMatch) return ingMatch[1].replace(/\\n/g, " ").replace(/\\"/g, '"');
      }
    }
    return null;
  }

  function scrapePurplle() {
    try {
      const state = window.__INITIAL_STATE__ || window.__PRELOADED_STATE__ || window.__STATE__;
      if (state) {
        const found = deepFind(state, "ingredients");
        if (found) return found;
      }
    } catch (_) {}
    // DOM fallback: look for an "Ingredients" heading followed by text
    for (const h of document.querySelectorAll("h2,h3,h4,strong,b,span,p")) {
      if (!/^ingredients$/i.test(h.textContent.trim())) continue;
      let cursor = h;
      for (let d = 0; d < 6; d++) {
        cursor = cursor.parentElement;
        if (!cursor) break;
        const next = cursor.nextElementSibling;
        if (next) {
          const t = next.textContent.trim();
          if (t.length > 30 && t.split(",").length > 3) return t;
        }
      }
    }
    return null;
  }

  function scrapeAmazon() {
    // Amazon product detail table
    for (const row of document.querySelectorAll("tr")) {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2 && /ingredients/i.test(cells[0].textContent)) {
        return cells[1].textContent.trim();
      }
    }
    // Feature bullets
    for (const b of document.querySelectorAll("#feature-bullets li span")) {
      if (/ingredients/i.test(b.textContent)) {
        return b.textContent.replace(/ingredients\s*:/i, "").trim();
      }
    }
    // A+ content sections
    for (const el of document.querySelectorAll('[data-feature-name="aplus"], .aplus-module')) {
      const text = el.textContent;
      const match = text.match(/ingredients[:\s]+([A-Za-z\s,().-]{30,})/i);
      if (match) return match[1].trim();
    }
    return null;
  }

  function scrapeFlipkart() {
    // Flipkart shows product specs in a key-value table
    for (const row of document.querySelectorAll("tr, li")) {
      const text = row.textContent;
      if (/ingredients/i.test(text)) {
        const cells = row.querySelectorAll("td, span");
        if (cells.length >= 2) return cells[cells.length - 1].textContent.trim();
      }
    }
    return null;
  }

  function scrapeIngredients() {
    if (platform === "nykaa")    return scrapeNykaa();
    if (platform === "purplle")  return scrapePurplle();
    if (platform === "amazon")   return scrapeAmazon();
    if (platform === "flipkart") return scrapeFlipkart();
    return null;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function scoreColor(score) {
    if (score >= 80) return "#248179";
    if (score >= 65) return "#3b82f6";
    if (score >= 50) return "#f59e0b";
    return "#fd6158";
  }

  function scoreLabel(score) {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Concern";
  }

  // ─── Build Shadow DOM ─────────────────────────────────────────────────────────

  const host_el = document.createElement("div");
  host_el.id = "tcs-widget-root";
  host_el.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:Helvetica,Arial,sans-serif;";
  document.body.appendChild(host_el);

  const shadow = host_el.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .widget { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }

    .pill {
      display: inline-flex; align-items: center; gap: 7px;
      background: #248179; color: #fff;
      font-size: 12px; font-weight: 700; letter-spacing: 0.03em;
      padding: 8px 14px 8px 10px; border-radius: 99px;
      cursor: pointer; border: none;
      box-shadow: 0 4px 16px rgba(36,129,121,0.45);
      transition: transform 0.15s, opacity 0.15s; white-space: nowrap;
    }
    .pill:hover { transform: scale(1.04); opacity: 0.93; }
    .pill:active { transform: scale(0.97); }

    /* Ingredient hint pill — shown when we pre-scraped INCI from page */
    .pill.has-inci { background: #1a6b63; }
    .pill.has-inci::after {
      content: "INCI found";
      font-size: 9px; font-weight: 600; letter-spacing: 0.05em;
      background: rgba(255,255,255,0.2); border-radius: 99px;
      padding: 2px 6px; margin-left: 2px;
    }

    .card {
      background: #fff; border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      overflow: hidden; width: 290px;
      display: none; flex-direction: column;
      animation: slideUp 0.2s ease both;
    }
    .card.open { display: flex; }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 11px 14px 10px; border-bottom: 1px solid #f0edea;
      background: #faf9f7;
    }
    .card-brand { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #1a1a1a; }
    .inci-hint {
      font-size: 9px; font-weight: 600; letter-spacing: 0.05em;
      background: #e6f2f1; color: #248179; border-radius: 4px; padding: 2px 5px;
    }
    .close-btn { background: none; border: none; cursor: pointer; color: #b0a8a4; font-size: 16px; line-height: 1; padding: 2px 4px; }
    .close-btn:hover { color: #555; }

    .card-body { padding: 14px; }

    .loading { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 0; color: #555; font-size: 12px; }
    .spinner { width: 32px; height: 32px; animation: rotate 1.2s linear infinite; }
    .spinner-track { stroke: #e8e4e0; }
    .spinner-head { stroke: #248179; stroke-dasharray: 60 100; stroke-linecap: round; animation: dash 1.2s ease-in-out infinite; }
    @keyframes rotate { 100% { transform: rotate(360deg); } }
    @keyframes dash {
      0%   { stroke-dasharray: 1 100; stroke-dashoffset: 0; }
      50%  { stroke-dasharray: 70 100; stroke-dashoffset: -30; }
      100% { stroke-dasharray: 70 100; stroke-dashoffset: -100; }
    }
    .loading-sub { font-size: 10px; color: #b0a8a4; }

    .score-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .score-circle {
      width: 52px; height: 52px; border-radius: 50%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      flex-shrink: 0; border: 3px solid;
    }
    .score-num { font-size: 18px; font-weight: 700; line-height: 1; }
    .score-denom { font-size: 9px; color: #888; line-height: 1; }
    .score-label { font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 3px; }
    .product-name {
      font-size: 12px; font-weight: 600; color: #1a1a1a; line-height: 1.35;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .brand-name { font-size: 10px; color: #888; margin-top: 2px; }

    .badges { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
    .badge { font-size: 10px; font-weight: 500; padding: 2px 7px; border-radius: 99px; }
    .badge-pass { background: #e6f2f1; color: #1a5f5a; }
    .badge-warn { background: #fff1f0; color: #b03a35; }

    .inci-source {
      font-size: 9px; color: #b0a8a4; text-align: center;
      margin-bottom: 10px; font-style: italic;
    }

    .cta {
      display: block; text-align: center; background: #248179; color: #fff;
      font-size: 12px; font-weight: 600; padding: 9px; border-radius: 8px;
      text-decoration: none; transition: opacity 0.15s;
    }
    .cta:hover { opacity: 0.88; }

    .error-msg { font-size: 11px; color: #888; text-align: center; padding: 12px 0; line-height: 1.5; }
  `;
  shadow.appendChild(style);

  // ─── HTML ────────────────────────────────────────────────────────────────────

  const widget = document.createElement("div");
  widget.className = "widget";
  widget.innerHTML = `
    <div class="card" id="tcs-card">
      <div class="card-header">
        <div class="card-brand">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="#248179"/>
            <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
          </svg>
          The Clean Sheet
          <span class="inci-hint" id="tcs-inci-hint" style="display:none">INCI ready</span>
        </div>
        <button class="close-btn" id="tcs-close">✕</button>
      </div>
      <div class="card-body" id="tcs-body"></div>
    </div>
    <button class="pill" id="tcs-pill">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
          stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="rgba(255,255,255,0.15)"/>
        <path d="M9 12l2 2 4-4" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Analyse with TCS
    </button>
  `;
  shadow.appendChild(widget);

  const pill  = shadow.getElementById("tcs-pill");
  const card  = shadow.getElementById("tcs-card");
  const body  = shadow.getElementById("tcs-body");
  const close = shadow.getElementById("tcs-close");

  let isOpen    = false;
  let hasResult = false;

  // ─── Pre-scrape INCI on load ─────────────────────────────────────────────────
  // Try to extract the ingredient list from the page's JS state immediately.
  // Store it so we can (a) show an "INCI found" hint on the pill, and (b) send
  // it to the API alongside the URL to skip Jina scraping.

  let preScrapedInci = null;

  function tryPreScrape() {
    const found = scrapeIngredients();
    if (found && found.length > 20) {
      preScrapedInci = found;
      pill.classList.add("has-inci");
      const hint = shadow.getElementById("tcs-inci-hint");
      if (hint) hint.style.display = "inline";
    }
  }

  // Run immediately, then retry once after 3s for SPA pages that hydrate late
  tryPreScrape();
  if (!preScrapedInci) {
    setTimeout(tryPreScrape, 3000);
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  function showLoading(msg, sub) {
    body.innerHTML = `
      <div class="loading">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="spinner-track" cx="25" cy="25" r="20" fill="none" stroke-width="4"/>
          <circle class="spinner-head" cx="25" cy="25" r="20" fill="none" stroke-width="4"/>
        </svg>
        <span>${msg || "Analysing…"}</span>
        ${sub ? `<span class="loading-sub">${sub}</span>` : ""}
      </div>
    `;
  }

  function showError(msg) {
    body.innerHTML = `<p class="error-msg">${msg}</p>`;
  }

  function showResult(data, inciSource) {
    if (data.type === "no_data_found") {
      showError("Couldn't find ingredient data for this product.");
      body.innerHTML += `<a class="cta" href="${API_BASE}/analyzer" target="_blank" style="margin-top:10px;display:block">Open Analyser</a>`;
      return;
    }
    if (data.type !== "single" || !data.scorecard) {
      showError("Couldn't analyse this product.");
      return;
    }

    const sc    = data.scorecard;
    const score = sc.score ?? 0;
    const color = scoreColor(score);
    const label = sc.scoreLabel || scoreLabel(score);
    const slug  = data.slug;
    const link  = slug ? `${API_BASE}/analyzed/${slug}` : `${API_BASE}/analyzer`;

    const passBadges = (sc.pass_badges || []).slice(0, 4);
    const warnBadges = (sc.warn_badges || []).slice(0, 3);
    const hasBadges  = passBadges.length > 0 || warnBadges.length > 0;

    body.innerHTML = `
      <div class="score-row">
        <div class="score-circle" style="border-color:${color}">
          <span class="score-num" style="color:${color}">${score}</span>
          <span class="score-denom">/100</span>
        </div>
        <div class="score-meta">
          <div class="score-label" style="color:${color}">${label}</div>
          <div class="product-name">${sc.productName || ""}</div>
          <div class="brand-name">${sc.brand || ""}</div>
        </div>
      </div>
      ${hasBadges ? `
        <div class="badges">
          ${passBadges.map(b => `<span class="badge badge-pass">${b}</span>`).join("")}
          ${warnBadges.map(b => `<span class="badge badge-warn">${b}</span>`).join("")}
        </div>
      ` : ""}
      ${inciSource ? `<p class="inci-source">INCI read from ${inciSource}</p>` : ""}
      <a class="cta" href="${link}" target="_blank">View full scorecard →</a>
    `;
  }

  // ─── Analysis ────────────────────────────────────────────────────────────────

  async function analyse() {
    const url = window.location.href;

    // Check background cache first
    try {
      const cached = await new Promise(resolve => {
        chrome.runtime.sendMessage({ type: "TCS_GET_CACHED_RESULT" }, r => resolve(r?.result ?? null));
      });
      if (cached) { showResult(cached); hasResult = true; return; }
    } catch (_) {}

    // Show loading with context-aware message
    if (preScrapedInci) {
      showLoading("Scoring ingredients…", `Read ${preScrapedInci.split(",").length} ingredients from ${platform} page`);
    } else {
      showLoading("Fetching ingredient data…", "Searching public sources");
    }

    try {
      // Build request — include pre-scraped INCI if we got it
      const requestBody = { query: url };
      if (preScrapedInci) {
        requestBody.ingredientsHint = preScrapedInci;
      }

      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const inciSource = preScrapedInci ? `${platform} page` : null;
      showResult(data, inciSource);
      hasResult = true;

      try {
        chrome.runtime.sendMessage({ type: "TCS_RESULT_READY", result: data });
      } catch (_) {}

    } catch (err) {
      showError(
        err.message.includes("Failed to fetch")
          ? "Connection error. Check your internet."
          : "Something went wrong. Try again."
      );
    }
  }

  // ─── Events ──────────────────────────────────────────────────────────────────

  pill.addEventListener("click", () => {
    isOpen = !isOpen;
    card.classList.toggle("open", isOpen);
    if (isOpen && !hasResult) analyse();
  });

  close.addEventListener("click", e => {
    e.stopPropagation();
    isOpen = false;
    card.classList.remove("open");
  });

})();
