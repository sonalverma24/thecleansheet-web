import Link from "next/link";
import type { PackagingProduct, SupplierOffering } from "@/data/packaging/types";
import { BRANDING_LABELS, MOQ_SCOPE_LABELS, SAMPLE_LABELS, STOCK_LABELS } from "@/data/packaging/labels";
import { MATERIAL_LABELS } from "@/data/packaging/families";
import { DISPLAY_FONT } from "@/components/directory/ui";

/** The attributes of a variant worth showing, skipping anything not recorded. */
export function variantSpecs(p: PackagingProduct): string[] {
  const out: string[] = [];
  if (p.capacity) out.push(`${p.capacity.value} ${p.capacity.unit}`);
  out.push(p.materialDetail ? `${MATERIAL_LABELS[p.material]} (${p.materialDetail})` : MATERIAL_LABELS[p.material]);
  out.push(p.containerStyle);
  out.push(p.closure);
  if (p.neckFinish) out.push(`Neck ${p.neckFinish}`);
  if (p.pumpOutputMl) out.push(`${p.pumpOutputMl} ml per pump`);
  if (p.childResistant) out.push("Child resistant");
  if (p.tamperEvident) out.push("Tamper evident");
  if (p.pcrPercent) out.push(`${p.pcrPercent}% PCR`);
  if (p.dimensionsMm) out.push(`${p.dimensionsMm.length} x ${p.dimensionsMm.width} x ${p.dimensionsMm.height} mm`);
  return out;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase text-ink-500" style={{ letterSpacing: "0.08em" }}>{label}</dt>
      <dd className="mt-0.5 text-sm text-ink-900">{children}</dd>
    </div>
  );
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** One supplier's offering of one variant. Unknown values read "To confirm" and
    are never defaulted to something favourable. */
export default function OfferingCard({
  product, offering, supplierName, supplierHref, verification,
}: {
  product: PackagingProduct;
  offering: SupplierOffering;
  supplierName?: string;
  supplierHref?: string;
  /** Plain-language verification summary for the supplier. */
  verification?: string;
}) {
  const moq = offering.moqPieces === null
    ? "To confirm"
    : `${offering.moqPieces.toLocaleString("en-IN")} pieces, ${MOQ_SCOPE_LABELS[offering.moqScope]}`;

  return (
    <article className="rounded-2xl border border-ink-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{product.name}</h3>
          {supplierName && (
            <p className="mt-0.5 text-sm text-ink-700">
              {supplierHref ? <Link href={supplierHref} className="text-teal-700 underline-offset-2 hover:underline">{supplierName}</Link> : supplierName}
            </p>
          )}
        </div>
        {verification && <p className="rounded-full bg-ink-50 px-3 py-1 text-[11px] text-ink-700">{verification}</p>}
      </div>

      <p className="mt-2 text-[13px] text-ink-700">{variantSpecs(product).join("  |  ")}</p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Fact label="MOQ for stock">{moq}</Fact>
        <Fact label="Supply">{STOCK_LABELS[offering.stock]}</Fact>
        <Fact label="Samples">{SAMPLE_LABELS[offering.samples]}</Fact>
        <Fact label="Lead time">
          {offering.leadTimeDays ? `${offering.leadTimeDays.min} to ${offering.leadTimeDays.max} days` : "To confirm"}
        </Fact>
        <Fact label="Repeat supply">
          {offering.repeatSupplyConfirmed === null ? "Not yet asked" : offering.repeatSupplyConfirmed ? "Same components confirmed" : "Not guaranteed"}
        </Fact>
        <Fact label="Price">
          {offering.price
            ? `Rs ${offering.price.perPieceInr.min}${offering.price.perPieceInr.max ? ` to ${offering.price.perPieceInr.max}` : ""} per piece at ${offering.price.atQuantity.toLocaleString("en-IN")}, quoted ${fmtDate(offering.price.quotedOn)}${offering.price.gstIncluded ? ", GST included" : ", excl. GST"}`
            : "To confirm"}
        </Fact>
        <Fact label="Branding">
          <span className="flex flex-wrap gap-1">
            {offering.branding.map((b) => (
              <span key={b} className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] text-teal-800">{BRANDING_LABELS[b]}</span>
            ))}
          </span>
        </Fact>
        {offering.paymentTerms && <Fact label="Payment terms">{offering.paymentTerms}</Fact>}
      </dl>

      {offering.note && <p className="mt-3 text-[13px] text-ink-700">{offering.note}</p>}
      {offering.termsConfirmedOn && (
        <p className="mt-3 text-[11px] text-ink-500">Terms confirmed with the supplier on {fmtDate(offering.termsConfirmedOn)}. Prices and MOQs change, so confirm before ordering.</p>
      )}
    </article>
  );
}
