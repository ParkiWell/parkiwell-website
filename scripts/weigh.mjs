// Reports the transfer size of everything the home page loads.
// Usage: node scripts/weigh.mjs [url]
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://127.0.0.1:3210/";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const byType = new Map();
let total = 0;

page.on("response", async (response) => {
  try {
    const headers = response.headers();
    const length = Number(headers["content-length"] ?? 0);
    const size = length || (await response.body().catch(() => Buffer.alloc(0))).length;
    const type = (headers["content-type"] ?? "other").split(";")[0];
    byType.set(type, (byType.get(type) ?? 0) + size);
    total += size;
  } catch {
    // A response body can be unavailable if the request was aborted.
  }
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
for (const [type, size] of [...byType].sort((a, b) => b[1] - a[1])) {
  console.log(`${kb(size).padStart(10)}  ${type}`);
}
console.log(`${kb(total).padStart(10)}  TOTAL`);

await browser.close();
