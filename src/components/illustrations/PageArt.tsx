/* ────────────────────────────────────────────────────────────────
   PAGE ART · original flat-vector spot illustrations, one per inner
   page, in The Clean Sheet palette. Hand-built SVG: scalable, tiny,
   on-brand. No stock photos, no third-party artwork.
──────────────────────────────────────────────────────────────── */

type ArtProps = { className?: string };

function Stage() {
  return (
    <>
      <rect x="8" y="8" width="404" height="324" rx="26" fill="#eef7f5" />
      <circle cx="356" cy="72" r="48" fill="#ffe1de" />
      <circle cx="64" cy="256" r="9" fill="#d2ff34" />
      <circle cx="380" cy="250" r="6" fill="#80d5cc" />
      <circle cx="96" cy="96" r="6" fill="#fd6158" />
    </>
  );
}

/* THE STANDARD · a checklist read against the standard, pass and fail. */
export function StandardArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 420 340" className={className} role="img" aria-label="A checklist read against the standard" xmlns="http://www.w3.org/2000/svg">
      <Stage />
      <ellipse cx="196" cy="292" rx="98" ry="12" fill="#1f6f68" opacity="0.08" />
      <rect x="112" y="64" width="158" height="210" rx="16" fill="#ffffff" stroke="#dbeae6" strokeWidth="2" />
      <rect x="163" y="54" width="56" height="22" rx="6" fill="#248179" />
      {[112, 152, 192].map((y, i) => (
        <g key={i}>
          <circle cx="144" cy={y} r="11" fill="#248179" />
          <path d={`M138.5 ${y} l4 4.5 l8 -9`} fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="164" y={y - 4} width="84" height="8" rx="4" fill="#cfe4df" />
        </g>
      ))}
      <circle cx="144" cy="232" r="11" fill="#fd6158" />
      <path d="M140 228 l8 8 M148 228 l-8 8" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="164" y="228" width="60" height="8" rx="4" fill="#fbd9d6" />
      <circle cx="266" cy="228" r="40" fill="#ffffff" opacity="0.35" />
      <circle cx="266" cy="228" r="40" fill="none" stroke="#17403a" strokeWidth="9" />
      <path d="M294 256 l28 28" stroke="#17403a" strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
}

/* EDUCATION · an open book with an idea, and the ingredients behind it. */
export function EducationArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 420 340" className={className} role="img" aria-label="An open book and the ideas behind a product" xmlns="http://www.w3.org/2000/svg">
      <Stage />
      <ellipse cx="205" cy="290" rx="120" ry="13" fill="#1f6f68" opacity="0.08" />
      <g stroke="#f2a94e" strokeWidth="4" strokeLinecap="round">
        <path d="M205 40 v16" /><path d="M167 58 l11 11" /><path d="M243 58 l-11 11" />
      </g>
      <circle cx="205" cy="96" r="27" fill="#ffd97a" />
      <path d="M193 96 a12 12 0 0 1 24 0" fill="none" stroke="#c98a1e" strokeWidth="3" />
      <rect x="197" y="118" width="16" height="9" rx="2" fill="#c98a1e" />
      <path d="M205 168 C170 150 130 150 104 160 L104 258 C130 248 170 248 205 266 Z" fill="#ffffff" stroke="#dbeae6" strokeWidth="2" />
      <path d="M205 168 C240 150 280 150 306 160 L306 258 C280 248 240 248 205 266 Z" fill="#fcf9f8" stroke="#dbeae6" strokeWidth="2" />
      <path d="M205 168 L205 266" stroke="#cfe4df" strokeWidth="2" />
      <g stroke="#cfe4df" strokeWidth="5" strokeLinecap="round">
        <path d="M124 182 h56" /><path d="M124 200 h56" /><path d="M124 218 h44" />
        <path d="M230 182 h56" /><path d="M230 200 h56" /><path d="M230 218 h44" />
      </g>
      <path d="M104 258 L205 276 L306 258 L306 272 L205 290 L104 272 Z" fill="#248179" />
      <circle cx="316" cy="196" r="14" fill="#fd6158" />
      <circle cx="352" cy="214" r="10" fill="#80d5cc" />
      <path d="M316 196 L352 214" stroke="#3f8f86" strokeWidth="2.5" />
    </svg>
  );
}

/* FOR BRANDS · a product rising to earn the certified rosette. */
export function ForBrandsArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 420 340" className={className} role="img" aria-label="A product earning the certified badge" xmlns="http://www.w3.org/2000/svg">
      <Stage />
      <ellipse cx="150" cy="288" rx="70" ry="12" fill="#1f6f68" opacity="0.08" />
      <rect x="126" y="118" width="46" height="22" rx="6" fill="#17403a" />
      <rect x="137" y="138" width="24" height="14" fill="#1f6f68" />
      <rect x="112" y="150" width="76" height="130" rx="18" fill="#248179" />
      <rect x="120" y="166" width="10" height="94" rx="5" fill="#6fd0c7" opacity="0.55" />
      <rect x="126" y="192" width="48" height="60" rx="8" fill="#fcf9f8" />
      <path d="M138 220 l7 8 l16 -19" fill="none" stroke="#248179" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M214 250 C214 210 214 190 214 172" fill="none" stroke="#fd6158" strokeWidth="8" strokeLinecap="round" strokeDasharray="2 16" />
      <path d="M214 150 l12 20 l-24 0 z" fill="#fd6158" />
      <path d="M300 214 l-14 26 l-12 -8 z" fill="#e8564d" />
      <path d="M330 214 l14 26 l12 -8 z" fill="#e8564d" />
      <circle cx="316" cy="150" r="52" fill="#fd6158" />
      <circle cx="316" cy="150" r="43" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 6" />
      <path d="M298 151 l12 13 l24 -29" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* VERIFY · a certificate confirmed, and a code anyone can scan. */
export function VerifyArt({ className = "" }: ArtProps) {
  const qr = [
    [1, 1, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 1],
    [0, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 1],
  ];
  return (
    <svg viewBox="0 0 420 340" className={className} role="img" aria-label="A certificate verified, with a scannable code" xmlns="http://www.w3.org/2000/svg">
      <Stage />
      <ellipse cx="196" cy="292" rx="104" ry="12" fill="#1f6f68" opacity="0.08" />
      <rect x="98" y="70" width="196" height="196" rx="14" fill="#ffffff" stroke="#dbeae6" strokeWidth="2" />
      <rect x="122" y="94" width="96" height="9" rx="4.5" fill="#248179" />
      <g stroke="#cfe4df" strokeWidth="6" strokeLinecap="round">
        <path d="M122 122 h150" /><path d="M122 142 h150" /><path d="M122 162 h110" />
      </g>
      <circle cx="150" cy="212" r="26" fill="#eaf5f2" stroke="#248179" strokeWidth="3" />
      <path d="M138 212 l8 9 l17 -20" fill="none" stroke="#248179" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M150 238 l-10 22 l10 -6 l10 6 z" fill="#fd6158" />
      <rect x="236" y="188" width="96" height="96" rx="12" fill="#ffffff" stroke="#dbeae6" strokeWidth="2" />
      <g fill="#17403a">
        {qr.map((row, r) => row.map((c, k) => (c ? <rect key={`${r}-${k}`} x={250 + k * 12} y={202 + r * 12} width="10" height="10" rx="1.5" /> : null)))}
      </g>
      <circle cx="300" cy="98" r="24" fill="#fd6158" />
      <path d="M290 99 l7 7 l13 -15" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
