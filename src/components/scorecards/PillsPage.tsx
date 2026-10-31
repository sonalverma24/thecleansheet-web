/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · The pills page

   The product page in the design's order:
     PillsHero   the product and the take, at a glance and fit, the summary and where to buy, In India, key ingredients, independence
     here        claim check, regulatory check and ingredients, the detail, gaps and the cheat code, how to use it, the questions, the footer note

   DESIGN ONLY: the pill, the confidence and every sentence come from src/lib/pills-page.ts, which is built from the decision core. Nothing here
   decides, scores or looks anything up.

   Rendered only when ANALYSER_PILLS_PAGE is on and the product has a stored review. Server component: every opening row is a native <details>, so
   the page needs no client script (the one link that also opens a row is its own small client component).
──────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import Link from "next/link";
import { Check, Lightbulb, X } from "lucide-react";
import type { Brand, ProductScorecard } from "@/data/brands/types";
import type { Authority } from "@/lib/analyser-x";
import { isNotHeldNote, type PillsPageModel } from "@/lib/pills-page";
import { ingredientHref, type IngredientConcern } from "@/lib/ingredient-concerns";
import { OpenDetailsLink } from "./OpenDetailsLink";
import { PillsHero } from "./PillsHero";
import { Band, Chev } from "./pills-ui";
import { RatingKey } from "./RatingKey";
import { MARKER_COLOURS, type MarkerName } from "./pill-palette";

const FLAG_DOT: Record<"ok" | "warn" | "info", string> = { ok: MARKER_COLOURS.green.ring, warn: MARKER_COLOURS.red.ring, info: MARKER_COLOURS.yellow.ring };
/** The dot of an ingredient we hold no row for and have no flag on: neutral, never the green of "no concern". */
const UNRATED_DOT = "#d9d4cc";
/** The colour of a finding that names an ingredient, as a dot: the same red and yellow the section's rating uses. */
const CONCERN_DOT: Record<IngredientConcern["tone"], string> = { red: MARKER_COLOURS.red.ring, yellow: MARKER_COLOURS.yellow.ring };
const DOT_RANK = (colour: string): number => (colour === FLAG_DOT.warn ? 2 : colour === FLAG_DOT.info ? 1 : 0);
/** How each claim decision shows: one of the three markers (the data-marker values of pills-page.css). */
const CLAIM_MARKER: Record<string, MarkerName> = { "Publicly supported": "green", "Needs proof": "yellow", "Not publicly supported": "red" };
const SEGMENT: Record<string, "y" | "n" | "u"> = { "Publicly supported": "y", "Needs proof": "n", "Not publicly supported": "u" };

/** The short name of each authority, for its chip. The panel carries the full name, shown beside its detail. */
const AUTHORITY_CHIP: Record<Authority, string> = { EU: "EU", IN: "India", US: "US", KR: "South Korea", AU: "Australia", CA: "Canada" };

const AUTHORITIES_10 = [
  { key: "eu_1223_2009", label: "EU 1223/2009" }, { key: "india_cr_2020", label: "India CR 2020" }, { key: "health_canada_hotlist", label: "Health Canada Hotlist" },
  { key: "us_fda_21cfr", label: "US FDA 21 CFR" }, { key: "korea_mfds", label: "MFDS Korea" }, { key: "echa_svhc", label: "ECHA SVHC" }, { key: "iarc", label: "IARC" },
  { key: "aicis_australia", label: "AICIS Australia" }, { key: "tga_australia", label: "TGA Australia" }, { key: "canada_nhpid", label: "Canada NHPID" },
] as const;

/** A section heading in the design's style: a Cooper BT title, a little larger on a larger screen. */
function Heading({ id, children, hint }: { id?: string; children: ReactNode; hint?: string }) {
  return (
    <>
      <h2 id={id} className="pp-serif text-[22px] sm:text-[26px] leading-[1.15] text-[#282828]">{children}</h2>
      {hint && <p className="text-[13.5px] sm:text-[14.5px] leading-[1.5] sm:leading-[1.55] text-[#55504d] pb-1 sm:pb-0">{hint}</p>}
    </>
  );
}

/** A card with a title and a one-line summary that opens to the full detail. */
function CheckCard({ id, title, oneLiner, children }: { id: string; title: string; oneLiner: string; children: ReactNode }) {
  return (
    <div id={id} className="pp-card scroll-mt-28">
      <details>
        <summary className="pp-sum flex items-start justify-between gap-3 pl-[18px] pr-3.5 py-3.5 rounded-[18px]">
          <span className="flex flex-col gap-[3px] min-w-0">
            <h2 className="pp-serif text-xl leading-[1.2] text-[#282828]">{title}</h2>
            <span className="text-[14.5px] leading-[1.45] text-[#3f3b39]">{oneLiner}</span>
          </span>
          <Chev />
        </summary>
        <div className="flex flex-col gap-2.5 px-[18px] pb-[18px]">{children}</div>
      </details>
    </div>
  );
}

function ClaimCheckBody({ product }: { product: ProductScorecard }) {
  const claims = product.claimsCheck ?? [];
  if (!claims.length) return <p className="text-sm leading-[1.5] text-[#282828]">We found no marketing claims to check.</p>;
  const count = (decision: string) => claims.filter((c) => c.decision === decision).length;
  const supported = count("Publicly supported");
  const unsupported = count("Not publicly supported");
  const needProof = claims.length - supported - unsupported;
  const legend: { k: "y" | "n" | "u"; n: number; text: string }[] = [
    { k: "y", n: supported, text: "publicly supported" }, { k: "n", n: needProof, text: "need proof" }, { k: "u", n: unsupported, text: "not publicly supported" },
  ];
  return (
    <>
      <div className="flex gap-1" role="img" aria-label={`${supported} of ${claims.length} claims publicly supported`}>
        {claims.map((c, i) => <span key={i} className="pp-seg" data-k={SEGMENT[c.decision] ?? "n"} />)}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-[#55504d]">
        {legend.filter((l) => l.n > 0).map((l) => (
          <span key={l.k} className="inline-flex items-center gap-[7px]">
            <span aria-hidden className="pp-seg" data-k={l.k} style={{ flex: "none", width: 12, height: 7 }} />{l.n} {l.text}
          </span>
        ))}
      </div>
      {product.regulatoryFlags && product.regulatoryFlags.length > 0 && (
        <div className="border-t border-[#f1ece3] pt-2.5">
          <h3 className="pp-eyebrow text-[#55504d] mb-1.5">Advertising rules in India (ASCI and the drug-cosmetic boundary)</h3>
          <ul className="flex flex-col gap-1.5">
            {product.regulatoryFlags.map((f) => (
              <li key={f.claim} className="text-sm leading-[1.5] text-[#282828]">
                <strong className="font-semibold text-[#94521a]">Flagged.</strong> {f.claim}
                {f.note ? <span className="block text-[13px] text-[#55504d]">{f.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Every row on the page starts closed. Opening Claim check shows the bar above; each claim, with its decision and reason, is one row further in. */}
      <details className="border-t border-[#f1ece3]">
        <summary className="pp-sum flex items-center justify-between gap-3 pt-2.5 text-sm font-medium text-[#1d6761]">
          <span>Each claim, one by one ({claims.length})</span>
          <Chev size={30} />
        </summary>
        <ul className="pt-1">
          {claims.map((c) => (
            <li key={c.claim} className="py-2.5 border-b border-[#f1ece3] last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm leading-[1.5] text-[#282828]">{c.claim}</span>
                <span className="pp-rate flex-none" data-marker={CLAIM_MARKER[c.decision] ?? "yellow"}>{c.decision}</span>
              </div>
              {c.note && <p className="mt-1 text-[13px] leading-[1.5] text-[#55504d]">{c.note}</p>}
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}

function RegulatoryBody({ product, model }: { product: ProductScorecard; model: PillsPageModel }) {
  const panel = model.regulatoryCheck.panel;
  return (
    <>
      {panel && (
        <>
          <ul className="flex flex-wrap gap-1.5">
            {panel.authorities.map((a) => {
              const falls = a.result === "Falls short";
              const Icon = falls ? X : Check;
              return (
                <li key={a.id} className="pp-chip" data-tone={falls ? "no" : "ok"}>
                  <span aria-hidden className="pp-chip__ic"><Icon size={falls ? 11 : 12} strokeWidth={3} /></span>
                  {AUTHORITY_CHIP[a.id]}<span className="sr-only"> ({a.result.toLowerCase()})</span>
                </li>
              );
            })}
          </ul>
          <ul className="flex flex-col gap-2 border-t border-[#f1ece3] pt-2.5">
            {panel.authorities.map((a) => (
              <li key={a.id} className="text-sm leading-[1.5] text-[#282828]">
                <strong className="font-semibold">{a.label}</strong> <span className="text-[#55504d]">· {a.result}. {a.detail}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {product.globalScreen && panel && (
        <div className="border-t border-[#f1ece3] pt-2.5">
          <h3 className="pp-eyebrow text-[#55504d] mb-1.5">The wider screen: ten authorities and lists</h3>
          <ul className="flex flex-col gap-1.5">
            {AUTHORITIES_10.map(({ key, label }) => {
              const v = product.globalScreen![key as keyof typeof product.globalScreen] ?? "";
              return v ? <li key={key} className="text-sm leading-[1.5] text-[#282828]">{label}<span className="block text-[13px] text-[#55504d]">{v}</span></li> : null;
            })}
          </ul>
        </div>
      )}
      <p className="text-[12.5px] leading-[1.5] text-[#55504d]">Checked against the ingredient list as declared. It is not a substitute for a full regulatory assessment.</p>
    </>
  );
}

/** An ingredient's name, as a link to its own page when the safety screen resolved it to one, else as plain text. */
function IngredientName({ name }: { name: string }) {
  const href = ingredientHref(name);
  return href
    ? <Link href={href} className="text-sm text-[#282828] break-words underline decoration-[#d9d4cc] underline-offset-[3px] hover:decoration-[#248179] hover:text-[#1d6761]">{name}</Link>
    : <span className="text-sm text-[#282828] break-words">{name}</span>;
}

function IngredientsBody({ product, keyActives, concerns }: { product: ProductScorecard; keyActives: string[]; concerns: IngredientConcern[] }) {
  if (!product.ingredients.length) return <p className="text-sm leading-[1.5] text-[#282828]">We have no ingredient list for this product yet.</p>;
  const named = new Map(concerns.map((c) => [c.index, c]));
  // The ones to look at first: what the Ingredient safety line names (red or yellow, as that line has it), the key actives, then any other ingredient with a
  // flag on it. Each jumps to its row. Then the whole list, in label order.
  const flagged = product.ingredients.map((i, index) => ({ i, index })).filter(({ i, index }) => i.flag !== "ok" && !named.has(index));
  return (
    <>
      <ul className="flex flex-wrap gap-1.5" aria-label="Key and flagged ingredients">
        {concerns.map((c) => (
          <li key={`named-${c.index}`}>
            <a href={`#ing-${c.index}`} className="pp-pill" title={c.tags.join(" · ")} data-tone={c.tone === "red" ? "red" : "amber"}>{c.name}</a>
          </li>
        ))}
        {keyActives.map((n) => {
          const href = ingredientHref(n);
          return <li key={`key-${n}`} className={href ? undefined : "pp-pill"}>{href ? <Link href={href} className="pp-pill">{n}</Link> : n}</li>;
        })}
        {flagged.map(({ i, index }) => (
          <li key={`flag-${index}`}>
            <a href={`#ing-${index}`} className="pp-pill" data-tone={i.flag === "warn" ? "red" : "amber"}>{i.name}</a>
          </li>
        ))}
      </ul>
      <ul data-list="ingredients" className="border-t border-[#f1ece3] pt-1">
        {product.ingredients.map((i, index) => {
          // An ingredient we hold no row for shows just its name: no generic note, and a neutral dot instead of the green one.
          const unrated = i.flag === "ok" && isNotHeldNote(i.note);
          const note = isNotHeldNote(i.note) ? "" : i.note;
          // A row the Ingredient safety findings name takes their colour, unless the database already flags it harder: the dot is never softer than either.
          const own = unrated ? UNRATED_DOT : FLAG_DOT[i.flag];
          const concern = named.get(index);
          const dot = concern && DOT_RANK(CONCERN_DOT[concern.tone]) > DOT_RANK(own) ? CONCERN_DOT[concern.tone] : own;
          return (
            <li key={index} id={`ing-${index}`} className="scroll-mt-28 flex items-start gap-2.5 py-2 border-b border-[#f1ece3] last:border-b-0">
              <span aria-hidden className="mt-[7px] w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
              <span className="min-w-0">
                <IngredientName name={i.name} />
                {concern ? <span className="block mt-1"><span className="pp-rate" data-wrap data-marker={concern.tone}>{concern.tags.join(" · ") || "Flagged in Ingredient safety"}</span></span> : null}
                {note ? <span className="block text-[13px] leading-[1.45] text-[#55504d]">{note}</span> : null}
                <span className="sr-only">
                  {concern ? ` (${concern.tone === "red" ? "concern" : "worth noting"} in Ingredient safety${concern.tags.length ? `: ${concern.tags.join(", ")}` : ""})` : i.flag === "warn" ? " (caution)" : i.flag === "info" ? " (worth noting)" : unrated ? " (not rated)" : " (no concern)"}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function PillsPage({ product, brand, model }: { product: ProductScorecard; brand: Brand; model: PillsPageModel }) {
  const how = model.howToUse
    ? ([["Where it fits", model.howToUse.routine], ["Layering", model.howToUse.layering], ["What to expect now", model.howToUse.expect], ["Over time", model.howToUse.later]] as const).filter(([, v]) => v)
    : [];
  const mid = Math.ceil(model.faq.length / 2);
  const faqColumns = [model.faq.slice(0, mid), model.faq.slice(mid)].filter((c) => c.length > 0);

  return (
    <div className="pp bg-white min-h-screen pb-9">
      <PillsHero product={product} brand={brand} model={model} />

      {/* Claim check, regulatory check and the ingredients: three cards, each a line that opens to the detail */}
      <Band className="pt-6" innerClassName="grid gap-2 sm:gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start">
        <CheckCard id="claim-check" title="Claim check" oneLiner={model.claimCheck.oneLiner}>
          <ClaimCheckBody product={product} />
        </CheckCard>
        <CheckCard id="regulatory-check" title="Regulatory check" oneLiner={model.regulatoryCheck.oneLiner}>
          <RegulatoryBody product={product} model={model} />
        </CheckCard>
        <CheckCard id="ingredients" title="Ingredients" oneLiner={`${product.ingredients.length} ingredients, in label order.`}>
          <IngredientsBody product={product} keyActives={model.keyActives} concerns={model.ingredientConcerns} />
        </CheckCard>
      </Band>

      {/* The detail: how we read the product across five areas. null when there is nothing to rate (a medicine, or a page we could not read). */}
      {model.details && (
        <Band id="details" className="pt-7 sm:pt-11" innerClassName="flex flex-wrap items-start gap-x-12 gap-y-2 sm:gap-y-5">
          <div className="flex-[0_1_280px] min-w-[min(100%,240px)] flex flex-col gap-2">
            <Heading hint="How we read this product across five areas. Open any row for the full reasoning.">The detail</Heading>
          </div>
          <div className="flex-[1_1_600px] min-w-0 flex flex-col gap-2">
            {model.details.map((d) => (
              <details key={d.n} className="pp-card">
                <summary className="pp-sum flex flex-col gap-[5px] pl-4 sm:pl-[18px] pr-3 pt-3 pb-[13px] rounded-[18px]">
                  <span className="flex items-center gap-2 sm:gap-2.5 w-full">
                    <span aria-hidden className="flex-none text-[11.5px] sm:text-xs font-medium text-[#55504d] tabular-nums">{d.n}</span>
                    <h3 className="pp-serif flex-1 min-w-0 text-[17px] sm:text-xl leading-[1.2] text-[#282828]">{d.title}</h3>
                    <span className="pp-rate" data-marker={d.rating.marker ?? "none"}>{d.rating.word}</span>
                    <Chev size={30} />
                  </span>
                  <span className="text-sm sm:text-[14.5px] leading-[1.5] text-[#3f3b39] pr-1 sm:pr-[42px]">{d.oneLiner}</span>
                  {d.named?.length ? (
                    <ul aria-label="Ingredients named in this line" className="flex flex-wrap gap-1.5 pt-0.5 pr-1 sm:pr-[42px]">
                      {d.named.slice(0, 6).map((c) => <li key={c.index} className="pp-pill" title={c.tags.join(" · ")} data-tone={c.tone === "red" ? "red" : "amber"}>{c.name}</li>)}
                      {d.named.length > 6 ? <li className="pp-pill" data-tone="plain">+{d.named.length - 6} more</li> : null}
                    </ul>
                  ) : null}
                </summary>
                <div className="mx-4 sm:mx-[18px] pt-2.5 pb-3.5 border-t border-dashed border-[#e8e1d6] flex flex-col gap-2 text-sm sm:text-[14.5px] leading-[1.5] text-[#282828]">
                  {d.named?.length ? (
                    <p className="text-[13px] leading-[1.5] text-[#55504d]">
                      Find {d.named.length === 1 ? "it" : "them"} in the ingredient list:{" "}
                      {d.named.map((c, k) => (
                        <span key={c.index}>
                          {k > 0 ? ", " : null}
                          <OpenDetailsLink targetId="ingredients" rowId={`ing-${c.index}`} className="font-medium text-[#1d6761] underline underline-offset-[3px]">{c.name}</OpenDetailsLink>
                          {c.tags.length ? ` (${c.tags.join(" · ")})` : null}
                        </span>
                      ))}
                    </p>
                  ) : null}
                  {d.body.length ? d.body.map((b) => <p key={b}>{b}</p>) : <p>No more detail beyond the line above.</p>}
                </div>
              </details>
            ))}
          </div>
        </Band>
      )}

      {/* Gaps, and the cheat code beside them */}
      {(model.gaps.length > 0 || model.cheatCode) && (
        <Band id="gaps" className="pt-7 sm:pt-11" innerClassName="flex flex-col gap-2.5 sm:gap-3">
          {model.gaps.length > 0 && <h2 className="pp-serif text-xl sm:text-2xl leading-[1.2] text-[#282828]">Gaps, and what would strengthen this analysis</h2>}
          <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] items-stretch">
            {model.gaps.length > 0 && (
              <div className="pp-card flex items-center px-5 py-4">
                <ul className="flex flex-col gap-2.5 text-[15px] leading-[1.45] text-[#282828]">
                  {model.gaps.map((g) => (
                    <li key={g} className="flex items-start gap-[11px]">
                      <span aria-hidden className="flex-none w-2.5 h-2.5 mt-1.5 rounded-full border-2 border-[#b97a3c]" />{g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {model.cheatCode && (
              <aside id="cheat-code" className="flex flex-col gap-2 bg-[#f0f6f6] border border-[#cae1df] rounded-[18px] px-5 py-4">
                <div className="flex items-center gap-2.5 text-[#1d6761]">
                  <Lightbulb aria-hidden size={22} strokeWidth={1.7} />
                  <h3 className="pp-serif text-xl">{model.cheatCode.title}</h3>
                </div>
                <p className="text-base sm:text-[17px] leading-[1.5] text-[#282828] text-pretty">{model.cheatCode.text}</p>
              </aside>
            )}
          </div>
        </Band>
      )}

      {/* How to use it well */}
      {how.length > 0 && (
        <Band id="how-to-use" className="pt-7 sm:pt-11" innerClassName="flex flex-col gap-2.5 sm:gap-3">
          <Heading>How to use it well</Heading>
          <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] items-stretch">
            {how.map(([k, v]) => (
              <div key={k} className="pp-card flex flex-col gap-1.5 px-[18px] py-4">
                <h3 className="pp-serif text-lg leading-[1.3] text-[#1d6761]">{k}</h3>
                <p className="text-[14.5px] leading-[1.55] text-[#282828]">{v}</p>
              </div>
            ))}
          </div>
        </Band>
      )}

      {/* Questions people ask */}
      {model.faq.length > 0 && (
        <Band id="faq" className="pt-7 sm:pt-11" innerClassName="flex flex-col gap-2.5 sm:gap-3">
          <Heading>Questions people ask</Heading>
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            {faqColumns.map((col, c) => (
              <div key={c} className="flex-[1_1_480px] min-w-0 flex flex-col gap-2">
                {col.map((f) => (
                  <details key={f.q} className="pp-card rounded-2xl">
                    <summary className="pp-sum flex items-center justify-between gap-3 min-h-[52px] py-2 pl-[18px] pr-2.5 rounded-2xl">
                      <h3 className="pp-serif text-[17px] leading-[1.3] text-[#282828]">{f.q}</h3>
                      <Chev />
                    </summary>
                    <p className="px-[18px] pb-3.5 text-[14.5px] leading-[1.55] text-[#3f3b39]">{f.a}</p>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </Band>
      )}

      {/* The key to the rating the take card shows (the owner's design, set very small): what each of the four colours means */}
      <Band className="pt-7 sm:pt-9">
        <RatingKey />
      </Band>

      <Band className="pt-3 sm:pt-4">
        <footer className="flex flex-col gap-1.5 border-t border-[#e8e1d6] pt-[18px] text-[13px] leading-[1.6] text-[#55504d]">
          <p>This is an independent analysis of publicly available information. It is not medical advice.</p>
          <p>
            Found a mistake? <Link href="/contact" className="text-[#1d6761] underline underline-offset-[3px]">Report a problem</Link> so we can check the exact rule and the exact source.
          </p>
        </footer>
      </Band>
    </div>
  );
}
