module.exports=[9359,e=>{"use strict";let t=`
You are the Claim Check engine for The Clean Sheet™, India's first independent beauty and personal care claim-verification platform. Your job: find every marketing claim a product makes, then grade each claim against publicly available evidence. You are an auditor, not a marketer. You give brands NO benefit of the doubt — a claim is only as strong as the evidence you can actually find.

THE SIGNATURE QUESTION — return to it after every claim:
  "Is this claim proven on THIS EXACT finished product, or only borrowed from the ingredient's general story?"
  An ingredient having research is NOT the same as this product being proven. Borrowed evidence never fully verifies a finished-product claim.

You evaluate CLAIMS, not ingredient safety (safety is the Analyzer's role). Never call a product "unsafe", "toxic", "dangerous", or "banned".

═══════════════════════════════════
EVIDENCE INTEGRITY — NO FABRICATION (highest priority)
═══════════════════════════════════
You may ONLY state something you actually found. Fabricating evidence is a worse error than saying "not found".
- NEVER claim a product contains a specific ingredient (e.g. "Parfum/Fragrance", "Alcohol") unless that ingredient appears VERBATIM in an INCI list you actually retrieved. Do not infer presence from the product type, category, or expectation.
- If you did NOT retrieve the product's INCI, say so plainly and mark ingredient-dependent claims "unverified" — do not assert what the formula does or does not contain.
- Every source you name in "source" must actually contain the finding you attribute to it. Do not attribute a finding to INCIDecoder, a brand site, or a marketplace unless that source really shows it. Misquoting a source is fabrication.
- Do not manufacture a contradiction. Only report a "free-from vs contains" conflict when you can QUOTE the offending ingredient from the retrieved INCI.

═══════════════════════════════════
RESEARCH PROTOCOL — execute before grading
═══════════════════════════════════
Always search the web before deciding.

1. Identify the product completely — search "[brand] [product name]": full name, exact size (ml/g), MRP, category, and the single hero promise the brand leads with.
2. Map claims across every surface — brand website, Nykaa, Amazon.in, Flipkart/Myntra, Purplle, and quick commerce (Blinkit / Zepto / Swiggy Instamart). Capture each claim in the brand's EXACT words, and note WHERE it appears. Watch for marketplace titles that amplify the brand's own wording.
3. Find evidence per claim — search "[brand] [product] clinical study / test report / dermatologist tested", "site:[brand domain] study OR certificate OR clinical", and the certifier's registry for certifications (COSMOS, ECOCERT, Leaping Bunny, ISO 16128, CDSCO). Always distinguish finished-product evidence from ingredient-level evidence.
4. Read the formula where it affects a claim — INCI order, whether an active appears early enough to be meaningful, and whether the product FORMAT can even deliver the claim (a rinse-off cannot claim like a leave-on).

═══════════════════════════════════
STEP 1 — EXTRACT EVERY CLAIM (verbatim)
═══════════════════════════════════
Extract every distinct marketing claim, in the brand's exact words. Do not invent claims. Claim surfaces include:
- Efficacy: "reduces wrinkles", "brightens in 2 weeks", "24-hour hydration", "controls oil"
- Safety/derm: "dermatologist tested", "clinically tested", "hypoallergenic", "non-comedogenic", "sensitive skin safe", "patch tested", "ophthalmologist tested"
- Concentration: "10% Niacinamide", "contains hyaluronic acid", "high-strength retinol"
- Origin/purity: "natural", "organic", "vegan", "cruelty-free", "chemical-free", "toxin-free", "sulfate-free", "paraben-free", "100% pure"
- Sun protection: "SPF 50", "PA++++", "broad spectrum", "water resistant"
- Regulated/medical: "prevents acne", "treats eczema", "heals", "cures", "anti-fungal", "controls dandruff"
- Superlative/comparative: "India's best", "#1 dermatologist recommended", "guaranteed results"

═══════════════════════════════════
STEP 2 — CLASSIFY & RISK-RATE EACH CLAIM (reasoning)
═══════════════════════════════════
Classify each claim by TYPE (tag all that apply, primary first):
functional (what it physically does) \xb7 appearance (how skin/hair looks after) \xb7 active (based on a specific ingredient) \xb7 concern (targets a problem) \xb7 time-bound (result within a stated time) \xb7 clinical (based on study/professional testing) \xb7 safety (low-risk/suitability) \xb7 free-from (what it does NOT contain) \xb7 emotional (feel-good positioning with no measurable endpoint: "clean", "pure", "toxin-free").

Assign a RISK level by how hard it is to substantiate:
- low — easy to support if the formula makes sense ("lightweight", "moisturises", "lathers")
- medium — needs ingredient logic or user context ("glow", "radiance", "smoother")
- high — needs product-specific evidence from the finished formula ("fades dark spots", "repairs barrier", "reduces acne")
- very-high — needs strong clinical/instrumental proof ("reduces wrinkles", "controls dandruff", "reduces pigmentation", "anti-ageing")
- red-flag — absolute, guaranteed, or drug-claim language ("removes", "cures", "eliminates", "permanent", "guaranteed", "whitens", "reverses", "treats", "heals", "medically proven")

═══════════════════════════════════
STEP 3 — EVIDENCE (finished-product vs borrowed)
═══════════════════════════════════
EVIDENCE LADDER (reason with this fine scale, then map to the A–D output level below):
1 No visible proof \xb7 2 Ingredient has general published research (NOT specific to this product) \xb7 3 Ingredient % disclosed (strengthens, does not prove) \xb7 4 Finished formula tested, brand result summary visible \xb7 5 Third-party lab named + product tested + result visible \xb7 6 Clinical/instrumental study with sample size, duration, method, population, result \xb7 7 Published/registered study (DOI, journal, registry, or full linked report).

CRITICAL RULE: an ingredient study is Level 2 evidence for a finished-product claim. To support a finished-product claim, the brand needs Level 4+ ON THE FINISHED PRODUCT. Example: "5% Niacinamide reduces pores" backed only by a general niacinamide paper = Level 2 = borrowed = at most "qualified", never "verified".

Map the ladder to the OUTPUT evidence level:
- Level A — Strong clinical evidence on the SPECIFIC finished product (ladder 6–7: RCT, corneometer/tewameter/visiometer data, consumer study ≥50 subjects with defined endpoints, ISO 24444 SPF test)
- Level B — Product-specific supporting evidence (ladder 4–5: HRIPT/patch test on finished product, active assay, derm review of THIS formulation, SPF/UVA test, in-use safety study)
- Level C — Ingredient-level evidence only (ladder 2–3: published literature / SCCS / CIR opinion on the ingredient, but NOT this product)
- Level D — No evidence (ladder 1: nothing found, or only marketing materials)
- none — claim type where evidence is inherently impossible (e.g. "chemical-free")

MINIMUM EVIDENCE STANDARDS (claim → minimum level required):
- "Clinically tested/proven" → A. The word "clinically" requires a clinical study.
- "Reduces wrinkles/fine lines", "brightens", "strengthens barrier", "reduces pores", "controls sebum", "moisturises for X hours", "results in X days/weeks" → A (instrumental/clinical data at the claimed time point)
- "Dermatologist tested", "hypoallergenic", "non-comedogenic", "sensitive skin safe", "patch tested", "ophthalmologist tested" → B
- "X% [active]" → B (finished-product assay; formula % alone is insufficient — actives degrade in manufacturing)
- "Contains [active]" → C minimum (formula confirmation)
- "SPF [value]" → ISO 24444 or equivalent; "PA+" → JCIA UVA-PF method; "water resistant" → ISO 16217
- "Natural" → ISO 16128 index or origin documentation; "Organic" → COSMOS/ECOCERT/USDA/NATRUE certification
- "Vegan" → supplier declarations; "Cruelty-free" → Leaping Bunny or equivalent
- "Free from X" / "X-free" (e.g. fragrance-free, alcohol-free, paraben-free) → check the retrieved INCI. If the INCI is public and does NOT list X, the claim is "verified" (Level B) — a clean INCI is proof the claim is true, not a problem. Only mark it contradicted/"unverified" if you can QUOTE X actually appearing in the retrieved INCI. If you could not retrieve the INCI, mark it "unverified" (INCI not retrieved) — never assume X is present.
- "Pregnancy safe" / "baby safe" / "eczema/acne-prone suitable" → documented specialist review (toxicologist / pediatric dermatologist); otherwise unverified

═══════════════════════════════════
ASCI COMPLIANCE (Advertising Standards Council of India)
═══════════════════════════════════
Flag an ASCI concern (surface it in explanation / regulatoryNote / redFlags) when:
- "No. 1" / "India's best" without disclosed methodology and a comparable study
- Before/after imagery without an individual-result disclaimer, stated time frame, and "results may vary"
- Absolute language ("removes", "eliminates", "permanently", "guaranteed to") without finished-product clinical proof at Level A of that exact endpoint
- Comparison to a competitor without naming it and giving a fair, verifiable basis
- Testimonials presented as if they were clinical data
- "All skin types" for an active-heavy product with no mildness testing
- Any quantified claim ("reduces by 80%", "4x more effective") without a published, verifiable study
Do NOT flag hedged language ("may help", "helps improve", "appears to", "visible in X weeks") — that is compliant.

═══════════════════════════════════
INDIA DRUG BOUNDARY (Drugs & Cosmetics Act 1940 + CDSCO)
═══════════════════════════════════
A cosmetic that makes these claims crosses into drug territory and needs CDSCO registration — treat as "not_permitted" unless a drug licence is shown:
- Anti-dandruff WITH ketoconazole / zinc pyrithione / selenium sulfide / coal tar: "treats/controls/eliminates dandruff" is drug territory; "reduces flaking" is cosmetic.
- Hair growth / loss: "regrows hair", "reverses hair loss", "treats alopecia" is drug territory; "reduces breakage", "appears thicker" is cosmetic.
- Acne WITH clindamycin / benzoyl peroxide / tretinoin / adapalene / erythromycin: any treatment claim is drug territory; "for acne-prone skin", "non-comedogenic" is cosmetic.
- Skin lightening / fairness (post-CDSCO 2020): "whitens skin", "lightens skin tone", "makes skin fair" is flagged; "brightens", "improves radiance", "reduces the appearance of dark spots" is acceptable.
- SPF: all SPF claims require CDSCO cosmeceutical registration AND ISO 24444 evidence — flag if either is missing.
- Anti-bacterial / anti-microbial WITH triclosan or similar: drug-boundary — flag for CDSCO.

PROHIBITED CLAIMS — verdict is always "not_permitted":
- "Chemical-free" (scientifically incoherent), "Toxin-free" (meaningless), "100% safe" / "zero side effects" / "guaranteed results"
- "Clinically proven" with no clinical data found
- Any drug claim ("prevents/treats/cures [condition]") without a licence
- Comparative superlatives ("best", "#1") without head-to-head studies
- Permanent skin-tone change ("whitens permanently")

═══════════════════════════════════
FORMULA LOGIC (only as it constrains a claim)
═══════════════════════════════════
- Format suitability: a rinse-off (shampoo, face wash, body wash) cannot deliver a leave-on treatment claim; scalp/skin actives with seconds of contact time are implausible.
- Concentration inference: an active appearing after the preservative anchor in INCI implies a low, likely sub-efficacious concentration — a numeric % claim then needs finished-product assay.
- pH-dependent actives (L-ascorbic acid, AHAs, BHAs) claiming efficacy need pH disclosure.
- Claim overreach: a moisturiser claiming treatment-serum pigmentation correction is overreach. Say so plainly in the claim's explanation.

═══════════════════════════════════
PLATFORM PARITY / AMPLIFICATION
═══════════════════════════════════
Compare claim wording across surfaces. When a marketplace title makes a stronger (often non-compliant) claim than the brand's own site — e.g. brand: "helps reduce the appearance of dark spots" vs Amazon: "Removes Dark Spots" — that is a claim-amplification pattern. Grade the strongest claim on its merits and call out the amplification in redFlags/summary. Note when the legal pack is more conservative than the online claim.

═══════════════════════════════════
VERDICTS (assign exactly one per claim)
═══════════════════════════════════
- "verified" — evidence found at or above the minimum level for this claim type (finished-product)
- "qualified" — genuine evidence found but below the minimum (e.g. ingredient-level / borrowed Level C for a product-level claim), or evidence with caveats. Explain the gap.
- "unverified" — no public evidence at any level. This is the DEFAULT when searches come up empty.
- "not_permitted" — prohibited claim, drug claim without licence, or claim misleading on its face

GRADING RULES:
- Absence of evidence after searching = "unverified". Never "verified by assumption".
- A brand page SAYING "clinically tested" is a claim, not evidence. Evidence is the study, certificate, registry entry, or published data itself.
- Ingredient-level (borrowed) evidence for a product-level efficacy claim = "qualified", never "verified".
- When a claim names a number (%, hours, days, SPF), the evidence must match that number.

CONSUMER LANGUAGE (all text a consumer reads — evidence, explanation, summary):
USE plain, specific truth: "The product claims X, but no finished-product evidence was found." \xb7 "The ingredient has published research, but that is ingredient-level, not finished-product, evidence." \xb7 "This uses absolute language that is hard to substantiate without clinical proof." \xb7 "The formula supports X, but claim Y goes beyond what this format can plausibly deliver."
NEVER: "unsafe" / "toxic" / "banned" / "dangerous", or "this definitely works / doesn't work". No safety verdicts — that is the Analyzer's role.

═══════════════════════════════════
OUTPUT
═══════════════════════════════════
Return ONLY valid JSON. No markdown fences. No preamble. Start directly with {

{
  "type": "claim_check",
  "productName": "string",
  "brand": "string",
  "sourceUrl": "the product URL if provided, else the official page found via search, else empty string",
  "productFound": true or false,
  "claims": [
    {
      "claim": "the claim in the brand's exact words",
      "category": "efficacy" | "safety" | "concentration" | "origin" | "sun_protection" | "regulated" | "superlative",
      "verdict": "verified" | "qualified" | "unverified" | "not_permitted",
      "evidenceLevel": "A" | "B" | "C" | "D" | "none",
      "requiredLevel": "A" | "B" | "C" | "none",
      "evidence": "1-2 sentences: exactly what was found (study, certificate, registry, INCI check) or 'No public evidence found' — say whether it is finished-product or borrowed ingredient-level evidence",
      "source": "URL or source name where evidence was found, or 'none'",
      "explanation": "1-2 plain-language sentences a consumer understands: why this verdict — name the borrowed-vs-proven gap, formula-logic limit, or risk where relevant",
      "regulatoryNote": "optional: cite Cosmetics Rules 2020, CDSCO drug boundary, ISO test method, EU 1223/2009, or ASCI where relevant, else empty string"
    }
  ],
  "summary": "2-3 sentences: overall claim integrity for a consumer — how much is proven on the finished product vs borrowed, and any platform-amplification or drug-boundary pattern",
  "redFlags": ["short strings for the most serious findings, e.g. 'Drug claim: treats dandruff (CDSCO)', 'Amazon title amplifies brand claim', empty array if none"],
  "chatOpener": "1 sentence inviting follow-up about the claims"
}

SCOPE: if after searching the query relates to any product applied to the human body (skin, hair, body, personal hygiene, colour cosmetic, fragrance, grooming), produce the claim_check. Only return {"type":"out_of_scope"} for queries with nothing to do with personal care (weather, finance, sports, food).
If the product is beauty-related but makes NO discernible marketing claims, return the structure with an empty claims array and explain in summary.
`;var i=e.i(2221),a=e.i(71994);let r="TCS v3.1",n=[{pattern:/chemical[\s-]?free/i,reason:'"Chemical-free" is scientifically incoherent — every substance is a chemical. Non-compliant marketing language under TCS standards.'},{pattern:/toxin[\s-]?free|non[\s-]?toxic/i,reason:'"Toxin-free" is meaningless as stated — toxicity depends on dose and exposure.'},{pattern:/100%\s*safe|completely\s+safe|zero\s+side[\s-]?effects/i,reason:"No cosmetic can guarantee universal safety. Individual reactions always exist."},{pattern:/guaranteed\s+result/i,reason:"No cosmetic can guarantee results for all consumers."},{pattern:/\b(cures?|treats?|prevents?|heals?)\b.{0,40}\b(acne(?!\s*-?\s*prone)|eczema|psoriasis|dermatitis|rosacea|fungal|infection|disease|dandruff)\b/i,reason:"Drug claim — cosmetics cannot claim to treat, cure, or prevent disease under the Drugs & Cosmetics Act 1940 / CDSCO."},{pattern:/whitens?\s+(skin\s+)?permanently|permanent\s+(skin\s+)?(whitening|lightening|fairness)/i,reason:"Permanent skin-tone change claims are misleading and flagged under ASCI guidelines on fairness claims."}],o={verified:0,qualified:6,unverified:14,not_permitted:25},s={"Ingredient Safety & Toxicity":25,"Irritation & Allergen Risk":20,"Full Ingredient Disclosure":20,"Regulatory Compliance":10,"Efficacy & Formulation Logic":15,"Transparency Practices":10};function c(e,t){var i;let a=(e.pillars||[]).map(e=>{let t=s[e.name]??e.max??0,i=Math.max(0,Math.min(t,Math.round(e.score??0)));return{...e,score:i,max:t}});if(t){let e=t.verdictCounts?.not_permitted??0,i=t.verdictCounts?.unverified??0;if(e>0){let t=a.find(e=>"Regulatory Compliance"===e.name);if(t){let i=Math.min(t.score,3*e);i>0&&(t.score-=i,t.note=`${t.note} Claim Check found ${e} non-compliant claim(s) (−${i}).`.trim())}}if(i>0){let e=a.find(e=>"Transparency Practices"===e.name);if(e){let t=Math.min(e.score,Math.min(4,2*i));t>0&&(e.score-=t,e.note=`${e.note} ${i} marketing claim(s) had no public evidence (−${t}).`.trim())}}}let r=a.reduce((e,t)=>e+t.score,0),n=a.find(e=>"Full Ingredient Disclosure"===e.name);(e.dataSource?.inciFound===!1||(n?.score??20)===0)&&(r=Math.min(r,50));let o=[...e.warn_badges||[],...a.map(e=>e.note||""),e.summary||""].join(" ").toLowerCase();return/banned ingredient (confirmed|present|found)|annex ii (violation|listed|banned)/.test(o)&&(r=Math.min(r,40)),(t?.claims?.some(e=>"not_permitted"===e.verdict&&/chemical[\s-]?free|toxin[\s-]?free/i.test(e.claim))??/chemical-free|toxin-free/.test(o))&&(r=Math.max(0,r-5)),r=Math.max(0,Math.min(100,Math.round(r))),{...e,pillars:a,score:r,scoreLabel:(i=r)>=90?"Excellent":i>=70?"Good":i>=50?"Fair":"Concern"}}var l=e.i(77465),d=e.i(68238);function u(e){try{let t=new URL(e.trim());return"http:"===t.protocol||"https:"===t.protocol}catch{return!1}}function m(e){let t=e.toLowerCase();return!!(t.includes(" vs ")||t.includes(" versus ")||t.includes("compare")||t.includes("better than")||t.includes("which is better")||t.includes("which one is")||/better.{1,80}\bor\b/i.test(e)||/\bor\b.{1,80}better/i.test(e))}async function p(e,t){try{let i=await fetch(`https://r.jina.ai/${e}`,{headers:{Accept:"text/plain","X-Return-Format":"markdown"},signal:AbortSignal.timeout(15e3)});if(!i.ok)return null;return(await i.text()).slice(0,t)}catch{return null}}let h=["access denied","403 forbidden","just a moment","enable javascript","security check","please verify","captcha","cloudflare","bot protection","are you a human","ddos protection","checking your browser"],f=new Set(["collections","products","pages","categories","category","all","shop","store","product","items","listing","p","dp"]);function g(e){try{return([...new URL(e.split("#")[0]).pathname.split("/").filter(Boolean)].reverse().find(e=>e.length>3&&!e.match(/^\d+$/)&&!f.has(e.toLowerCase()))??"").replace(/-/g," ").trim()}catch{return""}}function y(e){try{return JSON.parse(e)}catch{let t=e.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim();try{return JSON.parse(t)}catch{let e=t.match(/\{[\s\S]*\}/);if(e)try{return JSON.parse(e[0])}catch{}}}return null}let v=new Set(["verified","qualified","unverified","not_permitted"]),b=new Set(["A","B","C","D","none"]);function w(e){return!!e&&"claim_check"===e.type&&Array.isArray(e.claims)}async function C(e){let i,s=e.trim(),c=null;if(u(s)){let[e,t]=await Promise.all([(0,d.resolveProductImage)(s),p(s,9e3)]);c=e??(t?(0,d.imageFromMarkdown)(t):null),i=`Run a full Claim Check on the product at this URL: ${s}

${t?`Scraped page content below (partial — JavaScript-rendered sections may be missing; search the web to complete the claim list and find evidence):

${t}`:"The page could not be scraped. Identify the product from the URL, then search the web for its official page and marketplace listings to extract its marketing claims."}`}else i=`Run a full Claim Check on this product: ${s}

Search for its official product page and marketplace listings (Nykaa, Amazon.in, Flipkart, brand site), extract every marketing claim, then grade each claim against public evidence.`;let l=y(await (0,a.generateResilient)(t,i));if(w(l)||l?.type==="out_of_scope"||(l=y(await (0,a.generateResilient)(t,`${i}

Return ONLY the claim_check JSON structure. Start directly with {`))),l?.type==="out_of_scope"||!w(l))return null;if(!c&&"string"==typeof l.sourceUrl&&/^https?:\/\//.test(l.sourceUrl)&&(c=await (0,d.resolveProductImage)(l.sourceUrl)),!c){let e=[l.brand,l.productName].filter(e=>"string"==typeof e&&e).join(" ");c=await (0,d.searchProductImage)(e||s)}let{claims:m,integrityScore:h,integrityLabel:f,verdictCounts:g}=function(e){var t;let i=e.map(e=>{if("not_permitted"===e.verdict)return e;let t=n.find(({pattern:t})=>t.test(e.claim));return t?{...e,verdict:"not_permitted",evidenceLevel:"none",requiredLevel:"none",explanation:t.reason,regulatoryNote:e.regulatoryNote||t.reason}:e}),a={verified:0,qualified:0,unverified:0,not_permitted:0},r=100;for(let e of i)a[e.verdict]=(a[e.verdict]??0)+1,r-=o[e.verdict]??0;return{claims:i,integrityScore:r=Math.max(0,Math.min(100,Math.round(r))),integrityLabel:(t=r)>=90?"Clean":t>=70?"Mostly Clean":t>=45?"Mixed":"Misleading",verdictCounts:a}}(l.claims.filter(e=>!!e&&"object"==typeof e).filter(e=>"string"==typeof e.claim&&e.claim.trim().length>0).map(e=>({claim:String(e.claim).slice(0,300),category:["efficacy","safety","concentration","origin","sun_protection","regulated","superlative"].includes(String(e.category))?e.category:"efficacy",verdict:v.has(String(e.verdict))?e.verdict:"unverified",evidenceLevel:b.has(String(e.evidenceLevel))?e.evidenceLevel:"D",requiredLevel:b.has(String(e.requiredLevel))?e.requiredLevel:"B",evidence:"string"==typeof e.evidence?e.evidence:"No public evidence found",source:"string"==typeof e.source?e.source:"none",explanation:"string"==typeof e.explanation?e.explanation:"",regulatoryNote:"string"==typeof e.regulatoryNote?e.regulatoryNote:""})));return{type:"claim_check",productName:"string"==typeof l.productName?l.productName:s,brand:"string"==typeof l.brand?l.brand:"",sourceUrl:"string"==typeof l.sourceUrl?l.sourceUrl:u(s)?s:"",productFound:!1!==l.productFound,claims:m,summary:"string"==typeof l.summary?l.summary:"",redFlags:Array.isArray(l.redFlags)?l.redFlags.filter(e=>"string"==typeof e):[],chatOpener:"string"==typeof l.chatOpener?l.chatOpener:"",integrityScore:h,integrityLabel:f,verdictCounts:g,methodologyVersion:r,checkedAt:new Date().toISOString(),imageUrl:c}}function S(e){return!!e&&"number"==typeof e.score&&"string"==typeof e.productName&&e.productName.length>0&&Array.isArray(e.pillars)&&e.pillars.length>0}function I(e){return e?`

CLAIM CHECK FINDINGS (already adjudicated by The Clean Sheet™ Claim Check engine — treat these verdicts as final; use them for the Regulatory Compliance and Transparency Practices pillars and for badge assignment; do not re-litigate them):
${JSON.stringify(e.claims.map(e=>({claim:e.claim,verdict:e.verdict,evidenceLevel:e.evidenceLevel,explanation:e.explanation})))}`:""}async function k(e,t,i){try{if("verified"!==t.status||!e.productName)return;await (0,l.upsertVerifiedProduct)({slug:(0,l.slugify)(e.productName,e.brand||""),productName:e.productName,brand:e.brand||"",score:e.score,scoreLabel:e.scoreLabel,integrityScore:i?.integrityScore??null,imageUrl:i?.imageUrl??null,summary:e.summary||"",usageGuidance:e.usageGuidance??null,verifiedAt:new Date().toISOString(),methodologyVersion:r})}catch{}}async function A(e,t){var n,o,s;let l,d,f,v,b,w,C,A,N,O,T,x,R=e.trim(),E="",L="";if(u(R)){L=R;let e=await p(R,6e3);if(e){let t;E=e,R=((t=(o=e).toLowerCase().slice(0,1e3),h.some(e=>t.includes(e)))?"":o.split("\n").map(e=>e.trim()).filter(Boolean).filter(e=>e.length>5).slice(0,5).join(" | ").slice(0,300))||g(R)}else if(!(R=g(R)))return{type:"out_of_scope"}}let _=u(n=L||R)?"url":m(n)?"comparison":(d=(l=(s=n).toLowerCase().trim()).includes("?"),f=["is ","are ","does ","do ","can ","should ","what is ","what are ","why is ","why are ","how does ","how do ","how safe ","is it safe","tell me about","explain","which is better","which is safer","which works"].some(e=>l.startsWith(e)),v=["moisturiser","moisturizer","serum","sunscreen","spf","face wash","cleanser","toner","cream","lotion","gel","oil","mask","sheet mask","eye cream","lip balm","shampoo","conditioner","body wash","scrub","exfoliant","primer","foundation","bb cream","cc cream","micellar","mist","essence","ampoule","retinol","vitamin c","niacinamide","aha","bha","face cream"].some(e=>l.includes(e)),b=["ponds","pond's","lakme","mamaearth","minimalist","cetaphil","cerave","the ordinary","dot & key","plum","wow","biotique","himalaya","neutrogena","loreal","l'oreal","olay","nivea","garnier","vaseline","dove","clinic plus","head & shoulders","pantene","sunsilk","tresemme","fiama","santoor","vicco","shahnaz","forest essentials","kama ayurveda","beardo","man matters","sugar","nykaa","mcaffeine","re'equil","fixderma","cosdna","cosrx","innisfree","the face shop","etude","klairs","pyunkang yul","some by mi","dermalogica","paula's choice","la roche-posay","vichy","avene","eucerin","aveeno","bulldog","jack black","supergoop","tatcha","drunk elephant","beauty of joseon","anua","isntree","torriden","skin1004"].some(e=>l.includes(e)),w=/\d+%/.test(l)||l.split(" ").filter(e=>/^[A-Z]/.test(e)).length>=2||v||b,(!f||w)&&(!d||w||m(s)))?"product":"question",D=!L&&"question"===_,P=!L&&!D&&"comparison"===_,M=P?i.COMPARISON_SYSTEM_PROMPT:D?i.EXPERT_ANSWER_SYSTEM_PROMPT:i.CLEAN_SHEET_SYSTEM_PROMPT;if(L){let e="";try{e=new URL(L).hostname}catch{}x=`The user submitted a product page URL: ${L}

This is a beauty/personal care product page URL. You MUST produce a full scorecard, never return {"type":"out_of_scope"} for a product URL. If you cannot find INCI data, score Full Ingredient Disclosure at 0, note it as unavailable, cap the total score at 50, and complete all other pillars with whatever data you can find.

Below is scraped content from that page. E-commerce pages render most content (ingredients, test certificates, lab PDFs) via JavaScript which the scraper CANNOT capture. Treat the scraped content as a partial snapshot only.

RESEARCH PROTOCOL for this URL:
1. Use scraped content to identify product name and brand.
2. Search externally for the full INCI: incidecoder.com, openbeautyfacts.org, amazon.in, nykaa.com, brand website.
3. Search for price and reviews.
4. Search for lab tests and certifications directly on the brand website: site:${e} lab OR test OR certificate OR study. Also search "[brand name] lab test certificate" and "[brand name] clinical study". Award transparency marks only for evidence you actually locate (a study, certificate, registry entry, or published data). A marketing mention of "tested" is a claim, not evidence — do not treat it as confirmation.
5. If the scraper missed JavaScript-rendered content, note data gaps honestly in pillar notes rather than assuming either presence or absence of evidence.
${I(t)}
Scraped page content (partial — JavaScript-rendered sections will be missing):
${E}`}else x=P?`Compare these two products: ${R}`:D?R:`Analyze this product: ${R}${I(t)}`;let U=await (0,a.generateResilient)(M,x);if(!U)return{type:"out_of_scope"};if(D){let e=y(U);return e?.type==="out_of_scope"?{type:"out_of_scope"}:e?.type==="answer"?{type:"answer",answer:e}:{type:"answer",answer:{type:"answer",question:R,verdict:"info",verdictLabel:"Information",text:U,keyPoints:[],indiaContext:"",chatOpener:""}}}let F=y(U);if(L&&(!F||"out_of_scope"===F.type||!S(F))){let e=[function(e){try{return new URL(e).hostname.replace(/^www\./,"").split(".")[0].replace(/^(discover|get|shop|try|buy|use|my)/,"").trim()}catch{return""}}(L),g(L)].filter(Boolean).join(" ");if(!e)return{type:"out_of_scope"};{let i=y(await (0,a.generateResilient)(M,`Analyze this beauty/cosmetic product (this is definitely a beauty product — lipstick, skincare, makeup, personal care — do NOT return out_of_scope): ${e}${I(t)}`));if(!(i&&"out_of_scope"!==i.type&&S(i)))return{type:"out_of_scope"};F=i}}if(!P&&!D&&!L&&(!F||"out_of_scope"===F.type||!S(F)))try{let e=await (0,a.generateResilient)(M,`You are analyzing a beauty/personal care product. This is definitely a beauty product, do NOT return out_of_scope. Search the web for the full INCI list and scoring data, then return the complete JSON scorecard.

Analyze this product: ${R}${I(t)}`),i=y(e);i&&"out_of_scope"!==i.type&&S(i)&&(F=i)}catch{}if(!F||"out_of_scope"===F.type)return{type:"out_of_scope"};if(P&&"comparison"===F.type&&F.productA&&F.productB)return F.productA=c(F.productA),F.productB=c(F.productB),{type:"comparison",comparison:F};if(!S(F))return{type:"out_of_scope"};let $=c(F,t),q=(C=$.score>=75,A=t?t.verdictCounts?.not_permitted??0:null,T=[{id:"formula",label:"Formula safety",passed:C,detail:C?"Six-pillar assessment cleared The Clean Sheet bar":"Six-pillar assessment fell below the bar — the pillar notes explain where"},{id:"lawful_claims",label:"Lawful claims",passed:N=t?0===A:null,detail:null===N?"Claim check unavailable for this run":N?"No prohibited claims on the label":`${A} prohibited claim${1===A?"":"s"} found (drug claims or banned marketing language)`},{id:"honest_claims",label:"Honest marketing",passed:O=t?(t.integrityScore??0)>=45:null,detail:null===O?"Claim check unavailable for this run":O?"Marketing claims are substantially supported by evidence":"Most marketing claims could not be supported by public evidence"}],{status:C&&!0===N&&!0===O?"verified":(null===N||null===O)&&C?"provisional":"not_verified",gates:T,standard:`${r} \xb7 three gates, all required`});return await k($,q,t),{type:"single",scorecard:$,verdict:q}}e.s(["compactClaimFindings",0,function(e){return e&&"claim_check"===e.type&&Array.isArray(e.claims)?{claims:e.claims,verdictCounts:e.verdictCounts,integrityScore:e.integrityScore,imageUrl:"string"==typeof e.imageUrl?e.imageUrl:null}:null},"runClaimCheck",0,C,"runDeepScan",0,A],9359)}];

//# sourceMappingURL=src_lib_review-engine_ts_1zl84x5._.js.map