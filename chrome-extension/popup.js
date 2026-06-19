// ─── Config ─────────────────────────────────────────────────────────────────

const API_BASE = "https://thecleansheet.in";
// Uncomment to test against local dev server:
// const API_BASE = "http://localhost:3000";

const isDev = API_BASE.includes("localhost");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function $(id) { return document.getElementById(id); }

function showState(name) {
  const states = ["idle", "loading", "not-product", "error", "no-data", "result"];
  states.forEach(s => {
    const el = $(`state-${s}`);
    if (el) el.style.display = s === name ? (name === "result" ? "block" : "flex") : "none";
  });
}

function scoreColor(score) {
  if (score >= 80) return "#248179";
  if (score >= 65) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#fd6158";
}

function pillarColor(pct) {
  if (pct >= 90) return "#248179";
  if (pct >= 75) return "#3b82f6";
  if (pct >= 60) return "#f59e0b";
  return "#fd6158";
}

// Shorten long pillar names for the compact bar layout
const PILLAR_SHORT = {
  "Public INCI Safety Screen": "Safety Screen",
  "Formula Logic Inference": "Formula Logic",
  "Public Claim Support": "Claim Support",
  "Test Result Transparency": "Test Transparency",
  "Consumer Clarity": "Consumer Clarity",
};

function shortenPillar(name) {
  return PILLAR_SHORT[name] || name;
}

// Detect if URL looks like a beauty product page vs. a search/home/tab page
const NON_PRODUCT_PATTERNS = [
  /^https?:\/\/(www\.)?(google|bing|duckduckgo|yahoo)\./,
  /^chrome:\/\//,
  /^about:/,
  /^chrome-extension:\/\//,
  /\/(search|s\?|q=|\?q=)/,
  /^https?:\/\/(www\.)?reddit\.com\/?$/,
  /^https?:\/\/(www\.)?amazon\.(in|com)\/?$/,
  /^https?:\/\/(www\.)?nykaa\.com\/?$/,
  /^https?:\/\/(www\.)?purplle\.com\/?$/,
];

function looksLikeProductPage(url) {
  if (!url || !url.startsWith("http")) return false;
  for (const pattern of NON_PRODUCT_PATTERNS) {
    if (pattern.test(url)) return false;
  }
  return true;
}

// ─── Render result ────────────────────────────────────────────────────────────

function renderResult(data) {
  if (data.type === "no_data_found") {
    showState("no-data");
    return;
  }

  if (data.type !== "single" || !data.scorecard) {
    showState("error");
    $("error-msg").textContent = "Got an unexpected response type. Try the analyser on thecleansheet.in.";
    return;
  }

  const sc = data.scorecard;
  const score = sc.score ?? 0;
  const color = scoreColor(score);

  // Score ring animation
  const circumference = 2 * Math.PI * 32; // r=32 from SVG
  const offset = circumference - (score / 100) * circumference;
  const ring = $("ring-fill");
  ring.style.stroke = color;
  // Trigger animation after a brief delay so transition fires
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 50);

  $("score-number").textContent = score;
  const labelEl = $("score-label");
  labelEl.textContent = sc.scoreLabel ?? "";
  labelEl.style.color = color;
  $("product-name").textContent = sc.productName ?? "Unknown product";
  $("brand-name").textContent = sc.brand ?? "";

  // Pillars
  const pillarsEl = $("pillars");
  pillarsEl.innerHTML = "";
  const pillars = Array.isArray(sc.pillars) ? sc.pillars : [];
  pillars.forEach(p => {
    const pct = p.max > 0 ? Math.round((p.score / p.max) * 100) : 0;
    const pColor = pillarColor(pct);
    const row = document.createElement("div");
    row.className = "pillar-row";
    row.innerHTML = `
      <span class="pillar-name">${shortenPillar(p.name)}</span>
      <div class="pillar-track">
        <div class="pillar-fill" style="width:0%; background:${pColor}" data-width="${pct}%"></div>
      </div>
      <span class="pillar-pct">${pct}%</span>
    `;
    pillarsEl.appendChild(row);
  });
  // Animate pillar fills
  setTimeout(() => {
    pillarsEl.querySelectorAll(".pillar-fill").forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 80);

  // Badges
  const passBadges = Array.isArray(sc.pass_badges) ? sc.pass_badges : [];
  const warnBadges = Array.isArray(sc.warn_badges) ? sc.warn_badges : [];

  const passEl = $("pass-badges");
  const warnEl = $("warn-badges");
  passEl.innerHTML = "";
  warnEl.innerHTML = "";

  passBadges.slice(0, 5).forEach(b => {
    const badge = document.createElement("span");
    badge.className = "badge badge-pass";
    badge.innerHTML = `<span class="badge-dot"></span>${b}`;
    passEl.appendChild(badge);
  });

  warnBadges.slice(0, 4).forEach(b => {
    const badge = document.createElement("span");
    badge.className = "badge badge-warn";
    badge.innerHTML = `<span class="badge-dot"></span>${b}`;
    warnEl.appendChild(badge);
  });

  const badgesSection = $("badges-section");
  if (passBadges.length > 0 || warnBadges.length > 0) {
    badgesSection.style.display = "flex";
  }

  // Flagged ingredients (warn + info, max 3)
  const ingredients = Array.isArray(sc.ingredients) ? sc.ingredients : [];
  const flagged = ingredients.filter(i => i.flag === "warn" || i.flag === "info").slice(0, 3);
  const flagsList = $("flags-list");
  flagsList.innerHTML = "";

  if (flagged.length > 0) {
    $("flags-section").style.display = "block";
    flagged.forEach(ing => {
      const li = document.createElement("li");
      li.className = "flag-item";
      const dotClass = ing.flag === "warn" ? "flag-dot-warn" : "flag-dot-info";
      li.innerHTML = `
        <span class="flag-dot ${dotClass}"></span>
        <span>
          <span class="flag-name">${ing.name}</span>
          ${ing.note ? `<span class="flag-note"> - ${ing.note}</span>` : ""}
        </span>
      `;
      flagsList.appendChild(li);
    });
  }

  // Full scorecard link
  const slug = data.slug;
  const fullLink = $("full-scorecard-link");
  if (slug) {
    fullLink.href = `${API_BASE}/analyzed/${slug}`;
  } else {
    // Fallback: open analyser with the URL pre-filled
    fullLink.href = `${API_BASE}/analyzer`;
  }

  showState("result");
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function analyseURL(url) {
  showState("loading");

  const steps = [
    "Reading product page...",
    "Fetching ingredient data...",
    "Checking regulatory flags...",
    "Scoring formula logic...",
    "Almost done...",
  ];
  let stepIdx = 0;
  const labelEl = $("loading-label");
  const stepInterval = setInterval(() => {
    stepIdx = Math.min(stepIdx + 1, steps.length - 1);
    labelEl.textContent = steps[stepIdx];
  }, 5000);

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: url }),
    });

    clearInterval(stepInterval);

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    renderResult(data);
  } catch (err) {
    clearInterval(stepInterval);
    showState("error");
    $("error-msg").textContent =
      err.message.includes("Failed to fetch")
        ? "Could not reach thecleansheet.in. Check your internet connection and try again."
        : `Something went wrong: ${err.message}`;
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  // Show dev badge if pointing at localhost
  if (isDev) $("dev-badge").style.display = "block";

  // Get current tab URL
  let currentUrl = "";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentUrl = tab?.url ?? "";
  } catch {
    // Permission error - still show idle state
  }

  // Check background cache first — if the content script already fetched the result
  // for this tab, show it instantly without a second API call
  try {
    const cached = await new Promise(resolve => {
      chrome.runtime.sendMessage({ type: "TCS_GET_CACHED_RESULT" }, r => resolve(r?.result ?? null));
    });
    if (cached) {
      renderResult(cached);
      return;
    }
  } catch { /* background not ready yet, fall through */ }

  // Pre-fill URL input if we have something
  if (currentUrl && currentUrl.startsWith("http")) {
    $("url-input").value = currentUrl;
  }

  showState("idle");

  // ── Event: Analyse current page button
  $("analyse-btn").addEventListener("click", async () => {
    if (!currentUrl || !looksLikeProductPage(currentUrl)) {
      showState("not-product");
      return;
    }
    await analyseURL(currentUrl);
  });

  // ── Event: URL submit
  $("url-submit-btn").addEventListener("click", async () => {
    const url = $("url-input").value.trim();
    if (!url) return;
    if (!looksLikeProductPage(url)) {
      showState("not-product");
      return;
    }
    await analyseURL(url);
  });

  $("url-input").addEventListener("keydown", async (e) => {
    if (e.key === "Enter") $("url-submit-btn").click();
  });

  // ── Event: Re-analyse button
  $("analyse-again-btn").addEventListener("click", async () => {
    const url = currentUrl || $("url-input").value.trim();
    if (url) await analyseURL(url);
    else showState("idle");
  });

  // ── Error state: open analyser link
  $("error-link").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${API_BASE}/analyzer` });
  });
});
