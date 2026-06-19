// ─── Background service worker ────────────────────────────────────────────────
// Responsibilities:
//  1. Detect when the user navigates to a recognised beauty product page
//  2. Set a green badge on the extension icon so they know it's active
//  3. Clear the badge on non-product pages
//  4. Act as a message relay for content scripts → popup communication

// URL patterns that identify a product detail page on the supported marketplaces.
// These match the same patterns declared in content_scripts.matches (manifest.json).
const PRODUCT_PAGE_PATTERNS = [
  /nykaa\.com\/[^/]+\/p\//i,
  /purplle\.com\/product\//i,
  /amazon\.in\/[^/]+\/dp\//i,
  /amazon\.in\/dp\//i,
  /flipkart\.com\/[^/]+\/p\//i,
  /myntra\.com\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/buy/i,
];

function isProductPage(url) {
  if (!url) return false;
  return PRODUCT_PAGE_PATTERNS.some(p => p.test(url));
}

// Set or clear the badge whenever the active tab changes or navigates
function updateBadge(tabId, url) {
  if (isProductPage(url)) {
    chrome.action.setBadgeText({ text: "TCS", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#248179", tabId });
    chrome.action.setTitle({ title: "The Clean Sheet — click to analyse this product", tabId });
  } else {
    chrome.action.setBadgeText({ text: "", tabId });
    chrome.action.setTitle({ title: "The Clean Sheet — Analyse this product", tabId });
  }
}

// Tab activated (user switches tabs)
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    updateBadge(tabId, tab.url);
  } catch { /* tab may not be ready */ }
});

// Tab URL changed (navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    updateBadge(tabId, tab.url || changeInfo.url);
  }
});

// Message relay: content script sends analysis result → popup can read it
// We store the latest result per tab so the popup can show it instantly
const tabResultCache = new Map();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "TCS_RESULT_READY" && sender.tab?.id) {
    tabResultCache.set(sender.tab.id, msg.result);
    sendResponse({ ok: true });
  }
  if (msg.type === "TCS_GET_CACHED_RESULT") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const result = tabs[0]?.id ? tabResultCache.get(tabs[0].id) : null;
      sendResponse({ result });
    });
    return true; // keep channel open for async response
  }
});

// Clean up cache when tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  tabResultCache.delete(tabId);
});
