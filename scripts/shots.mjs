// Capture review screenshots at a set of scroll positions.
// Usage: node scripts/shots.mjs [outDir] [url]
import { mkdir } from "node:fs/promises";
import { chromium, devices, webkit } from "@playwright/test";

const outDir = process.argv[2] ?? "/tmp/pw-shots";
const url = process.argv[3] ?? "http://127.0.0.1:3210/";
await mkdir(outDir, { recursive: true });

const positions = [0, 0.08, 0.18, 0.27, 0.36, 0.46, 0.55, 0.66, 0.78, 0.9, 1];

async function shoot(label, context) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  for (const [index, fraction] of positions.entries()) {
    await page.evaluate((f) => {
      const max = document.body.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * f, behavior: "instant" });
    }, fraction);
    await page.waitForTimeout(450);
    await page.screenshot({
      path: `${outDir}/${label}-${String(index).padStart(2, "0")}.png`,
    });
  }
  await page.close();
}

const chrome = await chromium.launch();
const light = await chrome.newContext({ viewport: { width: 1440, height: 900 } });
await shoot("desktop-light", light);
await light.close();

const dark = await chrome.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
await shoot("desktop-dark", dark);
await dark.close();
await chrome.close();

const safari = await webkit.launch();
const phone = await safari.newContext(devices["iPhone 13"]);
await shoot("mobile-light", phone);
await phone.close();
await safari.close();

console.log(`shots written to ${outDir}`);
