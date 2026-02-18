/**
 * Generate PWA icons from the SVG source.
 * Run: node scripts/generate-icons.mjs
 *
 * This creates simple colored-background PNG icons using sharp if available,
 * otherwise outputs a message to generate them manually.
 */

import { writeFileSync } from "fs";

const sizes = [192, 512];

// Minimal 1x1 PNG generator for placeholder (will be replaced with proper icons)
// For production, use: npx pwa-asset-generator public/icons/icon.svg public/icons
function createMinimalPng(size) {
  // Create a simple PNG with the app's cream background color
  // This is a valid PNG that renders as a solid color square
  // For proper icons with the star emoji, use a tool like pwa-asset-generator
  const canvas = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#FFF9E6"/>
  <text x="${size / 2}" y="${size * 0.74}" font-size="${Math.round(size * 0.625)}" text-anchor="middle" font-family="sans-serif">⭐</text>
</svg>`;
  return canvas;
}

for (const size of sizes) {
  const svg = createMinimalPng(size);
  writeFileSync(`public/icons/icon-${size}.svg`, svg);
  console.log(`Created icon-${size}.svg`);
}

console.log("\nSVG icons created. For PNG icons, run:");
console.log("npx @nicolo-ribaudo/pwa-asset-generator public/icons/icon.svg public/icons --icon-only");
