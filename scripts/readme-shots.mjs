// Captures the pictures the README uses, of the site itself.
//
// Usage:
//   npm run build && npm run start -- --port 3210
//   node scripts/readme-shots.mjs [url]
//
// These are shots of this website, not of the app: the app's own screenshots
// live in its repository and belong in its readme. Filenames carry a hash of
// their contents, and the README block between the `site-shots` markers is
// rewritten from here, so the pictures cannot rot into broken images.
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const BASE = process.argv[2] ?? "http://127.0.0.1:3210";
const OUT = path.join(process.cwd(), "docs", "site");
const README = path.join(process.cwd(), "README.md");

const VIEWPORT = { width: 1440, height: 900 };

const shots = [
  {
    name: "hero",
    theme: "light",
    at: "#main",
    width: 1280,
    alt: "The opening: your day, in rhythm",
  },
  {
    name: "day",
    theme: "light",
    at: "#day",
    width: 820,
    alt: "The pinned day sequence",
  },
  {
    name: "privacy",
    theme: "dark",
    at: "#privacy",
    width: 820,
    alt: "The privacy chapter, in dark mode",
  },
  {
    name: "launch",
    theme: "dark",
    at: "#get",
    width: 820,
    alt: "The launch list at the end of the page",
  },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const built = [];

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: shot.theme,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // Put the chapter where the page's own gravity would come to rest on it, so
  // the picture is the one a visitor actually sees.
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`nothing matches ${selector}`);
    const box = element.getBoundingClientRect();
    const top =
      selector === "#main"
        ? 0
        : box.top + window.scrollY + Math.min(box.height, window.innerHeight) / 2 -
          window.innerHeight / 2;
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  }, shot.at);
  // Long enough for the settle to finish and the pinned sequence to catch up.
  await page.waitForTimeout(2500);

  const png = await page.screenshot();
  const buffer = await sharp(png)
    .resize({ width: shot.width })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 8);
  const file = `${shot.name}-${hash}.webp`;
  await writeFile(path.join(OUT, file), buffer);
  built.push({ ...shot, file });
  console.log(
    `${shot.name.padEnd(9)} ${file.padEnd(22)} ${(buffer.length / 1024).toFixed(1).padStart(7)} kB`,
  );

  await context.close();
}

await browser.close();

const keep = new Set(built.map((shot) => shot.file));
for (const file of await readdir(OUT)) {
  if (!keep.has(file)) {
    await rm(path.join(OUT, file));
    console.log(`removed stale ${file}`);
  }
}

const [hero, ...rest] = built;
const block = [
  "<!-- site-shots:start -->",
  "<p align=\"center\">",
  `  <img src="docs/site/${hero.file}" alt="${hero.alt}" width="88%">`,
  "</p>",
  "<p align=\"center\">",
  ...rest.map(
    (shot) => `  <img src="docs/site/${shot.file}" alt="${shot.alt}" width="29%">`,
  ),
  "</p>",
  "<!-- site-shots:end -->",
].join("\n");

const readme = await readFile(README, "utf8");
const replaced = readme.replace(
  /<!-- site-shots:start -->[\s\S]*?<!-- site-shots:end -->/,
  block,
);
if (replaced === readme) {
  throw new Error("README has no site-shots markers to write between");
}
await writeFile(README, replaced);
console.log("\nupdated the picture block in README.md");
