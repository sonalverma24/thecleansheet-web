import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Shield,
  Sun,
  FlaskConical,
  Building2,
  Leaf,
  Scale,
  Fingerprint,
  Globe,
  QrCode,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  Download,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Certification for Brands | The Clean Sheet",
  description:
    "Turn product quality into provable trust. Independent certification for skincare, suncare, and personal care brands in India.",
  robots: { index: false, follow: false },
};

/* ── Stat card ──────────────────────────────────────────── */
function Stat({ value, label, source }: { value: string; label: string; source: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-3xl sm:text-4xl font-medium text-teal-700 tracking-tight leading-none mb-2">
        {value}
      </span>
      <span className="text-sm text-ink-700 leading-snug mb-1">{label}</span>
      <span className="text-[10px] text-ink-400">{source}</span>
    </div>
  );
}

/* ── Pillar card ────────────────────────────────────────── */
function PillarCard({
  icon,
  name,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-6 hover:shadow-md hover:border-teal-200 transition-all duration-300">
      <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-medium text-ink-900 mb-2">{name}</h3>
      <p className="text-sm text-ink-500 leading-relaxed">{description}</p>
    </div>
  );
}

/* ── Deliverable row ────────────────────────────────────── */
function Deliverable({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-ink-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-ink-900 mb-0.5">{title}</p>
        <p className="text-sm text-ink-500 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

/* ── Pricing row ────────────────────────────────────────── */
function PriceRow({ category, fee }: { category: string; fee: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-ink-100 last:border-0">
      <span className="text-sm text-ink-700">{category}</span>
      <span className="text-sm font-medium text-ink-900 tabular-nums">{fee}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function PitchPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="bg-teal-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 70% 30%, #248179, transparent 60%)" }} />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] tracking-[0.2em] uppercase text-lime-400 font-medium bg-lime-400/10 px-3 py-1.5 rounded-full border border-lime-400/20">
              Certification Program
            </span>
          </div>
          <h1
            className="text-white font-medium leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.035em" }}
          >
            Make your product the one<br />
            consumers trust and can verify.
          </h1>
          <p className="text-teal-300 text-lg sm:text-xl leading-relaxed mb-10" style={{ maxWidth: "36rem" }}>
            The Clean Sheet helps brands turn product quality into provable trust
            through independent, science-backed certification.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/certification"
              className="inline-flex items-center gap-2 bg-white text-teal-950 font-medium text-sm px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors"
            >
              Apply for certification <ArrowUpRight size={14} />
            </Link>
            <a
              href="/Certification-for-Brands.pdf"
              target="_blank"
              className="inline-flex items-center gap-2 border border-teal-600 text-teal-300 font-medium text-sm px-6 py-3 rounded-xl hover:bg-teal-900/50 transition-colors"
            >
              <Download size={14} /> Download deck (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* ── Market context ──────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24 border-b border-ink-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[9px] tracking-[0.22em] uppercase text-ink-400 mb-3">
            The market shift
          </p>
          <h2
            className="font-medium text-ink-950 tracking-tight leading-tight mb-4"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
          >
            The market is no longer buying claims.<br />
            It is demanding <span className="text-teal-600">proof.</span>
          </h2>
          <p className="text-sm text-ink-500 mb-12" style={{ maxWidth: "32rem" }}>
            Science-backed features are now the fastest-growing driver of trust in India.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10">
            <Stat value="30%" label="Sales increase with trust badges and certifications" source="MonetizePros / TrustedSite 2025" />
            <Stat value="15%" label="Verified premium brands outpacing conventional market YoY" source="Ken Research 2024" />
            <Stat value="80%" label="Consumers willing to pay more for trusted, sustainable products" source="PwC Voice of Consumer 2024" />
            <Stat value="92%" label="Indian consumers aware of organic products, only 24% purchase" source="Archives of Current Research Intl 2025" />
            <Stat value="6/10" label="Top-selling Indian sunscreens failed independent lab tests" source="Business Standard 2025" />
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24 border-b border-ink-100" style={{ background: "rgb(248,252,251)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[9px] tracking-[0.22em] uppercase text-ink-400 mb-3">
            How it works
          </p>
          <h2
            className="font-medium text-ink-950 tracking-tight leading-tight mb-12"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
          >
            We turn your claims into <span className="text-teal-600">certified truth.</span>
          </h2>

          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {[
              { step: "1", title: "Submit", detail: "Share your formula documentation, test reports, and product claims through a secure NDA-protected process." },
              { step: "2", title: "Verify", detail: "Our independent panel of scientists, toxicologists, and regulatory specialists evaluates every layer of your product." },
              { step: "3", title: "Certify", detail: "Receive your certification badge, public verification page, QR code, and registry listing." },
            ].map(({ step, title, detail }) => (
              <div key={step} className="bg-white rounded-2xl border border-teal-100 p-6">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white text-lg font-medium flex items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="text-base font-medium text-ink-900 mb-2">{title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>

          {/* Respects list */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "No operational changes required",
              "No additional testing: we review what you have",
              "No reformulation needed",
              "NDA protection for sensitive formulation data",
              "Works with your existing QA and lab ecosystem",
              "Standard timeline: 6–10 weeks",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-ink-700">
                <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 Pillars ───────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24 border-b border-ink-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[9px] tracking-[0.22em] uppercase text-ink-400 mb-3">
            The PRISM framework
          </p>
          <h2
            className="font-medium text-ink-950 tracking-tight leading-tight mb-4"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
          >
            5 layers of independent evaluation
          </h2>
          <p className="text-sm text-ink-500 mb-12" style={{ maxWidth: "32rem" }}>
            Every certified product passes all five layers. No partial certifications.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PillarCard icon={<Scale size={18} />} name="Legal Compliance" description="Permitted in every declared market. UV filter legality, prohibited substances, label compliance." />
            <PillarCard icon={<FlaskConical size={18} />} name="Ingredient Safety" description="Full hazard profile, exposure assessment, sensitisation review, SVHC screening." />
            <PillarCard icon={<Building2 size={18} />} name="Manufacturing Quality" description="GMP certification, ISO 22716 compliance, stability data, preservative efficacy." />
            <PillarCard icon={<Shield size={18} />} name="Claims Verification" description="Every claim reviewed against submitted test evidence. SPF, clinical, efficacy." />
            <PillarCard icon={<Leaf size={18} />} name="Ethics & Sourcing" description="Cruelty-free verification, vegan assessment, reef safety, supply chain review." />
          </div>
        </div>
      </section>

      {/* ── Key deliverables ────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24 border-b border-ink-100" style={{ background: "rgb(248,252,251)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[9px] tracking-[0.22em] uppercase text-ink-400 mb-3">
            What you receive
          </p>
          <h2
            className="font-medium text-ink-950 tracking-tight leading-tight mb-10"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
          >
            Key deliverables
          </h2>

          <div className="grid sm:grid-cols-2 gap-x-12">
            <div>
              <Deliverable icon={<Fingerprint size={16} />} title="Unique Certification ID" detail="Every certified product receives a permanent, non-transferable identifier." />
              <Deliverable icon={<Globe size={16} />} title="Public Verification Page" detail="Source of truth accessible to anyone, anywhere: consumers, retailers, regulators." />
              <Deliverable icon={<QrCode size={16} />} title="QR Code" detail="Instant access to verification page from product packaging." />
            </div>
            <div>
              <Deliverable icon={<RefreshCw size={16} />} title="Live Status Engine" detail="Real-time certification status: Active, Expired, Suspended, or Revoked." />
              <Deliverable icon={<Search size={16} />} title="Public Registry Listing" detail="Searchable database on thecleansheet.in that anyone can query." />
              <Deliverable icon={<FileText size={16} />} title="Badge & Certificate Files" detail="High-resolution certification badge in 3 formats for packaging, marketing, and digital use." />
            </div>
          </div>
        </div>
      </section>

      {/* ── See it live ─────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24 border-b border-ink-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[9px] tracking-[0.22em] uppercase text-ink-400 mb-3">
            See it in action
          </p>
          <h2
            className="font-medium text-ink-950 tracking-tight leading-tight mb-4"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
          >
            What certification looks like
          </h2>
          <p className="text-sm text-ink-500 mb-10 mx-auto" style={{ maxWidth: "28rem" }}>
            Explore a sample certification: the consumer-facing product page and the full technical registry record.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              href="/verify/codeskin-ultralite-full-v2-p5r7k2"
              className="group rounded-2xl border border-teal-100 bg-teal-50/30 p-6 text-left hover:border-teal-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[0.15em] uppercase text-teal-600 font-medium">Consumer page</span>
                <ArrowUpRight size={14} className="text-teal-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-base font-medium text-ink-900 mb-1">Product Verification</p>
              <p className="text-sm text-ink-500 leading-relaxed">
                The page your customers see when they scan the QR code. Clean, trustworthy, verifiable.
              </p>
            </Link>
            <Link
              href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
              className="group rounded-2xl border border-teal-100 bg-teal-50/30 p-6 text-left hover:border-teal-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[0.15em] uppercase text-teal-600 font-medium">Technical record</span>
                <ArrowUpRight size={14} className="text-teal-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <p className="text-base font-medium text-ink-900 mb-1">Full Registry Proof</p>
              <p className="text-sm text-ink-500 leading-relaxed">
                The complete certification proof: every check, every claim, every piece of evidence.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Indicative pricing ──────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24 border-b border-ink-100" style={{ background: "rgb(248,252,251)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <p className="text-[9px] tracking-[0.22em] uppercase text-ink-400 mb-3">
                Investment
              </p>
              <h2
                className="font-medium text-ink-950 tracking-tight leading-tight mb-4"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
              >
                Indicative pricing
              </h2>
              <p className="text-sm text-ink-500 leading-relaxed mb-6" style={{ maxWidth: "24rem" }}>
                Fees are per SKU and reflect the complexity of evaluation. Portfolio discounts apply for multiple SKUs submitted together. All prices in INR, exclusive of 18% GST.
              </p>
              <div className="bg-white rounded-2xl border border-teal-100 p-5">
                <p className="text-[9px] tracking-[0.15em] uppercase text-ink-400 mb-4">Core certification per SKU</p>
                <PriceRow category="Face Cleansers" fee="&#8377;65,000" />
                <PriceRow category="Face Moisturisers" fee="&#8377;75,000" />
                <PriceRow category="Face Serums / Actives" fee="&#8377;90,000" />
                <PriceRow category="Sunscreens (SPF products)" fee="&#8377;1,10,000" />
                <PriceRow category="Baby Care" fee="&#8377;1,20,000" />
                <PriceRow category="Hair Care" fee="&#8377;75,000" />
                <PriceRow category="Body Care" fee="&#8377;65,000" />
                <PriceRow category="Lip Products" fee="&#8377;80,000" />
              </div>
            </div>

            <div className="space-y-6">
              {/* Portfolio discounts */}
              <div className="bg-white rounded-2xl border border-teal-100 p-5">
                <p className="text-[9px] tracking-[0.15em] uppercase text-ink-400 mb-4">Portfolio discounts</p>
                <PriceRow category="3-5 SKUs" fee="10% off" />
                <PriceRow category="6-10 SKUs" fee="15% off" />
                <PriceRow category="11-20 SKUs" fee="20% off" />
                <PriceRow category="21+ SKUs" fee="25% off + dedicated evaluator" />
              </div>

              {/* PRISM modules */}
              <div className="bg-white rounded-2xl border border-teal-100 p-5">
                <p className="text-[9px] tracking-[0.15em] uppercase text-ink-400 mb-4">PRISM specialist modules (add-on)</p>
                <PriceRow category="Sun Verified" fee="&#8377;40,000" />
                <PriceRow category="Baby Safe" fee="&#8377;35,000" />
                <PriceRow category="Active Verified" fee="&#8377;35,000" />
                <PriceRow category="Pregnancy Safe" fee="&#8377;30,000" />
                <PriceRow category="Sensitive Skin" fee="&#8377;25,000" />
                <PriceRow category="Natural & Organic" fee="&#8377;25,000" />
                <PriceRow category="Vegan Verified" fee="&#8377;20,000" />
              </div>

              {/* Annual */}
              <div className="bg-white rounded-2xl border border-teal-100 p-5">
                <p className="text-[9px] tracking-[0.15em] uppercase text-ink-400 mb-4">Annual surveillance</p>
                <PriceRow category="1-5 SKUs" fee="&#8377;28,000 / SKU / year" />
                <PriceRow category="6-15 SKUs" fee="&#8377;24,000 / SKU / year" />
                <PriceRow category="16-30 SKUs" fee="&#8377;20,000 / SKU / year" />
                <PriceRow category="31+ SKUs" fee="&#8377;16,000 / SKU / year" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bg-teal-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 30% 70%, #248179, transparent 60%)" }} />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24 relative z-10 text-center">
          <h2
            className="text-white font-medium tracking-tight leading-tight mb-4"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
          >
            Start with your first certification today.
          </h2>
          <p className="text-teal-300 text-base mb-10 mx-auto" style={{ maxWidth: "28rem" }}>
            The future belongs to brands who can prove what they promise.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Link
              href="/certification"
              className="inline-flex items-center gap-2 bg-white text-teal-950 font-medium text-sm px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors"
            >
              Apply for certification <ArrowUpRight size={14} />
            </Link>
            <a
              href="/Certification-for-Brands.pdf"
              target="_blank"
              className="inline-flex items-center gap-2 border border-teal-600 text-teal-300 font-medium text-sm px-6 py-3 rounded-xl hover:bg-teal-900/50 transition-colors"
            >
              <Download size={14} /> Download full deck
            </a>
          </div>
          <div className="border-t border-teal-800 pt-8 max-w-sm mx-auto">
            <p className="text-teal-400 text-sm font-medium mb-1">sonal@thecleansheet.in</p>
            <p className="text-teal-500 text-sm">+91-7093091666</p>
            <p className="text-teal-600 text-xs mt-3">www.thecleansheet.in</p>
          </div>
        </div>
      </section>
    </div>
  );
}
