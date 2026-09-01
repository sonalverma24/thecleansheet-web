# The Clean Sheet - Product Roadmap

**The goal:** the one and only place anyone in India opens before buying a beauty or personal-care product.

That is a far higher bar than "a good analyzer." It means three things must all be true at once:

1. **Trust** - the answer is accurate, independent, and defensible enough that people rely on it.
2. **Coverage** - there is always an answer, instantly, for whatever a shopper is looking at.
3. **Presence at purchase** - we are there at the moment of decision, on the page where they are actually shopping, not on a separate site they have to remember to visit.

Everything below is organised around closing the distance to those three.

---

## Where we are today (honest baseline)

The engine is a genuinely strong, defensible analysis core:

- A single pipeline: name or link, resolve the real INCI on INCIDecoder, research claims and evidence with a grounded model, then a deterministic verdict computed in code.
- An ingredient intelligence layer (the "brain") that understands identity and equivalence: Sodium Hyaluronate is Hyaluronic Acid, Aqua is Water, and so on.
- Two guardrails plus a banned-ingredient safety gate, so the model can no longer force a wrong verdict by fabricating a claim, mis-reading the INCI, or ignoring ingredient safety.
- Four clear standings: Clean Sheet Approved, Mostly Clean, Can Do Better, Not Recommended, each defined in code.
- A category-driven qualitative safety screen (Annex, endocrine, allergen, preservative, comedogenic, surfactant) shown with no numeric scores.
- A repository so the same product always returns the same page, and permanent shareable review URLs.

Recently shipped: the guardrails, the safety gate, the 90-plus category taxonomy (now including serums), the ingredient brain, the eleven audit fixes, and a full re-derivation of all 195 live reviews so they carry the current, corrected verdicts.

**What it is not yet:** it does not know every ingredient, it does not know the shopper, and it is not present at the point of purchase. Those three are the roadmap.

---

## Phase 0 - Shipped (foundation and correctness)

Done. Establishes that a verdict is deterministic, defensible, and hard to get wrong.

- Deterministic 4-tier standing with code-verified guardrails and a banned-ingredient safety gate.
- Ingredient intelligence layer (identity and equivalence) as the single source of truth.
- Category taxonomy and category-scoped safety screen.
- Independence stated on every review (no money from brands).
- One-time re-derivation of the entire live catalogue to the current rubric.

---

## Phase 1 - The ingredient database (the foundation everything compounds on)

**Problem it solves:** the reference data is a curated starter, so anything outside it reads as "clear." Authority requires knowing every ingredient.

- Build a real ingredient store from public authorities: EU CosIng, CIR, SCCS opinions, ECHA, IARC, US FDA, India CDSCO, plus PubChem for identity and CAS.
- Per ingredient: canonical identity and synonyms, function, hazard classifications, restriction and concentration limits by jurisdiction, allergen status.
- Wire the analysis screens and the brain to read from this store instead of the starter lists.
- Auto-grow it: every reviewed product's resolved INCI writes into the store (moderated), so the library compounds with use. This also finally builds out the public /ingredients directory from live data.
- Add dose reasoning: parse disclosed percentages and enforce known limits, so "how much" is part of the verdict.

**Outcome:** near-complete ingredient coverage, real regulatory grounding, and a growing public ingredient library.

---

## Phase 2 - Personalization (turn a reference into a decision)

**Problem it solves:** the site analyzes the product, not the person. The shopper's real question is "is this right for me."

- A lightweight profile: skin type, top concerns, sensitivities and allergies, pregnancy or breastfeeding, Fitzpatrick tone, age band.
- A personalized bottom line on every review: fine for you, or skip because it has a fragrance allergen you flagged, or the acid is too strong for reactive skin.
- Routine and interaction logic: conflicts across a basket (retinol plus AHA plus vitamin C), what not to layer, when to alternate.

**Outcome:** the answer becomes "buy this / skip this, for you," which is what makes people open it every time.

---

## Phase 3 - Presence at the point of purchase (the "one place" unlock)

**Problem it solves:** a separate website will never be the default. People decide on Nykaa, Amazon, and in-store, on their phone.

- A browser extension and mobile share-sheet that overlays the Clean Sheet standing directly on the Nykaa or Amazon product page.
- Paste-a-link and scan-in-store already exist as entry points; extend them into the native shopping surfaces.
- A crisp, shareable verdict card for social and messaging, so the verdict travels.

**Outcome:** we are in the buying flow, not adjacent to it. This is the single highest-leverage growth move.

---

## Phase 4 - Coverage and speed (always an instant answer)

**Problem it solves:** reviews cold-generate over roughly a minute, and only on demand.

- Pre-build the catalogue: batch-review the several thousand most-shopped products across Nykaa and Amazon bestseller lists, so nearly every search is an instant repository hit.
- Progressive rendering for the rare cold generation, and a real progress signal instead of a fixed timer.
- Reformulation watch: re-review when a product's INCI changes, so stored reviews stay current.

**Outcome:** a shopper almost never waits, and the answer is always fresh.

---

## Phase 5 - Trust and safety rails (earn the authority)

**Problem it solves:** negative verdicts on named brands go live unchecked, and the methodology is not yet expert-backed.

- A verification pass on negative verdicts: a second independent read (the auditor-and-brand lens) before "Not Recommended" goes public.
- A moderation queue and a brand right-of-reply for negative standings, with an evidence trail (source URL and timestamp) stored per finding, to stay defensible under ASCI and CCPA.
- Named expert sign-off on the methodology and the ingredient data (a cosmetic chemist and a dermatologist).
- An accuracy feedback loop: users and brands can flag errors, and we track and correct them.

**Outcome:** the standing is not just correct, it is trusted and legally defensible at scale.

---

## Phase 6 - Growth and depth

- Dupes and alternatives: "overpriced for this formula, here is a cleaner or cheaper equivalent."
- Comparison built into the live flow: "which of these three is best for my dark spots and budget."
- Alerts: a product you saved was reformulated, or a better-scoring alternative launched.
- Multilingual: Hindi and major regional languages.
- SEO for pre-shopping intent: "is X safe," "X review," so people arrive from Google.

---

## Cross-cutting (applies to every phase)

- **Provenance:** every finding carries its source and timestamp.
- **Independence:** no pay-for-rating, stated everywhere.
- **Determinism:** the model researches, the code decides, so the same product always gives the same, explainable answer.
- **Accuracy monitoring:** track flags, corrections, and verdict stability over time.

---

## Success metrics

- Coverage: share of shopper searches that return an instant, pre-built answer.
- Trust: repeat usage, and error-flag rate trending down.
- Presence: reviews viewed from the at-purchase surface (extension and share) versus the site.
- Authority: expert-endorsed methodology, and zero successfully-challenged negative verdicts.

---

## The next two weeks (highest leverage first)

1. Stand up the ingredient database schema and import the EU and India restriction lists (Phase 1 core). This alone removes most "shows a gap" cases.
2. Wire the analysis screens and the brain to read from it, and turn on the auto-grow write from every review.
3. Prototype the at-purchase overlay on one retailer (Phase 3 spike), since it is the growth unlock and can be validated small.

The current build is the trustworthy core. The path to "the one and only place" runs through three moves: know every ingredient, know the shopper, and be present where they buy.
