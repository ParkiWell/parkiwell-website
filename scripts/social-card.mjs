// Draw the share card from local brand artwork and an actual product screen.
// Run after changing the screen or the card copy: node scripts/social-card.mjs
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const screenManifest = await readFile(
  new URL("../src/lib/screens.ts", import.meta.url),
  "utf8",
);
const screen = screenManifest.match(/home: \{\s*light: "([^"]+)"/)[1];
const screenshot = await sharp(
  new URL(`../public${screen}`, import.meta.url).pathname,
)
  .resize(244, 530)
  .png()
  .toBuffer();
const mark = await sharp(
  new URL("../public/brand/mark.svg", import.meta.url).pathname,
)
  .resize(54, 54)
  .png()
  .toBuffer();

const drawing =
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f4f0e7"/>
  <g font-family="Arial, sans-serif" fill="#173a3e">
    <text x="132" y="100" font-size="34" font-weight="700">ParkiWell</text>
    <text x="64" y="238" font-size="68" font-weight="700">Parkinson’s care,</text>
    <text x="64" y="318" font-size="68" font-weight="700">organized.</text>
    <text x="68" y="396" font-size="27">Symptom records. Medication reminders.</text>
    <text x="68" y="438" font-size="27">Speech and movement practice.</text>
    <path d="M68 490H750" stroke="#173a3e" stroke-opacity=".25"/>
    <text x="68" y="542" font-size="23">Coming to iPhone and Android</text>
    <text x="68" y="584" font-size="20">parkiwell.com</text>
  </g>
  <rect x="853" y="43" width="274" height="560" rx="38" fill="#20363a"/>
</svg>`);

const card = await sharp(drawing)
  .composite([
    { input: mark, left: 64, top: 59 },
    { input: screenshot, left: 868, top: 58 },
  ])
  .png()
  .toBuffer();
const hash = createHash("sha256").update(card).digest("hex").slice(0, 8);
const filename = `social-card-${hash}.png`;
await writeFile(new URL(`../public/brand/${filename}`, import.meta.url), card);
await writeFile(
  new URL("../src/lib/social-image.ts", import.meta.url),
  `// Drawn by scripts/social-card.mjs using local artwork and a product screenshot.
export const socialImage = {
  url: "/brand/${filename}",
  width: 1200,
  height: 630,
  alt: "ParkiWell: Parkinson's care, organized. Symptom records, medication reminders, and speech and movement practice. Coming to iPhone and Android.",
} as const;
`,
);
console.log(`Wrote public/brand/${filename}`);
