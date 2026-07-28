// Capture a single full-page screenshot per route for review.
// Usage: node scripts/page-shots.mjs [outDir]
import { mkdir } from "node:fs/promises";
import { chromium, devices, webkit } from "@playwright/test";

const outDir = process.argv[2] ?? "/tmp/pw-pages";
const base = "http://127.0.0.1:3210";
const routes = ["/privacy", "/terms", "/support", "/does-not-exist"];
await mkdir(outDir, { recursive: true });

const chrome = await chromium.launch();
const desktop = await chrome.newContext({
  viewport: { width: 1440, height: 900 },
});
for (const route of routes) {
  const page = await desktop.newPage();
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${outDir}/desktop${route.replaceAll("/", "-")}.png`,
  });
  await page.close();
}
await desktop.close();
await chrome.close();

const safari = await webkit.launch();
const phone = await safari.newContext(devices["iPhone 13"]);
for (const route of ["/support", "/privacy"]) {
  const page = await phone.newPage();
  await page.goto(base + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${outDir}/mobile${route.replaceAll("/", "-")}.png`,
  });
  await page.close();
}
await phone.close();
await safari.close();

console.log(`page shots written to ${outDir}`);
