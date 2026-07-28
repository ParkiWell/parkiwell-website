import { expect, test, type Page } from "@playwright/test";
import { tones } from "../src/lib/tones";

const routes = ["/", "/support", "/privacy", "/terms"];

async function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test.describe("every page", () => {
  for (const route of routes) {
    test(`renders ${route} without console errors or sideways scroll`, async ({
      page,
    }) => {
      const errors = await collectConsoleErrors(page);
      await page.goto(route, { waitUntil: "networkidle" });

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toBeVisible();

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, "no horizontal overflow").toBeLessThanOrEqual(1);

      expect(errors, errors.join("\n")).toEqual([]);
    });
  }
});

test("images all carry alt text and explicit dimensions", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const images = page.locator("img");
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const image = images.nth(index);
    const alt = await image.getAttribute("alt");
    expect(alt, `image ${index} has an alt attribute`).not.toBeNull();
    expect(await image.getAttribute("width")).not.toBeNull();
    expect(await image.getAttribute("height")).not.toBeNull();
  }
});

test("the day journey advances as the page scrolls", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const journey = page.locator("#day");
  await journey.scrollIntoViewIfNeeded();

  const firstStage = page.locator("h3:visible", {
    hasText: "Notice how today feels",
  });
  await expect(firstStage).toBeVisible();

  const box = await journey.boundingBox();
  expect(box).not.toBeNull();
  // Mobile WebKit has no wheel emulation, so drive the scroll position directly.
  await page.evaluate(
    (distance) => window.scrollBy({ top: distance, behavior: "instant" }),
    (box?.height ?? 2000) * 0.72,
  );
  await page.waitForTimeout(600);

  await expect(
    page.locator("h3:visible", { hasText: "Keep support within reach" }),
  ).toBeVisible();
});

test("theme toggle switches and persists", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");

  await page.getByRole("button", { name: /Use (light|dark) theme/ }).click();
  const after = await html.getAttribute("data-theme");
  expect(after).not.toBe(before);

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", after ?? "dark");
});

test("chapter screenshots are decoded before a theme switch", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const darkScreens = page.locator('img[src*="-dark-v2.webp"]');
  await expect(darkScreens).toHaveCount(8);

  for (let index = 0; index < (await darkScreens.count()); index += 1) {
    const screen = darkScreens.nth(index);
    await expect(screen).toHaveAttribute("loading", "eager");
    expect(
      await screen.evaluate(
        (image) =>
          (image as HTMLImageElement).complete &&
          (image as HTMLImageElement).naturalWidth > 0,
      ),
    ).toBe(true);
  }
});

test("questions start collapsed and open on request", async ({ page }) => {
  await page.goto("/#questions");
  const firstQuestion = page.getByRole("button", {
    name: "Can I use ParkiWell without a connection?",
  });

  await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
  await firstQuestion.click();
  await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("Records live on your device and stay available offline."),
  ).toBeVisible();
});

// Mobile Safari does not move focus to links on Tab, so this is a desktop check.
test("keyboard users get a skip link", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop keyboard behaviour");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveText(/Skip to content/);
});

test("reduced motion renders the full story without pinning", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(
    page.getByText("Notice how today feels").first(),
  ).toBeVisible();
  await expect(
    page.getByText("Keep support within reach").first(),
  ).toBeVisible();
  await expect(
    page.getByText("Exploring a future movement coach.").first(),
  ).toBeVisible();

  await context.close();
});

// Branching the markup on the reduced motion query used to fail hydration.
// React recovered by rebuilding from the JSX, which reconciles <html> and threw
// away the data-theme attribute the theme script sets before first paint, so
// anyone who asked for less movement also lost dark mode.
test("reduced motion keeps the chosen theme and a clean console", async ({
  browser,
}) => {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    colorScheme: "dark",
  });
  const page = await context.newPage();
  const errors = await collectConsoleErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors, errors.join("\n")).toEqual([]);

  await context.close();
});

test("security headers are present", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  const csp = headers["content-security-policy"];

  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  // The site posts nowhere, so an injected form should have no destination.
  expect(csp).toContain("form-action 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["permissions-policy"]).toContain("microphone=()");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
  expect(headers["x-permitted-cross-domain-policies"]).toBe("none");
  expect(headers["strict-transport-security"]).toContain("includeSubDomains");
  expect(headers["x-powered-by"]).toBeUndefined();
});

// Share cards and favicons are fetched by other origins, so they are the one
// place the same-origin resource policy would break something real.
test("brand artwork stays embeddable and cacheable", async ({ request }) => {
  const response = await request.get("/brand/icon-512.png");
  const headers = response.headers();

  expect(response.status()).toBe(200);
  expect(headers["cross-origin-resource-policy"]).toBe("cross-origin");
  expect(headers["cache-control"]).toContain("immutable");
});

test("legal pages render markdown without executing it", async ({ page }) => {
  await page.goto("/privacy", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".prose-legal h2").first()).toBeVisible();

  const unsafe = await page.$$eval(".prose-legal a[href]", (links) =>
    links
      .map((link) => link.getAttribute("href") ?? "")
      .filter((href) => !/^(https?:|mailto:|\/|#)/i.test(href)),
  );
  expect(unsafe, "no javascript: or data: links").toEqual([]);
  expect(await page.locator(".prose-legal script").count()).toBe(0);
});

test("copy avoids em dashes", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const text = await page.locator("body").innerText();
    expect(text.includes("—"), `${route} contains an em dash`).toBe(false);
  }
});

test.describe("the launch list", () => {
  test("every call to action lands on it", async ({ page }, testInfo) => {
    const mobile = testInfo.project.name === "mobile";
    await page.goto("/", { waitUntil: "networkidle" });

    if (mobile) await page.getByRole("button", { name: "Open menu" }).click();
    const scope = mobile ? page.locator("#mobile-nav") : page.locator("header");
    await scope.getByRole("link", { name: "Join the launch list" }).click();

    const section = page.locator("#get");
    await expect(section).toBeInViewport();
    await expect(
      section.getByRole("link", { name: /Tell me when it launches/ }),
    ).toBeVisible();
  });

  test("reaches it from another page too", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one navigation is enough");
    await page.goto("/support", { waitUntil: "networkidle" });
    await page
      .locator("header")
      .getByRole("link", { name: "Join the launch list" })
      .click();

    await expect(page).toHaveURL(/\/#get$/);
    await expect(page.locator("#get")).toBeInViewport();
  });

  // A mailto: link is silent on a machine with no mail client, so the address
  // has to be readable and copyable on the page itself.
  test("offers the address even without a mail client", async ({
    page,
    context,
  }, testInfo) => {
    await page.goto("/#get", { waitUntil: "networkidle" });
    const section = page.locator("#get");

    await expect(
      section.getByRole("link", { name: /Tell me when it launches/ }),
    ).toHaveAttribute("href", /^mailto:.+@.+\?subject=/);
    const address = section.locator('a[href^="mailto:"]').last();
    await expect(address).toHaveText(/@/);

    test.skip(
      testInfo.project.name !== "desktop",
      "clipboard permissions are a desktop check",
    );
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await section.getByRole("button", { name: "Copy address" }).click();
    await expect(
      section.getByRole("button", { name: "Copied" }),
    ).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      "@",
    );
  });
});

test.describe("the chapter blend", () => {
  // The pinned day sequence interpolates its background in JavaScript, so it
  // reads the scale from src/lib/tones.ts while every other chapter reads the
  // --tone-* custom properties. Drift between the two puts a seam back.
  test("the tone scale in CSS matches the one in TypeScript", async ({
    page,
  }) => {
    await page.goto("/");

    for (const theme of ["light", "dark"] as const) {
      await page.evaluate(
        (value) => document.documentElement.setAttribute("data-theme", value),
        theme,
      );
      const fromCss = await page.evaluate((count) => {
        const style = getComputedStyle(document.documentElement);
        return Array.from({ length: count }, (_, index) =>
          style.getPropertyValue(`--tone-${index}`).trim(),
        );
      }, tones[theme].length);
      expect(fromCss, `${theme} tones`).toEqual([...tones[theme]]);
    }
  });

  // Neighbouring chapters have to start and end on the same tone, or the page
  // steps between colours instead of moving through them.
  test("no chapter boundary shows a hard edge", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one viewport is enough");
    await page.goto("/", { waitUntil: "networkidle" });

    const seams = await page.evaluate(() => {
      const chapters = Array.from(
        document.querySelectorAll<HTMLElement>("[data-chapter]"),
      );
      const edge = (element: HTMLElement, side: "from" | "to") =>
        getComputedStyle(element).getPropertyValue(`--chapter-${side}`).trim();

      const found: string[] = [];
      for (let i = 1; i < chapters.length; i += 1) {
        const end = edge(chapters[i - 1], "to");
        const start = edge(chapters[i], "from");
        if (!/^#[0-9a-f]{6}$/i.test(end)) {
          found.push(`${chapters[i - 1].dataset.chapter} has no end tone`);
        }
        if (end !== start) {
          found.push(
            `${chapters[i - 1].dataset.chapter} ends ${end}, ` +
              `${chapters[i].dataset.chapter} starts ${start}`,
          );
        }
      }
      return { found, count: chapters.length };
    });

    expect(seams.count, "every chapter is marked up").toBe(10);
    expect(seams.found, seams.found.join("\n")).toEqual([]);
  });
});
