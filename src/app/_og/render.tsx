import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Shared config + renderer for the site's social share images.
// This file lives in a private (underscore) folder so it is not a route;
// the actual opengraph-image / twitter-image route files import from here.
export const alt = "The Clean Sheet, India's Clean Beauty Standard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand assets loaded from disk at render time
const cooperBold = readFileSync(
  join(process.cwd(), "public/fonts/CooperBT-Bold.ttf")
);
const helvetica = readFileSync(
  join(process.cwd(), "public/fonts/helvetica-light-587ebe5a59211.ttf")
);
const logo = readFileSync(join(process.cwd(), "src/app/_og/logo.png"));
const logoDataUri = `data:image/png;base64,${logo.toString("base64")}`;

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 84px",
          background:
            "linear-gradient(135deg, #0F2C2A 0%, #174039 55%, #1D5550 100%)",
          fontFamily: "Cooper BT",
        }}
      >
        {/* Left: text block */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Helvetica",
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#72CEC8",
              marginBottom: 24,
            }}
          >
            Est. 2025 · India
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Cooper BT",
              fontSize: 96,
              lineHeight: 1.02,
              color: "#F7F7F5",
            }}
          >
            <span>The Clean</span>
            <span>Sheet</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Helvetica",
              fontSize: 30,
              lineHeight: 1.35,
              color: "#D4F2EF",
              marginTop: 30,
              maxWidth: 560,
            }}
          >
            India's science-backed clean beauty standard. Ingredient analysis,
            certification & honest scorecards.
          </div>
        </div>

        {/* Right: logo badge */}
        <div style={{ display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUri} width={400} height={400} alt="" />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cooper BT", data: cooperBold, weight: 700, style: "normal" },
        { name: "Helvetica", data: helvetica, weight: 300, style: "normal" },
      ],
    }
  );
}
