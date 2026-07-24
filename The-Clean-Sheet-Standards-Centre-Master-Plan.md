# The Clean Sheet — Standards & Proof Centre Master Plan

*How to turn the Product Standards Framework 2026 into a public standards and proof centre. Built from three source documents; prepared 21 July 2026.*

---

## What this plan is built from

| Source file | What it is | Role going forward |
|---|---|---|
| **The_Clean_Sheet_Product_Standards_Framework_2026.xlsx** | Modular, gate-based framework — v0.9 research draft, 21 July 2026. 20 core gates, 10 product modules, 30 claim modules, 22 sustainability rows, 7 market overlays, 16 governance controls, 47-entry standards register, 19-point self-audit. | **The primary source for the entire Standards Centre.** Publish a controlled version, not the raw sheet. |
| **THE_CLEAN_SHEET_STANDARD.md** | v2.0 standard (1 June 2026) — the older 0–100 score / Gold–Silver–Certified / PRISM model. | **Internal reference only.** Its schedules (ingredient limits, lab list, allergen tables) are useful raw material but must be corrected per the framework's audit before any public use. Do **not** publish the scored model. |
| **TCCS_PUBLIC_STANDARD_v1.md** | A draft that calls itself "Version 1.0 — Active — first published standard." | **Archived as superseded** (done — see `archive/superseded-standards/`). Never publish as active. |

The framework is genuinely strong: modular, source-linked, and honest about the limits of every method it cites. The website's job is to expose that rigour to the public without exposing confidential decision logic — and without repeating the mistakes the framework's own audit already caught.

---

## Part 1 — The core reframe (the one decision everything hangs on)

Three shifts define the whole rebuild. Every recommendation below follows from these.

**1. Two products, cleanly separated.** Public *Product Evidence Review* (what can be seen from outside) is not the same thing as *Certification* (a decision made on a confidential dossier). Today the site blurs them — "Approved," scores, and tiers appear next to certification language. This is the single most important correction.

**2. Gates, not scores.** The framework's own audit is blunt: *"a weighted score can mask a failed critical requirement."* Legal, safety, quality and material-claim requirements become **pass/fail gates**. No score can buy back a failed gate. Public Gold/Silver/0–100 goes away.

**3. Scope and limits on everything.** Nothing is published without stating what was checked, in which market, and what it does **not** mean. "Certified" always travels with its exact scope. This is what makes a standard trustworthy rather than just another badge.

---

## Part 2 — What can be made from this data

The spreadsheet is not just a methodology — it's a content engine. Each sheet maps to a publishable website asset:

| Framework sheet | Becomes on the site | Build-readiness |
|---|---|---|
| CORE GATES (20) | "The Standard → Core requirements" — 20 gates in 5 plain-language families | **Ready to draft** — data is complete |
| PRODUCT MAP + P01–P07 | "Product Standards" — one public page per product group, each with module-status label | **Ready for launch scope** (P01–P06); P07 Phase 2; P08–P10 later |
| CLAIM MODULES (30) | **Public Claims Library** — searchable, one entry per claim | **Ready to build — highest-value asset** |
| SUSTAINABILITY (22) | "Sustainability Evidence Code" — organised by scope, never a score | **Ready to draft** |
| STANDARDS REGISTER (47) | "Live Standards Register" — public maintained table with source links | **Ready to publish (near-verbatim)** |
| SCHEME GOVERNANCE (16) | "Governance" section — impartiality, competence, appeals, mark use | **Ready to draft** (needs real appointments before naming people) |
| MARKET OVERLAYS (7) | "Declared market scope" explainer + per-certificate market field | **Ready to draft** |
| CORE GATES "public proof" column + G11/G13 | **Certified Product Registry** proof-page schema | **Ready to spec** (needs data model build) |
| AUDIT NOTES (19) | Internal change log driving "what to remove from the current site" | **Use now** to fix live-site errors |

So the answer to "what can we make from this" is: **the entire Standards section, the Claims Library, the Product Standards pages, the Sustainability Code, the Standards Register, the Governance pages, and the registry schema** — all have their content already sitting in the framework. Most of the work is editorial (turn rows into plain-language pages) and structural (build the registry data model), not research.

---

## Part 3 — Separate the two products (the most important correction)

Create two visibly distinct systems with different names, different visual treatment, and different disclaimers. A visitor should never confuse them.

### Product Evidence Review
Based **only on publicly available information** — labels, marketplace listings, published studies, the visible INCI.

Every review must carry this statement, verbatim:

> *"Public evidence review. The confidential formula, manufacturing dossier and private laboratory reports were not reviewed. This is not certification."*

Replace "Clean Sheet Approved" with a four-state **evidence status** (no scores, no tiers):

1. **Strong public evidence** — the claims that can be checked hold up against visible evidence and the INCI.
2. **Partial public evidence** — some claims are supported; others rely on ingredient theory or aren't publicly evidenced.
3. **Evidence unavailable** — the claims may be honest, but no public evidence is visible. Brands can enter certification to prove them.
4. **Claim contradicted** — a visible claim is contradicted by the product's own ingredient list, or isn't permitted in the declared market.

These statuses map directly to the framework's claim logic (finished-product evidence required, ingredient theory insufficient, prohibited-wording rejected — Claim Modules CL01–CL30).

### The Clean Sheet Certification
Based on the **confidential dossier**: quantitative formula, safety assessment, test reports, manufacturing records, claims evidence, and an independent certification decision (Core Gates C01–C20 + the applicable modules).

Only certified products receive the **badge, QR code, and an entry in the Certified Product Registry**. Certification uses one outcome — **Certified** — always shown with its exact scope and limits.

| | Product Evidence Review | Clean Sheet Certification |
|---|---|---|
| Input | Public information only | Confidential dossier + tests |
| Output | Evidence status (1 of 4) | Certified + public proof page |
| Badge / QR | No | Yes |
| In the Registry | No (separate reviews directory) | Yes |
| Decision by | Automated + editorial review | Independent technical panel |
| Disclaimer | "This is not certification" | Scope + limits stated on the certificate |

Split `/brands` accordingly: **Reviews** (the public directory of evidence reviews) and **Verify** (the registry of certified products only).

---

## Part 4 — Site architecture

Navigation, six destinations:

**Standard** · **Verify** · **Reviews** · **For Brands** · **Governance** · **Reads**

- **Standard** — the authority hub (Part 5.1–5.5). What TCS certifies, what it doesn't mean, the core gates, product standards, claim evidence rules, the sustainability code, the standards register, and version history.
- **Verify** — searchable registry of **certified products only**; each links to a live proof page.
- **Reviews** — the public evidence-review tool and reviewed-product directory (the "not certification" product).
- **For Brands** — scope check, document requirements, process, timelines, confidentiality, application.
- **Governance** — impartiality, evaluator competence, conflicts, complaints, appeals, surveillance, certification-mark rules.
- **Reads** — consumer education and editorial.

### Homepage opening

> **Independent product certification for beauty and personal care**
> **Proof behind every certified claim.**
>
> The Clean Sheet reviews a product's formula, manufacturing controls, testing evidence, label and marketing claims against a published, product-specific standard. Every certified product receives a live public proof page.
>
> **Explore the standard** · **Verify a certificate** · **Apply for certification**
>
> *The Clean Sheet is a voluntary private certification scheme. Certification does not replace regulatory approval and does not guarantee that no individual will experience irritation or allergy.*

Drop "clean beauty standard" as the master category line. Use **"Independent product certification for beauty and personal care."** "Clean beauty" pulls the brand back toward blacklist thinking; the framework is evidence-based, not blacklist-based.

---

## Part 5 — Section build specs

### 5.1 The Standard — authority hub

Open with a status banner, verbatim:

> **The Clean Sheet Product Standards Framework 2026 — Version 0.9 — Status: Under independent expert validation.**
> *This framework describes the proposed requirements for The Clean Sheet certification scheme. The Clean Sheet is a voluntary private certification system. It does not replace legal registration, regulatory approval or professional medical advice.*

Then, in order:

**What The Clean Sheet certifies** — evidence-based conformity of a specific product, in declared markets, against the published standard.

**What certification does *not* mean** — not a guarantee against all irritation/allergy; not regulatory approval; not a claim about products/variants outside the certified scope; not a blanket "safe" verdict. (This section is a trust asset, not fine print — give it real weight.)

**The system, shown simply** — every certification runs the stack:

1. Twenty mandatory **core gates**
2. The applicable **product module** (P01–P07)
3. Applicable **population and format overlays** (baby/child, eye, lip, aerosol, powder…)
4. Relevant **claim modules** (CL01–CL30)
5. Declared **market requirements** (India first, then EU/US/AU/CA/UK/ASEAN)
6. Optional **environmental claim verification** (Sustainability Evidence Code)

State the non-negotiable rule up front: **every applicable legal, safety, quality and material-claim gate must pass. No score compensates for a failed gate.**

**Core requirements** — publish the 20 gates as plain-language pages grouped into five families:

1. **Legal status & market classification** — C01 classification, C02 formula & ingredient legality
2. **Formula & finished-product safety** — C03 safety assessment, C04 impurities, C09 microbiology, C10 preservation, C11 local tolerance, C15 population/exposure, C16 nanomaterials
3. **Manufacturing quality & traceability** — C05 GMP, C06 batch identity, C07 stability, C08 packaging, C14 label information, C17 supplier & change control
4. **Claims & consumer information** — C12 claim-to-evidence matrix, C13 digital/physical label parity
5. **Evidence provenance & certification governance** — C18 post-market surveillance, C19 evidence & lab competence, C20 certification decision & surveillance

For each gate, publish exactly six fields (the sheet already holds all of them):

*What is checked · When it applies · Minimum evidence expected · The decision principle · What appears publicly · Standards referenced.*

Keep the raw thresholds, internal risk logic and full evidence packages **out** of public view (Part 8).

### 5.2 Product Standards pages

One public page per product group. **Launch scope:** Sunscreen & SPF (P01), Leave-on skincare (P02), Rinse-off & body (P03), Baby & child (P04), Hair & scalp (P05), Colour cosmetics (P06). **Phase 2:** Deodorant/antiperspirant/aerosol (P07), Intimate external-use (P08). **Later:** Nail (P09), Oral care (P10).

Each page shows: products included/excluded · mandatory product requirements · format-specific requirements · claims that trigger extra evidence · accepted methods **and their limitations** · consumer-facing proof that will be published · **module status** (Under Validation / Open for Application / Active).

Do **not** present future modules as available. A greyed "Later scope — not yet open" state is the honest, credibility-building choice.

The framework's per-module honesty is a differentiator — publish it. Examples worth surfacing: sunscreen SPF label value is set by market law, not a test report alone (P01/S03); in-vitro SPF excludes powders and sticks (S04); "reef-safe" from ingredient absence alone is rejected (S15); baby care is a *population overlay*, not one product type, with no arbitrary 10× margin (P04).

### 5.3 Public Claims Library — the strongest asset

A searchable library, one entry per claim, covering all 30 in the framework (CL01–CL30). Suggested groups:

- **Efficacy/performance:** Clinically proven, Non-comedogenic, Hydrates for X hours, Barrier repair, Reduces wrinkles/pigmentation, Blue-light/HEV, Anti-pollution, Microbiome-friendly, Water-resistant
- **Testing & oversight:** Dermatologist tested, Ophthalmologist tested
- **Safety & population:** Hypoallergenic, Sensitive skin, Tear-free, Pregnancy safe, Baby safe
- **Composition / free-from:** Fragrance-free, Unscented, Free-from [ingredient], Chemical-free / toxin-free *(prohibited wording)*
- **Disease boundary:** Anti-acne / treats dandruff
- **Origin & ethics:** Natural/organic, Vegan, Cruelty-free
- **Environmental:** Reef-safe, Sustainable/green/eco, Recyclable, Biodegradable/compostable, Carbon neutral, PCR content / plastic-free

For every claim, publish six public fields:

1. What the claim communicates to consumers
2. Minimum acceptable evidence
3. Whether **finished-product** evidence is required
4. Evidence that does **not** qualify
5. Acceptable qualified wording
6. What The Clean Sheet publishes if the claim is verified

Worked example (built from CL01 + CL13):

> **"Clinically proven"** — Communicates: a measured human result. Minimum evidence: a controlled finished-product clinical study with a pre-specified endpoint, population, comparator and statistics. Finished-product evidence required: **Yes.** Does not qualify: ingredient-category literature; consumer-perception surveys. Acceptable wording: "clinically shown to [exact endpoint] in [population] over [duration]." Published if verified: the endpoint, population and duration tested.
>
> **"Chemical-free" / "toxin-free"** — Rejected wording. Cosmetics are composed of chemicals; "toxin" is undefined without dose. The library states this plainly and offers the compliant alternative (a specific, substantiated claim).

Certified product pages list the claims **covered by the certificate** and state that no other claims are covered. Unsupported material claims must be corrected or removed before certification (Governance G08).

### 5.4 Sustainability Evidence Code

A separate page. **Never reduce sustainability to a single score.** Organise the 22 rows by unit of proof:

1. **Organisation / facility** — e.g. ISO 14001 EMS (context only)
2. **Product impact** — LCA (14040/44), carbon (14067), water (14046), circularity (59020)
3. **Packaging** — optimisation (18601/02), recycled content & recyclability (18604), compostability (18606)
4. **Supply chain** — sustainable procurement (20400), chain of custody (22095)
5. **Environmental communication** — self-declared claims (14021:2026), India CCPA/ASCI green-claim rules

State the traps the framework already identifies: an ISO 14001-certified *facility* does not prove a *product* is sustainable; a recyclable *polymer* doesn't prove the whole *package* is practically recycled in the target geography; ISO 16128 measures natural content and explicitly does **not** certify "natural," safe, or sustainable. Publish verified claims individually and factually — *"Packaging contains 30% verified post-consumer recycled plastic"* — never "Sustainable Product Certified."

### 5.5 Live Standards Register

Publish the 47-entry register almost verbatim — it's one of the most credibility-building assets available, and far stronger than "13 standards referenced." Columns: standard/rule · current edition · status · scope · **how TCS uses it** · **important limit** · last reviewed · next review · official source link.

It demonstrates that TCS knows what each standard does *and where it doesn't apply* — e.g. ISO 22716 excludes environmental protection; ISO/TR 18811 prescribes no universal protocol; ISO 24443 is a UVA method, not a standalone photostability standard; ISO 17516 has a replacement edition under approval. Show the 2026 edition changes (ISO 14001/14021/14024/14025) as evidence the register is genuinely maintained.

### 5.6 Verify — Certified Product Registry (data model)

Each proof page publishes these 16 fields (assembled from each gate's "public proof" line + Governance G11/G13):

1. Product and brand name
2. Responsible legal entity
3. Product category, SKU and variant
4. Certificate number *(format: TCS-[YEAR]-[CATEGORY]-[SERIAL])*
5. Certified standard version
6. Formula and package version identifiers
7. Declared market scope
8. Product and population modules assessed
9. Verified claims (and the statement that no other claims are covered)
10. Test methods, laboratory type, test date, result status
11. Manufacturing review status
12. Consumer directions and limitations
13. Issue date and expiry date
14. Current status (Certified / Suspended / Withdrawn / Expired)
15. Change and surveillance history
16. Complaint / safety-concern reporting link

One public outcome — **Certified** — plus exact scope and limitations. **No public Gold/Silver/conditional tiers.** Certificates are time-limited with annual surveillance; any material change without notification suspends the certificate (Governance G12). Machine-readable, QR-linked, always current.

### 5.7 For Brands

Scope check (which module(s) apply) · document requirements (dossier contents) · the process and independent-decision steps · realistic timelines · confidentiality commitments (what stays private, Part 8) · application. Frame value honestly: certification is a competitive advantage *because* it's independent and scoped — not because it's easy.

### 5.8 Governance

Publish **real** governance, not aspirational governance (the 16 controls G01–G16): scheme owner and legal entity · certification decision process · separation of consulting, technical review and final decision · evaluator qualifications · laboratory acceptance policy (ISO/IEC 17025 scope) · impartiality and conflict policy · surveillance and material-change rules · complaints and appeals · suspension/withdrawal/expiry · certification-mark licence and misuse · standard revision and transition · funding and fee-independence statement.

Name experts **only** when formally appointed, with documented roles and declared conflicts (G16 requires independent legal, toxicology, microbiology, clinical, sunscreen, sustainability and conformity-assessment review before the framework goes normative).

### 5.9 Reviews & 5.10 Reads

**Reviews** hosts the public evidence-review tool and directory (Part 3), each entry carrying the "not certification" disclaimer and one of the four evidence statuses. **Reads** carries consumer education and editorial — the top-of-funnel that makes both Reviews and Certification matter.

---

## Part 6 — What to remove or change on the current site

Each of these is flagged by the framework's own audit and should be corrected immediately for credibility:

| Currently on the site | Problem | Replace with |
|---|---|---|
| 0–100 score; Gold / Silver tiers; fixed weights | A weighted score can mask a failed critical requirement | Pass/fail gates; one public outcome, "Certified," with scope |
| "Safety is 50% of our score" | Encodes the scoring model being retired | Safety as mandatory gates (C03–C16) that must pass |
| Blanket ingredient labels — "safe / caution / flag" | Hazard labels ≠ finished-product exposure safety | Formula-level, exposure-based assessment; publish rationale |
| Automatic fail for *all* formaldehyde releasers | Blanket bans aren't exposure-based | Risk- and exposure-based limits; disclose the TCS rationale |
| "We don't set thresholds, we apply them" | The site *does* set TCS-specific limits | State that TCS applies market law **plus** transparent TCS risk-based limits, with rationale |
| Fixed 2-year validity for every category | Validity should reflect risk and surveillance | Time-limited certificates + annual surveillance; category-appropriate |
| Outdated SCCS / IFRA references | 2026 editions supersede them | Cite SCCS Notes of Guidance 12th revision; current IFRA library; track via the register |
| "Global readiness" / "export confidence" with no market scope | Legally meaningless without declared markets | State declared market scope per certificate |
| "Safe and compliant" as a universal verdict | Overclaims; not exposure- or market-specific | Scoped, gated conclusions only |
| "Clean beauty standard" as the category line | Pulls toward blacklist certification | "Independent product certification for beauty and personal care" |
| "Clean Sheet Approved" beside certification | Blurs the two products | "Approved" retired; evidence statuses for reviews, "Certified" for certification |

**Fix the governance contradiction now:** the certification page says evaluations are already conducted by an independent panel, while the About page says panel members are still being confirmed. Until members are formally appointed, both pages should say the same true thing — the panel is *being constituted* — and the status banner (v0.9, under validation) should be sitewide.

---

## Part 7 — What stays private

Public: the objective requirements, accepted evidence, and decision principles. Confidential: quantitative formula · supplier documents and commercial terms · raw laboratory reports (unless the brand agrees to redacted publication) · proprietary risk calculations · internal assessor notes · internal risk-triage scores · brand corrective-action discussions · security and anti-fraud controls.

The balance to hold: enough decision logic is public that the certification is *trustable*; enough detail is private that it's not gameable and brand confidentiality is respected. If the logic is hidden as IP, trust collapses; if the thresholds are all public, the scheme is gamed. Publish the principles, protect the numbers.

---

## Part 8 — Document control

- **v1 public draft:** archived as superseded (`archive/superseded-standards/`, done). Never publish as active.
- **v2.0 scored standard:** demote to internal reference. Mine its schedules (ingredient limits, lab directory, allergen tables) but correct each against the audit before any reuse; do not publish the scored/tiered model.
- **Framework 2026 (v0.9):** the working source. Everything public carries the "Under independent expert validation" banner until Part 9 is complete.
- Establish one rule going forward: a public standards page and its internal source move together, version-stamped, and no document may describe itself as "active/approved" until it actually is.

---

## Part 9 — Phased rollout

**Phase 0 — Stop the contradictions (now).** Sitewide v0.9 status banner. Remove public scores/tiers and the items in Part 6. Fix the panel contradiction. Split "Approved" into evidence statuses (Reviews) vs "Certified" (Certification). Add the "this is not certification" disclaimer to every review. Low build effort, large credibility gain.

**Phase 1 — Stand up the Standard.** Publish: What we certify / what it doesn't mean, the 20 core gates (5 families), the modular system page, and the Live Standards Register (near-verbatim). Rebuild `/certification` into the Standards Centre. This is the priority — it raises credibility more than any marketing copy.

**Phase 2 — Split the registry and open modules.** Separate `/brands` into **Reviews** and **Verify**. Build the Certified Product Registry data model (16 fields, one proof page per certificate). Publish launch Product Standards pages (P01–P06) with honest module-status labels. Ship the Public Claims Library (30 claims).

**Phase 3 — Complete the centre.** Sustainability Evidence Code, Governance pages (with appointed experts), market-overlay explainers, Phase-2 modules (P07–P08). Turn on surveillance history in the registry.

**The validation gate (before "Active").** The framework becomes normative (v1.0 Active) only after documented independent review — legal, toxicology, microbiology, clinical, sunscreen, sustainability and conformity-assessment (G16). Until then, every page stays "Under validation." This honesty is not a weakness to hide; on a proof brand, it *is* the proof.

---

## Immediate next actions (priority order)

1. Apply the sitewide **v0.9 "Under validation"** banner and fix the panel contradiction.
2. Remove public scores/tiers and the Part 6 items from `/certification` and the homepage.
3. Publish the **Live Standards Register** (fastest high-credibility win — data is publish-ready).
4. Rebuild `/certification` → **Standards Centre**: what we certify, what it doesn't mean, the 20 gates.
5. Split `/brands` into **Reviews** (evidence statuses + disclaimer) and **Verify** (certified only).
6. Spec and build the **Certified Product Registry** proof-page data model (16 fields).
7. Draft the **Public Claims Library** (30 entries) — the strongest single content asset here.
