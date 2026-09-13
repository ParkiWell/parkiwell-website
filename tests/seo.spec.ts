import { expect, test } from "@playwright/test";

const origin = "https://parkiwell.com";
const routes = [
  "/",
  "/features",
  "/features/symptom-tracking",
  "/features/medication-reminders",
  "/features/speech-movement-practice",
  "/support",
  "/privacy",
  "/terms",
];

test("every indexable page ships unique, consistent metadata without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const route of routes) {
    const response = await page.goto(`http://127.0.0.1:3210${route}`);
    expect(response?.status(), route).toBe(200);
    const title = await page.title();
    const description = await page
      .locator('head meta[name="description"]')
      .getAttribute("content");
    expect(title, route).toMatch(/\| ParkiWell$/);
    expect(title.match(/ParkiWell/g), route).toHaveLength(1);
    expect(description?.length, route).toBeGreaterThan(70);
    expect(titles.has(title), `unique title: ${route}`).toBe(false);
    expect(descriptions.has(description!), `unique description: ${route}`).toBe(
      false,
    );
    titles.add(title);
    descriptions.add(description!);

    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
    const canonical = await page
      .locator('head link[rel="canonical"]')
      .getAttribute("href");
    expect(new URL(canonical!).href).toBe(`${origin}${route}`);
    const socialUrl = await page
      .locator('head meta[property="og:url"]')
      .getAttribute("content");
    expect(new URL(socialUrl!).href).toBe(`${origin}${route}`);
    await expect(
      page.locator('head meta[property="og:title"]'),
    ).toHaveAttribute("content", title);
    await expect(
      page.locator('head meta[property="og:description"]'),
    ).toHaveAttribute("content", description!);
    await expect(
      page.locator('head meta[name="twitter:title"]'),
    ).toHaveAttribute("content", title);
    await expect(
      page.locator('head meta[name="twitter:card"]'),
    ).toHaveAttribute("content", "summary_large_image");
    await expect(
      page.locator('head meta[property="og:image:width"]'),
    ).toHaveAttribute("content", "1200");
    await expect(
      page.locator('head meta[property="og:image:height"]'),
    ).toHaveAttribute("content", "630");
    const image = await page
      .locator('head meta[property="og:image"]')
      .getAttribute("content");
    expect(image).toMatch(
      /^https:\/\/parkiwell\.com\/brand\/social-card-[a-f0-9]+\.png$/,
    );
    const imageResponse = await context.request.get(
      `http://127.0.0.1:3210${new URL(image!).pathname}`,
    );
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()["content-type"]).toContain("image/png");
    expect(imageResponse.headers()["cross-origin-resource-policy"]).toBe(
      "cross-origin",
    );
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await page.locator("body").innerText()).not.toContain("\u2014");
    expect(
      await page.locator('meta[name="robots"]').getAttribute("content"),
    ).not.toContain("noindex");
  }
  await context.close();
});

test("FAQ answers are in the HTML and usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3210/");
  const answers = page.locator("#questions details p");
  await expect(answers).toHaveCount(7);
  expect(await answers.allTextContents()).toContain(
    "ParkiWell is free to use, with no ads or data sales.",
  );
  const firstQuestion = page.locator("#questions details").first();
  await firstQuestion.locator("summary").click();
  await expect(firstQuestion.locator("p")).toBeVisible();
  await firstQuestion.locator("summary").click();
  await expect(firstQuestion.locator("p")).not.toBeVisible();
  await expect(page.locator(".journey-stacked")).toBeVisible();
  await expect(page.locator("#future h2")).toBeVisible();
  await context.close();
});

test("only the hero screenshots are preloaded ahead of page content", async ({
  page,
}) => {
  await page.goto("/");
  const preloads = await page
    .locator('head link[rel="preload"][as="image"]')
    .evaluateAll((links) =>
      links.map(
        (link) =>
          link.getAttribute("imagesrcset") || link.getAttribute("href") || "",
      ),
    );
  expect(preloads).toHaveLength(2);
  for (const preload of preloads) expect(preload).toContain("welcome");
  await expect(
    page.locator(
      '.story-device [data-phone-screen]:not([data-phone-screen="welcome"]) img[fetchpriority="low"]',
    ),
  ).toHaveCount(8);
});

test("feature pages have working crawlable links and matching breadcrumbs", async ({
  page,
  request,
}) => {
  await page.goto("/features");
  for (const route of routes.filter((route) =>
    route.startsWith("/features/"),
  )) {
    await expect(page.locator(`main a[href="${route}"]`).first()).toBeVisible();
  }

  for (const route of routes.filter((route) => route.startsWith("/features"))) {
    await page.goto(route);
    const data = JSON.parse(
      await page.locator('script[type="application/ld+json"]').innerText(),
    );
    expect(data["@type"]).toBe("BreadcrumbList");
    const crumbs = await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .locator("li")
      .allTextContents();
    expect(data.itemListElement).toHaveLength(crumbs.length);
    for (const [index, item] of data.itemListElement.entries()) {
      expect(item.position).toBe(index + 1);
      expect(crumbs[index]).toContain(item.name);
    }
    expect(data.itemListElement.at(-1).item).toBe(`${origin}${route}`);
    const links = await page
      .locator('main a[href^="/"]')
      .evaluateAll((links) => [
        ...new Set(
          links.map((link) => link.getAttribute("href")!.split("#")[0] || "/"),
        ),
      ]);
    for (const link of links)
      expect((await request.get(link)).status(), link).toBe(200);
  }
});

test("home structured data identifies the real website and support contact", async ({
  page,
}) => {
  await page.goto("/");
  const data = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  expect(data["@context"]).toBe("https://schema.org");
  const website = data["@graph"].find(
    (item: { "@type": string }) => item["@type"] === "WebSite",
  );
  const organization = data["@graph"].find(
    (item: { "@type": string }) => item["@type"] === "Organization",
  );
  expect(website.name).toBe("ParkiWell");
  expect(website.url).toBe(`${origin}/`);
  expect(website.publisher["@id"]).toBe(organization["@id"]);
  await expect(
    page.locator(`footer a[href="mailto:${organization.email}"]`),
  ).toHaveCount(1);
  expect(organization.contactPoint.url).toBe(`${origin}/support`);
  expect(JSON.stringify(data)).not.toMatch(
    /aggregateRating|reviewRating|MedicalOrganization/,
  );
});

test("sitemap lists canonical pages and real images without artificial update dates", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(urls.sort()).toEqual(
    routes.map((route) => `${origin}${route}`).sort(),
  );
  expect(xml).not.toContain("<lastmod>");
  const images = [
    ...new Set(
      [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(
        (match) => match[1],
      ),
    ),
  ];
  expect(images.length).toBeGreaterThan(0);
  for (const image of images)
    expect((await request.get(new URL(image).pathname)).status()).toBe(200);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
  expect(robots).not.toMatch(/Disallow:\s*\/$/m);
});

test("www redirects permanently and preserves the path and query", async ({
  request,
}) => {
  const response = await request.get("/features/symptom-tracking?source=test", {
    headers: { host: "www.parkiwell.com" },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe(
    `${origin}/features/symptom-tracking?source=test`,
  );
});

test("unknown URLs return a real non-indexable 404", async ({ request }) => {
  for (const route of ["/does-not-exist", "/features/does-not-exist"]) {
    const response = await request.get(route);
    expect(response.status()).toBe(404);
    expect(await response.text()).toMatch(
      /<meta name="robots" content="[^"]*noindex/,
    );
  }
});
