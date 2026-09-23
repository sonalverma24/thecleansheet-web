# How The Clean Sheet Analyser Works (Plain-English Guide)

This is the layman's version. If you want the exact code-level walkthrough, read `PRODUCT-ANALYSIS-LOGIC.md`. This document explains, in everyday language, what happens from the moment someone searches a product to the moment they see a verdict.

---

## The one idea that explains everything

Think of the analyser as a **courtroom**, not a single person.

- The **researcher** goes out and gathers evidence about the product. This is the AI (a language model). It reads the internet, finds the ingredient list, notes the claims on the label, and looks for proof.
- The **judge** decides the verdict. This is our own code (plain, predictable rules). It does the maths and applies the standard.

We never let the researcher also be the judge. The AI can find things and describe them, but it does **not** get to hand out the final grade or the "Approved" stamp. The code does that, using fixed rules, so the same product always gets judged the same way.

This is the golden rule of the whole system: **the AI researches, the code decides.**

Why this matters: AI can sometimes exaggerate, misread a label, or even invent a detail. By making the code the final judge, one bad guess by the AI can never wrongly condemn or wrongly bless a product. Every important decision is double-checked against real evidence.

---

## The journey of a single product, step by step

Imagine a user types "La Roche-Posay Mela B3 Serum" (or pastes a shopping link) into the review box.

### Step 1: Figure out exactly which product this is

Before anything else, we pin down the exact product, because "the serum" could mean five different sizes or variants.

- If the user **typed a name**, we look it up in a trusted ingredient database (INCIDecoder). If the name is ambiguous (it could match several products), we stop and **ask the user which one they meant** rather than guessing.
- If the user **pasted a link**, we open that web page, read it, and pull the real product name and ingredient list straight off it.

The goal of this step is to lock onto **one** product with **one** real ingredient list.

> **INCI** is just the official, standardised name list of what is inside a cosmetic. Every ingredient has one worldwide name (for example, water is always "Aqua"). It is the product's honest recipe.

### Step 2: Have we already reviewed this?

Every product we have ever analysed is stored, filed under a single clean name (its "slug"). Before doing any expensive work, we check the shelf.

- If we already have a review of this exact product, we hand back the stored one instantly. No need to research it again.
- This also means two people searching the same product in slightly different words get the **same** answer, not two contradictory ones.

### Step 3: Send the researcher out (the AI)

If it is genuinely a new product, we give the AI a detailed instruction sheet (its "system prompt") and the real ingredient list we found in Step 1. We tell it to go and:

- find the product's price across Nykaa, Amazon, Flipkart, and the brand's own site,
- collect every **claim** the product makes ("reduces dark spots", "48-hour hydration", "clinically tested"),
- for each claim, hunt for **evidence** and note how strong that evidence is,
- read any test reports or studies the brand has published.

The AI hands all of this back in a structured form (a filled-in template), not free-flowing text. If it hands back something garbled, we ask it again (up to three tries) before giving up.

### Step 4: Grade the evidence, not the ambition

Here is a subtle but important idea. A bold claim is **not** automatically bad. A bold claim that is **proven** is fine. A modest claim with **no proof** can be worse.

So for every claim, the AI works out the **residual risk**: it starts with how ambitious the claim is, then subtracts the strength of the evidence actually found. What is left over is the risk.

Evidence is ranked on a ladder from 1 to 7:

- **Level 1-2:** No real proof, or only a general study about the ingredient (not this actual product).
- **Level 4-5:** A proper test on the finished product, better still if an independent lab ran it.
- **Level 6-7:** A published or registered clinical study with a stated method.

A key rule: a study about an ingredient in general only counts as weak (Level 2) proof for a finished product. To truly back a claim like "this serum reduces pores", the brand needs a test on **this serum**, not just a paper about the ingredient.

### Step 5: Score the product out of 100

The code now scores the product across seven areas. Each area has a maximum, and points are deducted where the product falls short. In plain terms:

| Area | Out of | What it measures |
|---|---|---|
| Price Fairness | 10 | Is the price honest and consistent, or is it discounting theatre? |
| Claim Responsibility | 15 | Are the claims made responsibly, given the evidence and the law? |
| Claim Evidence | 20 | How strong is the actual proof behind the claims? (The biggest reward.) |
| Ingredient Transparency | 20 | Does the brand openly share the full recipe and details? |
| Formula Logic | 15 | Does the recipe actually make sense for what it promises? |
| Consumer Suitability | 10 | Does it clearly say who it is for and who should avoid it? |
| Platform Consistency | 10 | Does it say the same thing everywhere it is sold? |

Add them up and you get a score out of 100. Evidence and transparency together are worth 40 of the 100 points, because honesty is what the platform rewards most.

### Step 6: Apply the safety guardrails (why we do not wrongly condemn)

Before deciding the final tier, the code runs two protective checks so the AI can never drag an honest product down on a bad guess.

- **Guardrail 1 - Ingredient truth.** If a claim like "sulphate-free" is going to count against a brand, the code first confirms, against the real ingredient list, that a sulphate is actually present. If it cannot confirm the contradiction, the flag is cancelled. Also, "contains vitamin C" is never treated as a lie: if the vitamin C is not listed, that is simply "unverified", not a punishable false claim.
- **Guardrail 2 - Corroboration.** If we actually read a product page, the code checks that a serious claim really appears in that text. If the AI reports a claim the brand never actually made (a hallucination), it is thrown out and cannot lower the score.

Only a claim that survives **both** guardrails can push a product into the worst tier. On top of this, there is one hard safety rule: if the product contains an ingredient that is **banned** in cosmetics, it can never be Approved, full stop.

### Step 7: Decide the verdict (four tiers)

The code sorts the product into one of four bands, best to worst:

1. **Clean Sheet Approved** - a high overall score **and** the headline claims are genuinely well proven. This is deliberately strict and rare.
2. **Mostly Clean** - safe and honest and well made, but some claims rest on ingredient-level evidence rather than proof on the finished product.
3. **Can Do Better** - nothing wrong, nothing unsafe, but the proof and transparency do not yet match the claims.
4. **Not Recommended** - the **only** negative label. Reserved for a confirmed problem: a claim that is illegal in India (a drug-style promise like "cures acne"), a claim the product's own ingredients contradict, or a banned ingredient.

Important fairness principle: **missing proof is never "Not Recommended".** A product with thin evidence lands in "Can Do Better", not the naughty corner. You only get the negative label for something the code has actually verified is wrong.

### Step 8: Find a picture, then file it away

The code finds a live product image (checking that the image link actually works, so the page never shows a broken photo). Then:

- The full review is **stored** so it never has to be recomputed, and so it can appear in the public directory at `/brands`.
- Any new ingredients discovered are quietly added to the ingredients library at `/ingredients`.
- If the product earned "Approved", it also joins the verified registry.

One exception: if someone just pastes a bare list of ingredients with no product name, we still show them a review, but we do **not** add it to the public directory, because we cannot say which product it belongs to.

---

## Why the verdict can change without re-running the AI

Because the **code** is the judge, not the AI, we can improve the judging rules and re-apply them to every stored review instantly, without paying to research thousands of products again. When we change the rulebook, we bump a version tag (`RUBRIC_REV`), and older reviews are re-graded under the new rules the next time they are served.

---

## The one-paragraph summary

A user searches a product. We pin down exactly which product it is and pull its real ingredient list. If we have seen it before, we return the stored review. Otherwise the AI researches its price, claims, and evidence across the web. Our own code then grades it out of 100 across seven areas, runs two guardrails to make sure no claim is counted against the brand unless it is genuinely true and genuinely made, applies a hard safety rule for banned ingredients, and sorts the product into one of four honest tiers. The result is saved so everyone searching that product sees the same fair, evidence-based verdict. Throughout, the AI only gathers evidence: the code always decides.
