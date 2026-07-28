// Diagnostic helper: lists elements that stick out past the viewport width.
// Usage: node scripts/find-overflow.mjs [url] [chromium|webkit] [width]
import { chromium, devices, webkit } from "@playwright/test";

const url = process.argv[2] ?? "http://127.0.0.1:3210/";
const engine = process.argv[3] ?? "chromium";
const width = Number(process.argv[4] ?? 390);

const browserType = engine === "webkit" ? webkit : chromium;
const browser = await browserType.launch();
const context = await browser.newContext(
  engine === "webkit"
    ? devices["iPhone 13"]
    : { viewport: { width, height: 844 } },
);
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });

const report = await page.evaluate(() => {
  const docWidth = document.documentElement.clientWidth;
  const describe = (element) =>
    `${element.tagName.toLowerCase()}.${String(element.className ?? "")
      .split(" ")
      .slice(0, 4)
      .join(".")}`;

  const offenders = [];
  document.querySelectorAll("*").forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.right > docWidth + 1 || rect.left < -1) {
      const chain = [];
      let node = element;
      while (node && node !== document.body && chain.length < 6) {
        const nodeRect = node.getBoundingClientRect();
        chain.push(`${describe(node)} [${Math.round(nodeRect.width)}px]`);
        node = node.parentElement;
      }
      offenders.push({
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        chain,
      });
    }
  });
  return {
    docWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: offenders.slice(0, 3),
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
