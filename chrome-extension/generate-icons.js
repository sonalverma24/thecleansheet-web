// Run with Node.js to generate PNG icons from SVG:
//   node generate-icons.js
//
// Requires: npm install sharp (one-time, in this folder)
//
// Or just drop your own PNG icons (16x16, 48x48, 128x128) into ./icons/

const fs = require("fs");
const path = require("path");

// Inline SVG for the TCS shield icon
const svg = `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="#248179"/>
  <path d="M64 20L24 40V64C24 88.3 41.7 111.2 64 118C86.3 111.2 104 88.3 104 64V40L64 20Z" fill="white" fill-opacity="0.15"/>
  <path d="M64 20L24 40V64C24 88.3 41.7 111.2 64 118C86.3 111.2 104 88.3 104 64V40L64 20Z" stroke="white" stroke-width="4" stroke-linejoin="round"/>
  <path d="M50 65L59 74L79 52" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

try {
  const sharp = require("sharp");
  const sizes = [16, 48, 128];
  Promise.all(
    sizes.map(size =>
      sharp(Buffer.from(svg.replace('width="128" height="128"', `width="${size}" height="${size}"`)))
        .png()
        .toFile(path.join(__dirname, "icons", `icon${size}.png`))
        .then(() => console.log(`Generated icon${size}.png`))
    )
  ).then(() => console.log("All icons generated."));
} catch {
  // sharp not installed - write SVG files as fallback note
  console.log("Run: npm install sharp  then re-run this script.");
  console.log("Or manually place icon16.png, icon48.png, icon128.png in ./icons/");

  // Write SVG versions so Chrome can at least show something (Chrome doesn't use SVG for action icons,
  // but having the file helps you convert manually)
  fs.writeFileSync(path.join(__dirname, "icons", "icon.svg"), svg);
  console.log("Wrote icons/icon.svg - convert to PNG manually if needed.");
}
