// Diagnostic helper: reports pinned stage opacity alongside the measured
// scroll progress of the section, so the two can be compared.
// Usage: node scripts/probe-stages.mjs [selector]
import { chromium } from "@playwright/test";

const selector = process.argv[2] ?? "#coach";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://127.0.0.1:3210/", { waitUntil: "networkidle" });

for (const fraction of [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6]) {
  await page.evaluate((f) => {
    const max = document.body.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * f, behavior: "instant" });
  }, fraction);
  await page.waitForTimeout(350);

  const data = await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    const track = section.querySelector("[style*='svh'], [style*='px']");
    const rect = track ? track.getBoundingClientRect() : null;
    const progress = rect
      ? (0 - rect.top) / (rect.height - window.innerHeight)
      : null;
    const stages = Array.from(
      section.querySelectorAll("h3.font-bold, h3[class*='font-bold']"),
    ).map((heading) => ({
      text: heading.textContent.slice(0, 22),
      opacity: Number(getComputedStyle(heading.parentElement).opacity).toFixed(
        2,
      ),
    }));
    return { progress: progress?.toFixed(3), stages };
  }, selector);

  console.log(fraction, JSON.stringify(data));
}

await browser.close();
