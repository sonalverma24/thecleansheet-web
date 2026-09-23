/* ────────────────────────────────────────────────────────────────
   Popup logic. No network here — it messages the background worker,
   which owns the authenticated fetch to thecleansheet.in.

   Two ways in:
     • Auto-detect — read the current tab, offer "Analyse this page"
       (sends the page URL; the engine reads the link like a paste).
     • Manual — type a product name or link.

   Everything the engine can return is rendered inline: a verdict card,
   a "which one did you mean?" disambiguation list, or a friendly
   message for sign-in / out-of-scope / busy / error states.
──────────────────────────────────────────────────────────────── */

const SITE = "https://thecleansheet.in";

// Mirrors the site's progress copy so the wait feels the same.
const STEPS = [
  "Pulling the real ingredient list",
  "Mapping price across Nykaa, Amazon, Flipkart",
  "Extracting every marketing claim",
  "Grading each claim on the 1–7 evidence ladder",
  "Checking ASCI + India drug-boundary rules",
  "Reading the formula logic",
  "Writing your verdict",
];

const els = {
  detect: document.getElementById("detect"),
  detectName: document.getElementById("detect-name"),
  detectBtn: document.getElementById("detect-btn"),
  q: document.getElementById("q"),
  go: document.getElementById("go"),
  result: document.getElementById("result"),
  siteLink: document.getElementById("site-link"),
};

let inFlight = false;
let detectedUrl = null;

/* ─── helpers ─── */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function clearResult() {
  els.result.replaceChildren();
}

function isHttp(u) {
  return typeof u === "string" && /^https?:\/\//i.test(u);
}

function slugUrl(slug) {
  return `${SITE}/reviews/${encodeURIComponent(slug)}`;
}

/* ─── loading state with a ticking step + progress bar ─── */

let tickHandle = null;

function showLoading() {
  clearResult();
  const wrap = el("div");
  const row = el("div", "loading");
  row.append(el("span", "dot"));
  const step = el("span", "loading-step", STEPS[0] + "…");
  row.append(step);
  const bar = el("div", "loading-bar");
  const fill = el("span");
  bar.append(fill);
  wrap.append(row, bar);
  els.result.append(wrap);

  let i = 0;
  const render = () => {
    step.textContent = STEPS[i] + "…";
    fill.style.width = `${((i + 1) / STEPS.length) * 100}%`;
  };
  render();
  clearInterval(tickHandle);
  tickHandle = setInterval(() => {
    i = Math.min(i + 1, STEPS.length - 1);
    render();
  }, 6000);
}

function stopLoading() {
  clearInterval(tickHandle);
  tickHandle = null;
}

/* ─── message card (sign-in / scope / busy / error) ─── */

function showMessage(title, lines, action) {
  clearResult();
  const box = el("div", "msg");
  box.append(el("p", "msg-title", title));
  (Array.isArray(lines) ? lines : [lines]).forEach((t) =>
    box.append(el("p", "msg-text", t))
  );
  if (action) {
    const btn = el("button", "btn btn-primary", action.label);
    btn.addEventListener("click", action.onClick);
    box.append(btn);
  }
  els.result.append(box);
}

/* ─── disambiguation ("which one did you mean?") ─── */

function showDisambiguation(query, options) {
  clearResult();
  const box = el("div", "msg");
  box.append(el("p", "msg-title", "Which one did you mean?"));
  box.append(
    el("p", "msg-text", "A few products match. Pick the exact one to analyse.")
  );
  const list = el("div", "options");
  options.forEach((opt) => {
    const name = typeof opt === "string" ? opt : opt?.name;
    if (!name) return;
    const btn = el("button", "option", name);
    btn.addEventListener("click", () => runAnalyze(name));
    list.append(btn);
  });
  box.append(list);
  els.result.append(box);
}

/* ─── the verdict card ─── */

const TIER_CLASS = {
  approved: "tier--approved",
  "mostly-clean": "tier--mostly-clean",
  "can-do-better": "tier--can-do-better",
  "not-recommended": "tier--not-recommended",
};

function showVerdict(review, verdict) {
  clearResult();
  const card = el("div", "card");

  /* top: image + identity */
  const top = el("div", "card-top");
  if (isHttp(review.imageUrl)) {
    const img = el("img", "card-img");
    img.src = review.imageUrl;
    img.alt = "";
    img.addEventListener("error", () => img.remove());
    top.append(img);
  }
  const id = el("div", "card-id");
  if (review.brand) id.append(el("p", "card-brand", review.brand));
  id.append(el("p", "card-name", review.productName || "This product"));
  top.append(id);
  card.append(top);

  /* tier banner + score */
  const tier = verdict?.tier || "can-do-better";
  const banner = el("div", `tier ${TIER_CLASS[tier] || TIER_CLASS["can-do-better"]}`);
  banner.append(el("span", "tier-label", verdict?.tierLabel || "Reviewed"));
  const total = review?.scores?.total;
  if (typeof total === "number") {
    banner.append(el("span", "tier-score", `${total}/100`));
  }
  card.append(banner);

  /* body: headline, note, gates, link */
  const body = el("div", "card-body");
  if (verdict?.headline) body.append(el("p", "headline", verdict.headline));
  if (review?.cleanSheetNote) body.append(el("p", "note", review.cleanSheetNote));

  if (Array.isArray(verdict?.gates) && verdict.gates.length) {
    const gates = el("ul", "gates");
    verdict.gates.forEach((g) => {
      const li = el("li", "gate");
      const mark = el(
        "span",
        `gate-mark ${g.passed ? "gate-mark--pass" : "gate-mark--fail"}`,
        g.passed ? "✓" : "✕"
      );
      li.append(mark);
      const txt = el("span");
      txt.append(el("span", "gate-label", g.label));
      if (g.detail) {
        txt.append(document.createTextNode(" — "));
        txt.append(el("span", "gate-detail", g.detail));
      }
      li.append(txt);
      gates.append(li);
    });
    body.append(gates);
  }

  if (review?.productSlug) {
    const link = el("a", "card-link", "See the full review →");
    link.href = slugUrl(review.productSlug);
    link.target = "_blank";
    link.rel = "noopener";
    body.append(link);
  }

  card.append(body);
  els.result.append(card);
}

/* ─── route an engine response to the right renderer ─── */

function render(data, query) {
  if (!data || typeof data !== "object") return showMessage("Something went wrong", "Please try again in a moment.");

  if (data.error === "auth_required") {
    return showMessage(
      "Sign in to analyse",
      "Running a new analysis needs a free Clean Sheet account. Sign in, then try again.",
      {
        label: "Sign in on The Clean Sheet",
        onClick: () => chrome.tabs.create({ url: `${SITE}/review` }),
      }
    );
  }
  if (data.error === "busy") {
    return showMessage("The analyser is busy", "A lot of products are being reviewed right now. Give it a few seconds and try again.");
  }
  if (data.error === "rate_limited") {
    return showMessage("Slow down a touch", "You've run several analyses in a row. Wait a moment before the next one.");
  }
  if (data.error === "network") {
    return showMessage("No connection", "Couldn't reach The Clean Sheet. Check your internet and try again.");
  }

  switch (data.type) {
    case "product-review":
      if (data.review) return showVerdict(data.review, data.verdict);
      return showMessage("Something went wrong", "Please try again.");
    case "disambiguation":
      if (Array.isArray(data.options) && data.options.length)
        return showDisambiguation(data.query || query, data.options);
      return showMessage("Something went wrong", "Please try again.");
    case "out_of_scope":
      return showMessage(
        "Not a beauty product",
        "The Clean Sheet analyses skincare, haircare and cosmetics. Try a product name or a shopping link."
      );
    default:
      return showMessage(
        "Couldn't analyse that",
        "Try the exact product name, or paste the product's link."
      );
  }
}

/* ─── run an analysis ─── */

async function runAnalyze(query) {
  const q = (query || "").trim();
  if (!q || inFlight) return;
  inFlight = true;
  els.go.disabled = true;
  els.detectBtn.disabled = true;
  showLoading();
  try {
    const data = await chrome.runtime.sendMessage({ type: "analyze", query: q });
    render(data, q);
  } catch {
    render({ error: "network" }, q);
  } finally {
    stopLoading();
    inFlight = false;
    els.go.disabled = false;
    els.detectBtn.disabled = false;
  }
}

/* ─── auto-detect the product on the current tab ─── */

async function detectCurrentProduct() {
  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch {
    return;
  }
  if (!tab || !isHttp(tab.url)) return;

  let host = "";
  try {
    host = new URL(tab.url).hostname;
  } catch {
    return;
  }
  // No point analysing our own pages.
  if (host.endsWith("thecleansheet.in")) return;

  // Pull the best available product name from the page.
  let name = "";
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const pick = (sel, attr) => {
          const n = document.querySelector(sel);
          return n ? (attr ? n.getAttribute(attr) : n.textContent) : "";
        };
        return (
          pick('meta[property="og:title"]', "content") ||
          pick('meta[name="twitter:title"]', "content") ||
          pick("h1") ||
          document.title ||
          ""
        ).trim();
      },
    });
    name = (res?.result || "").trim();
  } catch {
    // Restricted page (chrome://, web store, PDF viewer, etc.).
    return;
  }

  detectedUrl = tab.url;
  const display = name || host.replace(/^www\./, "");
  els.detectName.textContent = display;
  els.detect.hidden = false;
}

/* ─── wire up ─── */

els.go.addEventListener("click", () => runAnalyze(els.q.value));
els.q.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runAnalyze(els.q.value);
});
els.detectBtn.addEventListener("click", () => {
  if (detectedUrl) runAnalyze(detectedUrl);
});

detectCurrentProduct();
els.q.focus();
