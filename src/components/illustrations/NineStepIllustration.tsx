export default function NineStepIllustration() {
  return (
    <svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="bg9" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#042f2e" />
          <stop offset="100%" stopColor="#0c3d38" />
        </linearGradient>
        <linearGradient id="shelfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="coral1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="teal1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="amber1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="blush1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fecdd3" />
          <stop offset="100%" stopColor="#fda4af" />
        </linearGradient>
        <linearGradient id="white1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0fdfa" />
          <stop offset="100%" stopColor="#ccfbf1" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* ── Background ── */}
      <rect width="800" height="600" fill="url(#bg9)" />

      {/* Subtle arc decorations */}
      <circle cx="700" cy="80" r="180" fill="none" stroke="#0d9488" strokeWidth="1" strokeOpacity="0.2" />
      <circle cx="700" cy="80" r="130" fill="none" stroke="#0d9488" strokeWidth="1" strokeOpacity="0.15" />
      <circle cx="100" cy="520" r="150" fill="none" stroke="#f97316" strokeWidth="1" strokeOpacity="0.12" />

      {/* Giant editorial "9" — background watermark */}
      <text
        x="400" y="480"
        fontSize="520"
        fontWeight="900"
        fill="#0d9488"
        fillOpacity="0.07"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        letterSpacing="-20"
      >
        9
      </text>

      {/* ── Shelf surface ── */}
      <rect x="60" y="388" width="680" height="14" rx="4" fill="url(#shelfGrad)" />
      <rect x="60" y="400" width="680" height="3" rx="1" fill="#000000" fillOpacity="0.3" />

      {/* ── Products ── */}

      {/* 1 — Tall pump bottle · coral */}
      <g filter="url(#softShadow)">
        <rect x="88" y="268" width="52" height="120" rx="10" fill="url(#coral1)" />
        {/* pump neck */}
        <rect x="109" y="252" width="10" height="22" rx="4" fill="#c2410c" />
        {/* pump head */}
        <rect x="102" y="248" width="24" height="10" rx="5" fill="#9a3412" />
        {/* label stripe */}
        <rect x="88" y="308" width="52" height="28" rx="0" fill="#ffffff" fillOpacity="0.15" />
        <rect x="95" y="315" width="32" height="4" rx="2" fill="#ffffff" fillOpacity="0.6" />
        <rect x="95" y="323" width="20" height="3" rx="1" fill="#ffffff" fillOpacity="0.35" />
      </g>

      {/* 2 — Squat cream jar · white/mint */}
      <g filter="url(#softShadow)">
        <rect x="162" y="330" width="64" height="58" rx="14" fill="url(#white1)" />
        {/* lid */}
        <rect x="162" y="323" width="64" height="16" rx="10" fill="#a7f3d0" />
        {/* label */}
        <rect x="170" y="340" width="44" height="5" rx="2" fill="#0d9488" fillOpacity="0.5" />
        <rect x="174" y="349" width="34" height="3" rx="1" fill="#0d9488" fillOpacity="0.3" />
        <rect x="178" y="356" width="26" height="3" rx="1" fill="#0d9488" fillOpacity="0.2" />
      </g>

      {/* 3 — Slim dropper serum · teal */}
      <g filter="url(#softShadow)">
        <rect x="251" y="248" width="38" height="140" rx="8" fill="url(#teal1)" />
        {/* dropper top */}
        <rect x="263" y="232" width="14" height="22" rx="5" fill="#2dd4bf" />
        <ellipse cx="270" cy="230" rx="10" ry="7" fill="#0f766e" />
        {/* label */}
        <rect x="251" y="295" width="38" height="40" rx="0" fill="#ffffff" fillOpacity="0.12" />
        <rect x="257" y="302" width="24" height="4" rx="2" fill="#ffffff" fillOpacity="0.7" />
        <rect x="259" y="310" width="18" height="3" rx="1" fill="#ffffff" fillOpacity="0.4" />
        <rect x="257" y="317" width="22" height="3" rx="1" fill="#ffffff" fillOpacity="0.3" />
      </g>

      {/* 4 — Wide moisturiser tub · amber */}
      <g filter="url(#softShadow)">
        <rect x="308" y="308" width="82" height="80" rx="14" fill="url(#amber1)" />
        {/* lid */}
        <rect x="308" y="300" width="82" height="18" rx="10" fill="#fde68a" />
        {/* label area */}
        <rect x="316" y="325" width="64" height="38" rx="6" fill="#ffffff" fillOpacity="0.2" />
        <rect x="322" y="332" width="44" height="5" rx="2" fill="#92400e" fillOpacity="0.5" />
        <rect x="326" y="341" width="34" height="3" rx="1" fill="#92400e" fillOpacity="0.35" />
        <rect x="324" y="348" width="38" height="3" rx="1" fill="#92400e" fillOpacity="0.25" />
      </g>

      {/* 5 — Tall slim bottle · blush */}
      <g filter="url(#softShadow)">
        <rect x="412" y="255" width="44" height="133" rx="9" fill="url(#blush1)" />
        {/* cap */}
        <rect x="416" y="244" width="36" height="18" rx="8" fill="#fda4af" />
        {/* label */}
        <rect x="412" y="305" width="44" height="36" rx="0" fill="#ffffff" fillOpacity="0.2" />
        <rect x="419" y="312" width="28" height="4" rx="2" fill="#9f1239" fillOpacity="0.4" />
        <rect x="421" y="320" width="22" height="3" rx="1" fill="#9f1239" fillOpacity="0.25" />
        <rect x="419" y="327" width="26" height="3" rx="1" fill="#9f1239" fillOpacity="0.2" />
      </g>

      {/* 6 — Spray bottle · coral dark */}
      <g filter="url(#softShadow)">
        <rect x="476" y="265" width="48" height="123" rx="10" fill="#f97316" />
        {/* trigger nozzle */}
        <rect x="520" y="282" width="18" height="10" rx="4" fill="#c2410c" />
        <rect x="500" y="272" width="22" height="26" rx="6" fill="#ea580c" />
        {/* label */}
        <rect x="476" y="318" width="48" height="34" rx="0" fill="#ffffff" fillOpacity="0.15" />
        <rect x="482" y="325" width="30" height="4" rx="2" fill="#ffffff" fillOpacity="0.7" />
        <rect x="484" y="333" width="24" height="3" rx="1" fill="#ffffff" fillOpacity="0.4" />
      </g>

      {/* 7 — Mini eye cream box · teal dark */}
      <g filter="url(#softShadow)">
        <rect x="545" y="338" width="56" height="50" rx="8" fill="#0f766e" />
        {/* highlight edge */}
        <rect x="545" y="338" width="8" height="50" rx="4" fill="#0d9488" />
        {/* label area */}
        <rect x="555" y="348" width="38" height="30" rx="4" fill="#ffffff" fillOpacity="0.1" />
        <rect x="559" y="354" width="26" height="4" rx="2" fill="#5eead4" fillOpacity="0.8" />
        <rect x="561" y="362" width="20" height="3" rx="1" fill="#5eead4" fillOpacity="0.5" />
        <rect x="559" y="369" width="24" height="3" rx="1" fill="#5eead4" fillOpacity="0.35" />
      </g>

      {/* 8 — Tall amber essence bottle */}
      <g filter="url(#softShadow)">
        <rect x="618" y="242" width="42" height="146" rx="9" fill="url(#amber1)" />
        {/* neck */}
        <rect x="628" y="228" width="22" height="20" rx="6" fill="#fde68a" />
        {/* cap */}
        <ellipse cx="639" cy="226" rx="14" ry="9" fill="#d97706" />
        {/* label */}
        <rect x="618" y="290" width="42" height="50" rx="0" fill="#ffffff" fillOpacity="0.18" />
        <rect x="624" y="298" width="28" height="5" rx="2" fill="#78350f" fillOpacity="0.6" />
        <rect x="626" y="307" width="22" height="3" rx="1" fill="#78350f" fillOpacity="0.4" />
        <rect x="624" y="314" width="26" height="3" rx="1" fill="#78350f" fillOpacity="0.3" />
        <rect x="628" y="321" width="18" height="3" rx="1" fill="#78350f" fillOpacity="0.2" />
      </g>

      {/* 9 — Small round pot · white teal */}
      <g filter="url(#softShadow)">
        <ellipse cx="714" cy="375" rx="34" ry="18" fill="#ccfbf1" />
        <rect x="680" y="358" width="68" height="30" rx="18" fill="url(#white1)" />
        {/* lid top highlight */}
        <ellipse cx="714" cy="357" rx="34" ry="12" fill="#a7f3d0" />
        {/* label */}
        <rect x="695" y="368" width="38" height="4" rx="2" fill="#0d9488" fillOpacity="0.5" />
        <rect x="700" y="376" width="28" height="3" rx="1" fill="#0d9488" fillOpacity="0.3" />
      </g>

      {/* ── Step count dots — 9 dots above products ── */}
      {[102, 192, 268, 348, 432, 498, 572, 638, 714].map((cx, i) => (
        <circle key={i} cx={cx} cy={228} r={5} fill={i < 3 ? "#f97316" : "#5eead4"} fillOpacity={i < 3 ? 1 : 0.6} />
      ))}
      <line x1="88" y1="228" x2="748" y2="228" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="4 6" />

      {/* ── Sparkle stars ── */}
      {/* star helper: 4-pointed */}
      <g fill="#5eead4" fillOpacity="0.7">
        <path d="M 58 140 L 62 150 L 72 154 L 62 158 L 58 168 L 54 158 L 44 154 L 54 150 Z" />
      </g>
      <g fill="#f97316" fillOpacity="0.6">
        <path d="M 740 180 L 743 188 L 751 191 L 743 194 L 740 202 L 737 194 L 729 191 L 737 188 Z" />
      </g>
      <g fill="#fde68a" fillOpacity="0.5">
        <path d="M 148 90 L 151 97 L 158 100 L 151 103 L 148 110 L 145 103 L 138 100 L 145 97 Z" />
      </g>
      <g fill="#5eead4" fillOpacity="0.4">
        <path d="M 680 440 L 682 445 L 687 447 L 682 449 L 680 454 L 678 449 L 673 447 L 678 445 Z" />
      </g>
      <g fill="#ffffff" fillOpacity="0.3">
        <path d="M 210 170 L 212 175 L 217 177 L 212 179 L 210 184 L 208 179 L 203 177 L 208 175 Z" />
      </g>

      {/* ── Editorial text overlay ── */}
      <text
        x="400" y="490"
        fontSize="11"
        fontWeight="600"
        fill="#5eead4"
        fillOpacity="0.5"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        letterSpacing="4"
      >
        YOUR ROUTINE · THE CLEAN SHEET™
      </text>

      {/* Small label at top left */}
      <rect x="60" y="48" width="130" height="28" rx="14" fill="#ffffff" fillOpacity="0.08" />
      <text x="125" y="66" fontSize="10" fontWeight="700" fill="#5eead4" fillOpacity="0.9" textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="2">
        CONSUMER SAFETY
      </text>
    </svg>
  );
}
