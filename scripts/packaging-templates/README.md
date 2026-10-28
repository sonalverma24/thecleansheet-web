# Packaging directory spreadsheet

Four blank CSV templates for the sourcing directory pilot. Each has the header row
and one commented example row (first cell starts with `#`, the text says
`FAKE EXAMPLE`). Comment rows and empty rows are ignored on import. An example row
that is un-commented by mistake is rejected, so it can never ship.

## Workflow

1. Copy the four files into a working folder outside the repo (for example a shared
   Google Sheet with four tabs, one per file).
2. Fill the rows. Real suppliers and real data only: if you do not know a value,
   leave the cell blank.
3. Export each tab as CSV (comma separated, UTF-8) with the exact file names
   `suppliers.csv`, `products.csv`, `offerings.csv`, `verifications.csv`.
4. Check, then import:

```bash
npx tsx --tsconfig tsconfig.json scripts/packaging-import.mts <folder> --check
npx tsx --tsconfig tsconfig.json scripts/packaging-import.mts <folder>
```

The import REPLACES the four files in `src/data/packaging/`. The spreadsheet is the
source of truth, so keep it and re-export after every change. Nothing is written
unless every row in all four files is valid. Problems are listed as
`file row N, column "name": what is wrong`, with the row numbered as the
spreadsheet shows it (header = row 1).

A record type with no rows yet is fine: keep the file with just its header row.

## Entering data

- Type every column in plain text. Spreadsheets love to reformat: set the columns to
  plain text before typing dates (`2026-10-15`, always year-month-day) and sizes such
  as `18/415`.
- Numbers are digits only: `100000`, not `1,00,000`, `Rs 10` or `500 pcs`.
- Yes or no cells accept `yes`/`no` (or `true`/`false`).
- Lists (branding) are separated with `;`.
- No em dashes. Use a hyphen, a colon, or reword.
- Ids you choose (`id`, and the `supplierId`, `productId`, `offeringId`, `familyId`
  that point at them) must be unique within their file, with no spaces. Suppliers need
  a lowercase `slug` (used in the web address).

## What a blank means

| Column | Blank means |
| --- | --- |
| `moqPieces` and `moqScope` | MOQ not confirmed (shown as "to confirm"). Leave both blank. If you give a MOQ you must say what it covers. |
| `repeatSupplyConfirmed` | Not asked yet. Never enter `yes` unless the supplier confirmed it, and add a `repeat-supply-confirmation` row in verifications.csv. |
| `stock`, `samples` | Unconfirmed |
| `childResistant`, `tamperEvident` | Unknown (not "no") |
| price columns | No quote. Fill `priceMinInr`, `priceAtQuantity`, `priceQuotedOn` and `priceGstIncluded` together. |
| contact columns | No public contact. If filled, `contactAgreedPublic` must be `yes` and the supplier must really have agreed. |

## suppliers.csv

| Column | Notes |
| --- | --- |
| `id`, `slug`, `name`, `city`, `state`, `listedOn` | Required. `listedOn` is the date the record was added. |
| `businessType` | `manufacturer`, `decorator-converter`, `distributor`, `trader` |
| `website` | Starts with `https://` |
| `yearEstablished`, `about` | Optional. `about` is a short factual description in our words. |
| `credentials` | Optional. Entries separated by `;`, each `kind` then optional `\|` parts. Kinds: `iso-9001`, `iso-22716`, `gmp`, `fssc-22000`, `other`. Parts: `verified`, `ref=<number>`, `label=<text>` (`other` needs a label). Example: `iso-9001\|verified\|ref=ABC-123; other\|label=Halal board` |
| `contactPerson`, `contactEmail`, `contactPhone`, `contactAgreedPublic` | See the table above |
| `eprStatus` | `registered`, `exempt-claimed`, `not-provided`, `not-applicable`, or blank |
| `eprReference`, `eprCheckedOn`, `eprNote` | Need `eprStatus`. `eprCheckedOn` needs an `epr-information` row in verifications.csv. |

`verified` on a credential is only accepted if verifications.csv has a row for that
supplier with `evidence` = `certificate` and `outcome` = `confirmed`.

## products.csv

One row per specific variant (capacity + material + style + closure).

| Column | Notes |
| --- | --- |
| `id`, `familyId`, `name`, `material`, `containerStyle`, `closure` | Required. `familyId` is one of the 20 ids in `src/data/packaging/families.ts`. |
| `material` | `glass`, `plastic`, `metal`, `paperboard`, `other` |
| `capacityValue`, `capacityUnit` | Both or neither. Unit is `ml` or `g`. |
| `pcrPercent` | 0 to 100 |
| `lengthMm`, `widthMm`, `heightMm` | All three or none |

## offerings.csv

Which supplier sells which variant. One row per supplier and variant.

| Column | Notes |
| --- | --- |
| `id`, `supplierId`, `productId`, `branding` | Required. |
| `branding` | One or more of `plain-stock`, `label-ready`, `printed-decorated`, `custom-mould-colour`, separated by `;` |
| `moqScope` | `complete-assembly`, `container-only`, `closure-only` (or blank with a blank MOQ) |
| `stock` | `ex-stock`, `made-to-order`, `both`, `unconfirmed` |
| `samples` | `free`, `paid`, `on-request`, `none`, `unconfirmed` |
| `leadTimeMinDays`, `leadTimeMaxDays` | Both or neither |
| `priceMinInr`, `priceMaxInr`, `priceAtQuantity`, `priceQuotedOn`, `priceGstIncluded` | Per piece, in rupees, for the stated quantity on the stated date |
| `termsConfirmedOn` | Date the commercial terms were last confirmed |

## verifications.csv

Evidence that was checked. `scope`, `limitations` and `reviewer` are required on every
row: say exactly what was covered, what the check does NOT show, and who reviewed it.

| Column | Notes |
| --- | --- |
| `evidence` | `material-identification`, `technical-drawing`, `closure-specification`, `certificate`, `tolerance-data`, `compatibility-documentation`, `price-quote`, `moq-confirmation`, `repeat-supply-confirmation`, `lead-time-confirmation`, `leak-test-protocol`, `batch-consistency-controls`, `sample-tested`, `complaints-procedure`, `client-reference`, `epr-information` |
| `source` | `supplier-provided`, `public-register`, `tcs-tested`, `client-reported` |
| `outcome` | `confirmed`, `partly-confirmed`, `not-provided`, `contradicted` |
| `offeringId` | Optional. Set when the evidence is about one offering rather than the company. |
| `checkedOn` | Date the evidence was checked (not in the future) |
| `validUntil` | Optional. Date after which it should be re-checked. |
