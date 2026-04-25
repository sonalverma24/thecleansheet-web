"use client";

export default function PrintBar() {
  return (
    <div
      className="screen-only"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        background: "#0a2420", color: "#fff", padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        fontSize: 13, fontFamily: "Inter, sans-serif",
      }}
    >
      <span style={{ fontWeight: 600 }}>The Clean Sheet™ · Print Preview</span>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "#0d9488", color: "#fff", border: "none",
            borderRadius: 8, padding: "6px 16px", fontWeight: 700,
            fontSize: 13, cursor: "pointer",
          }}
        >
          Save as PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            background: "rgba(255,255,255,0.1)", color: "#fff", border: "none",
            borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13,
          }}
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
