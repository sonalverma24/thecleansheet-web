import { notFound } from "next/navigation";
import { getGuideBySlug, getAllGuideSlugs } from "@/lib/skin-guides";
import PrintTrigger from "@/components/PrintTrigger";

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return { title: `The Clean Sheet™ Guide to ${guide.skinType}` };
}

export default async function GuidePrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <>
      <PrintTrigger />

      {/* ─── GLOBAL PRINT STYLES ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: #fff;
          color: #0a1f16;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        @page {
          size: A4;
          margin: 0;
        }

        /* Hide print trigger button in print */
        .no-print { display: none !important; }

        /* Force page breaks */
        .page-break { page-break-after: always; break-after: page; }
        .avoid-break { page-break-inside: avoid; break-inside: avoid; }

        /* Screen: show close button */
        @media screen {
          .screen-only { display: flex; }
        }
        @media print {
          .screen-only { display: none !important; }
        }
      `}</style>

      {/* ─── SCREEN ONLY: close bar ─── */}
      <div className="screen-only" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        background: "#0a2420", color: "#fff", padding: "10px 20px",
        alignItems: "center", justifyContent: "space-between", gap: 12,
        fontSize: 13, fontFamily: "Inter, sans-serif"
      }}>
        <span style={{ fontWeight: 600 }}>The Clean Sheet™ · Print Preview</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => typeof window !== "undefined" && window.print()}
            style={{
              background: "#0d9488", color: "#fff", border: "none",
              borderRadius: 8, padding: "6px 16px", fontWeight: 700,
              fontSize: 13, cursor: "pointer"
            }}
          >
            Save as PDF
          </button>
          <button
            onClick={() => typeof window !== "undefined" && window.close()}
            style={{
              background: "rgba(255,255,255,0.1)", color: "#fff", border: "none",
              borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* ─── COVER PAGE ─── */}
      <div className="page-break avoid-break" style={{
        width: "210mm", minHeight: "297mm",
        background: "linear-gradient(160deg, #0a2420 0%, #0f3d38 45%, #083028 100%)",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        padding: "0",
        marginTop: 40, /* offset screen bar */
      }}>

        {/* Watermark grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(#5eead4 1px, transparent 1px), linear-gradient(90deg, #5eead4 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Decorative molecule SVG */}
        <svg style={{ position: "absolute", top: "10%", right: "-5%", opacity: 0.08, width: 340, height: 340 }}
          viewBox="0 0 480 480" fill="none">
          {[[60,120,160,80],[160,80,260,140],[260,140,360,80],[360,80,440,140],
            [160,80,140,20],[360,80,380,20],[260,140,260,240],[160,80,100,160],
            [260,240,200,320],[260,240,320,320],[100,160,60,220],[200,320,180,400],
            [320,320,360,400]].map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5eead4" strokeWidth="2" strokeDasharray="5 4"/>
          ))}
          {[{cx:60,cy:120,r:6},{cx:160,cy:80,r:9},{cx:260,cy:140,r:7},{cx:360,cy:80,r:9},
            {cx:440,cy:140,r:6},{cx:140,cy:20,r:5},{cx:380,cy:20,r:5},{cx:260,cy:240,r:8},
            {cx:100,cy:160,r:5},{cx:200,cy:320,r:5},{cx:320,cy:320,r:5},
            {cx:60,cy:220,r:4},{cx:180,cy:400,r:4},{cx:360,cy:400,r:4}].map(({cx,cy,r},i)=>(
            <circle key={i} cx={cx} cy={cy} r={r} fill="#5eead4" fillOpacity="0.7"/>
          ))}
        </svg>

        {/* Large decorative circle */}
        <div style={{
          position: "absolute", bottom: -120, left: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, padding: "52px 56px", flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 64 }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 800, color: "#5eead4",
                textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 4
              }}>
                The Clean Sheet™
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                thecleansheet.in
              </div>
            </div>
            {/* QR-style brand mark */}
            <div style={{
              width: 44, height: 44, background: "rgba(255,255,255,0.08)",
              borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#14b8a6" opacity="0.9"/>
                <rect x="14" y="2" width="8" height="8" rx="1.5" fill="#14b8a6" opacity="0.9"/>
                <rect x="2" y="14" width="8" height="8" rx="1.5" fill="#14b8a6" opacity="0.9"/>
                <rect x="14" y="14" width="4" height="4" rx="1" fill="#5eead4" opacity="0.7"/>
                <rect x="19" y="14" width="3" height="3" rx="0.75" fill="#5eead4" opacity="0.5"/>
                <rect x="14" y="19" width="3" height="3" rx="0.75" fill="#5eead4" opacity="0.5"/>
              </svg>
            </div>
          </div>

          {/* Category tag */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)",
            borderRadius: 20, padding: "5px 14px", width: "fit-content",
            fontSize: 9, fontWeight: 700, color: "#5eead4",
            textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 28
          }}>
            ✦ Skin Type Guide
          </div>

          {/* Main title */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 60, fontWeight: 900, lineHeight: 1.05,
              color: "#ffffff", marginBottom: 20,
            }}>
              Guide to<br />
              <span style={{ color: "#5eead4" }}>{guide.skinType}</span>
            </div>
            <p style={{
              fontSize: 14, color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7, maxWidth: 380, marginBottom: 48
            }}>
              {guide.tagline}
            </p>

            {/* Silver lining box */}
            <div style={{
              background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)",
              borderRadius: 12, padding: "16px 20px", maxWidth: 420
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#5eead4", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
                The Upside
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                {guide.silverLining}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
              India&apos;s first independent beauty &amp; personal care standard
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
              thecleansheet.in
            </div>
          </div>
        </div>
      </div>

      {/* ─── CONTENT PAGES ─── */}
      <div style={{
        width: "210mm", background: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>

        {/* Repeating watermark across content */}
        <style>{`
          .content-page {
            position: relative;
            padding: 48px 52px;
            min-height: 297mm;
          }
          .content-page::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 60px,
              rgba(13, 148, 136, 0.025) 60px,
              rgba(13, 148, 136, 0.025) 62px
            );
            pointer-events: none;
          }

          /* Page header */
          .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 14px;
            border-bottom: 2px solid #0d9488;
            margin-bottom: 32px;
          }
          .page-header-brand {
            font-size: 8px;
            font-weight: 800;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: 0.2em;
          }
          .page-header-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 13px;
            font-weight: 700;
            color: #0a1f16;
          }

          /* Section headings */
          .section-num {
            font-family: 'Inter', sans-serif;
            font-size: 9px;
            font-weight: 800;
            color: #5eead4;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .section-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 20px;
            font-weight: 700;
            color: #0a1f16;
            margin-bottom: 16px;
          }

          /* Cards */
          .card {
            background: #f0fdfa;
            border: 1px solid #ccfbf1;
            border-radius: 10px;
            padding: 16px;
          }
          .card-heading {
            font-size: 8px;
            font-weight: 800;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 10px;
          }
          .bullet-item {
            display: flex;
            gap: 8px;
            margin-bottom: 7px;
            font-size: 10px;
            line-height: 1.5;
            color: #374151;
          }
          .bullet-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #14b8a6;
            flex-shrink: 0;
            margin-top: 4px;
          }

          /* Mistake row */
          .mistake-row {
            display: flex;
            gap: 10px;
            padding: 10px 14px;
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            margin-bottom: 6px;
            font-size: 10px;
            line-height: 1.5;
            color: #374151;
          }
          .mistake-icon {
            color: #d97706;
            font-size: 11px;
            flex-shrink: 0;
            margin-top: 1px;
          }

          /* Ingredient section */
          .ing-section {
            margin-bottom: 10px;
            border: 1px solid #ccfbf1;
            border-radius: 8px;
            overflow: hidden;
          }
          .ing-heading {
            background: #f0fdfa;
            padding: 8px 14px;
            font-size: 8px;
            font-weight: 800;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            border-bottom: 1px solid #ccfbf1;
          }
          .ing-body { padding: 10px 14px; }

          /* Routine */
          .routine-col {
            flex: 1;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
          }
          .routine-am-header {
            background: linear-gradient(90deg, #fffbeb, #fefce8);
            padding: 10px 16px;
            font-size: 9px;
            font-weight: 800;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            border-bottom: 1px solid #fde68a;
          }
          .routine-pm-header {
            background: linear-gradient(90deg, #0f2e2b, #0a3d38);
            padding: 10px 16px;
            font-size: 9px;
            font-weight: 800;
            color: #99f6e4;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            border-bottom: 1px solid #0d9488;
          }
          .routine-body { padding: 14px 16px; }
          .routine-step {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            font-size: 10px;
            line-height: 1.5;
          }
          .step-num {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ccfbf1;
            color: #0d9488;
            font-size: 9px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          /* Checklist */
          .checklist-box {
            background: linear-gradient(135deg, #0a2420, #0f3d38);
            border-radius: 12px;
            padding: 24px 28px;
          }
          .checklist-item {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            font-size: 10.5px;
            line-height: 1.5;
            color: #ccfbf1;
          }
          .check-icon { color: #14b8a6; flex-shrink: 0; margin-top: 1px; }

          /* Page footer */
          .page-footer {
            position: absolute;
            bottom: 24px;
            left: 52px;
            right: 52px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 8px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 8px;
          }
        `}</style>

        {/* ── Page 2: Understanding + Habits ── */}
        <div className="content-page avoid-break">
          <div className="page-header">
            <span className="page-header-brand">The Clean Sheet™ · thecleansheet.in</span>
            <span className="page-header-title">{guide.skinType}</span>
          </div>

          {/* Section 01 */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-num">01</div>
            <div className="section-title">Understanding Your Skin</div>
            <div style={{ display: "flex", gap: 14 }}>
              {guide.causes.map(({ label, items }) => (
                <div key={label} className="card" style={{ flex: 1 }}>
                  <div className="card-heading">{label}</div>
                  {items.map((item, i) => {
                    const [head, ...rest] = item.split(": ");
                    return (
                      <div key={i} className="bullet-item">
                        <span className="bullet-dot" />
                        <span>
                          {rest.length ? <><strong>{head}:</strong> {rest.join(": ")}</> : item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Section 02 */}
          <div>
            <div className="section-num">02</div>
            <div className="section-title">Essential Habits &amp; Hygiene</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {guide.habits.map((habit, i) => {
                const [head, ...rest] = habit.split(": ");
                return (
                  <div key={i} style={{
                    display: "flex", gap: 8, padding: "10px 12px",
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    borderRadius: 8, fontSize: 10, lineHeight: 1.5, color: "#374151"
                  }}>
                    <span style={{ color: "#0d9488", fontSize: 11, flexShrink: 0 }}>✓</span>
                    <span>
                      {rest.length ? <><strong style={{ color: "#0a1f16" }}>{head}:</strong> {rest.join(": ")}</> : habit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="page-footer">
            <span>© The Clean Sheet™ · India&apos;s first independent beauty standard</span>
            <span>thecleansheet.in</span>
          </div>
        </div>

        {/* ── Page 3: Mistakes + Ingredients ── */}
        <div className="content-page avoid-break page-break">
          <div className="page-header">
            <span className="page-header-brand">The Clean Sheet™ · thecleansheet.in</span>
            <span className="page-header-title">{guide.skinType}</span>
          </div>

          {/* Section 03 */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-num">03</div>
            <div className="section-title">Common Mistakes to Avoid</div>
            {guide.mistakes.map((mistake, i) => {
              const [head, ...rest] = mistake.split(": ");
              return (
                <div key={i} className="mistake-row">
                  <span className="mistake-icon">⚠</span>
                  <span>
                    {rest.length ? <><strong style={{ color: "#92400e" }}>{head}:</strong> {rest.join(": ")}</> : mistake}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Section 04 */}
          <div>
            <div className="section-num">04</div>
            <div className="section-title">Ingredient Guide &amp; Product Selection</div>
            {guide.ingredientSections.map(({ heading, tips }) => (
              <div key={heading} className="ing-section">
                <div className="ing-heading">{heading}</div>
                <div className="ing-body">
                  {tips.map((tip, i) => {
                    const [head, ...rest] = tip.split(": ");
                    return (
                      <div key={i} className="bullet-item">
                        <span className="bullet-dot" />
                        <span>
                          {rest.length ? <><strong>{head}:</strong> {rest.join(": ")}</> : tip}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="page-footer">
            <span>© The Clean Sheet™ · India&apos;s first independent beauty standard</span>
            <span>thecleansheet.in</span>
          </div>
        </div>

        {/* ── Page 4: Routine + Checklist ── */}
        <div className="content-page avoid-break page-break">
          <div className="page-header">
            <span className="page-header-brand">The Clean Sheet™ · thecleansheet.in</span>
            <span className="page-header-title">{guide.skinType}</span>
          </div>

          {/* Section 05 */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-num">05</div>
            <div className="section-title">Your Simplified Daily Routine</div>
            <div style={{ display: "flex", gap: 14 }}>
              {/* AM */}
              <div className="routine-col">
                <div className="routine-am-header">☀ Morning Routine</div>
                <div className="routine-body">
                  {guide.morningRoutine.map(({ step, action, detail }) => (
                    <div key={step} className="routine-step">
                      <div className="step-num">{step}</div>
                      <div>
                        <strong style={{ color: "#0a1f16" }}>{action}:</strong>{" "}
                        <span style={{ color: "#4b5563" }}>{detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* PM */}
              <div className="routine-col">
                <div className="routine-pm-header">🌙 Night Routine</div>
                <div className="routine-body">
                  {guide.nightRoutine.map(({ step, action, detail }) => (
                    <div key={step} className="routine-step">
                      <div className="step-num">{step}</div>
                      <div>
                        <strong style={{ color: "#0a1f16" }}>{action}:</strong>{" "}
                        <span style={{ color: "#4b5563" }}>{detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 06 */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-num">06</div>
            <div className="section-title">Summary Checklist</div>
            <div className="checklist-box">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                {guide.checklist.map((item, i) => (
                  <div key={i} className="checklist-item">
                    <span className="check-icon">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Back cover strip */}
          <div style={{
            background: "linear-gradient(90deg, #0a2420, #0f3d38)",
            borderRadius: 12, padding: "20px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#5eead4", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                The Clean Sheet™
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                India&apos;s first independent beauty &amp; personal care standard
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>thecleansheet.in</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                Analyze any product free · Ask Clean
              </div>
            </div>
          </div>

          <div className="page-footer">
            <span>© The Clean Sheet™ · India&apos;s first independent beauty standard</span>
            <span>thecleansheet.in</span>
          </div>
        </div>

      </div>
    </>
  );
}
