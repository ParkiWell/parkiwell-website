import { expect, test, type Page } from "@playwright/test";
import { tones } from "../src/lib/tones";

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
    hasText: "Review your symptoms",
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
    page.locator("h3:visible", { hasText: "Access support resources" }),
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

test("phone images defer offscreen work and both themes load together", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  // The shared story phone preloads its layers to keep stage handovers smooth.
  // Stacked and closing phones can wait until they approach the viewport.
  await expect(page.locator('.story-device img[loading="eager"]')).toHaveCount(
    10,
  );
  await expect(
    page.locator('.journey-stacked img[loading="lazy"]'),
  ).toHaveCount(8);
  await expect(page.locator('.closing-fan img[loading="lazy"]')).toHaveCount(6);

  await page.locator("#get").scrollIntoViewIfNeeded();
  const closingImages = page.locator(".closing-fan img");
  await expect
    .poll(() =>
      closingImages.evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: /Use (light|dark) theme/ }).click();
  await expect(page.locator(".closing-fan")).toBeVisible();
});

test("questions start collapsed and open on request", async ({ page }) => {
  await page.goto("/#questions");
  const question = page
    .locator("#questions details")
    .filter({ hasText: "Can I use ParkiWell without a connection?" });
  await expect(question).not.toHaveAttribute("open");
  await question.locator("summary").click();
  await expect(question).toHaveAttribute("open", "");
  await expect(question.locator("p")).toContainText(
    "Records live on your device and stay available offline.",
  );
  await expect(question.locator("p")).toBeVisible();
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

  await expect(page.getByText("Review your symptoms").first()).toBeVisible();
  await expect(
    page.getByText("Access support resources").first(),
  ).toBeVisible();
  await expect(
    page.getByText("Guided movement practice.").first(),
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
  // The launch list posts here; an injected form must not reach anywhere else.
  expect(csp).toContain("form-action 'self'");
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
    await expect(section.getByRole("textbox")).toBeVisible();
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

  test("is a real form that posts to this origin", async ({ page }) => {
    await page.goto("/#get", { waitUntil: "networkidle" });
    const form = page.locator("#get form");

    // It has to work with no JavaScript as well, which means a real action.
    await expect(form).toHaveAttribute("action", "/api/launch-list");
    await expect(form).toHaveAttribute("method", "post");
    await expect(form.getByRole("textbox")).toHaveAttribute("type", "email");
    await expect(
      form.getByRole("button", { name: /Join the launch list/ }),
    ).toBeVisible();
  });

  // Filled in only by something that cannot see the page.
  test("carries a trap no person can reach", async ({ page }) => {
    await page.goto("/#get", { waitUntil: "networkidle" });
    const trap = page.locator('#get input[name="company"]');

    await expect(trap).toHaveCount(1);
    await expect(trap).toBeHidden();
    await expect(trap).toHaveAttribute("tabindex", "-1");
    await expect(trap).toHaveAttribute("aria-hidden", "true");
  });

  // The suite runs with the launch list credentials blanked (see
  // playwright.config.ts), so this is the degraded path on purpose: it must
  // name a way through rather than fail quietly.
  test("says so when the list cannot take the address", async ({ page }) => {
    await page.goto("/#get", { waitUntil: "networkidle" });
    // Past the window that turns away a script driving the form instantly.
    await page.waitForTimeout(600);
    await page
      .locator("#get form")
      .getByRole("textbox")
      .fill("reader@example.com");
    await page.locator("#get form").getByRole("button").click();

    await expect(page.locator("#get").getByRole("alert")).toContainText(
      /Email .+@.+/,
    );
  });

  test("turns away an address that is not one", async ({ page }) => {
    await page.goto("/#get", { waitUntil: "networkidle" });
    // Past the window that turns away a script driving the form instantly.
    await page.waitForTimeout(600);
    await page.locator("#get form").getByRole("textbox").fill("not-an-address");
    await page.locator("#get form").getByRole("button").click();

    await expect(page.locator("#get").getByRole("alert")).toContainText(
      /does not look/,
    );
  });
});

test.describe("the launch list endpoint", () => {
  test("rejects what is not an address", async ({ request }) => {
    const response = await request.post("/api/launch-list", {
      headers: { accept: "application/json" },
      data: { email: "nope", startedAt: 1 },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).state).toBe("invalid");
  });

  // A caught bot must not learn that it was caught.
  test("answers a filled trap exactly like a success", async ({ request }) => {
    const response = await request.post("/api/launch-list", {
      headers: { accept: "application/json" },
      data: { email: "bot@example.com", company: "Acme", startedAt: 1 },
    });
    expect(response.status()).toBe(200);
    expect((await response.json()).state).toBe("ok");
  });

  test("answers an instant submission the same way", async ({ request }) => {
    const response = await request.post("/api/launch-list", {
      headers: { accept: "application/json" },
      data: { email: "fast@example.com", startedAt: Date.now() },
    });
    expect((await response.json()).state).toBe("ok");
  });

  test("is write only", async ({ request }) => {
    const response = await request.get("/api/launch-list");
    expect(response.status()).toBe(405);
  });

  test("a form post with no JavaScript comes back to the list", async ({
    request,
  }) => {
    const response = await request.post("/api/launch-list", {
      form: { email: "reader@example.com" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(303);
    // Relative, so it always sends the visitor back to the host they came
    // from rather than whatever hostname the server thinks it has.
    expect(response.headers()["location"]).toBe("/?launch=unavailable#get");
  });
});

test.describe("scroll gravity", () => {
  // The pull is JavaScript on a pointer device and native snapping on touch.
  // Neither runs when the visitor has asked for less movement.
  test("touch gets native snapping, and stillness gets neither", async ({
    browser,
  }, testInfo) => {
    const snap = async (options: Parameters<typeof browser.newContext>[0]) => {
      const context = await browser.newContext(options);
      const page = await context.newPage();
      await page.goto("/");
      const value = await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollSnapType,
      );
      await context.close();
      return value;
    };

    if (testInfo.project.name === "mobile") {
      expect(await snap({ ...testInfo.project.use })).toMatch(
        /^y( proximity)?$/,
      );
    } else {
      expect(await snap({})).toBe("none");
    }
    expect(
      await snap({ ...testInfo.project.use, reducedMotion: "reduce" }),
    ).toBe("none");
  });

  test("a long scroll is never held back", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "wheel input is desktop");
    await page.goto("/", { waitUntil: "networkidle" });

    for (let i = 0; i < 14; i += 1) await page.mouse.wheel(0, 900);
    await page.waitForTimeout(2000);

    const { scrolled, furthest } = await page.evaluate(() => ({
      scrolled: window.scrollY,
      furthest: document.documentElement.scrollHeight - window.innerHeight,
    }));
    expect(scrolled, "reaches the end of the page in one go").toBeGreaterThan(
      furthest * 0.9,
    );
  });

  // The end of the page is somewhere you are allowed to be. Without this the
  // last chapter's pull wins and quietly drags the footer back off screen.
  test("the end of the page is a place to stop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "gravity is pointer only");
    await page.goto("/", { waitUntil: "networkidle" });

    const furthest = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      furthest - 40,
    );
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(2000);

    expect(await page.evaluate(() => window.scrollY)).toBe(furthest);
    await expect(page.locator("footer")).toBeInViewport();
  });

  test("drifts onto a chapter rather than jumping to it", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "gravity is pointer only");
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const privacy = await page.evaluate(() => {
      const box = document.querySelector("#privacy")!.getBoundingClientRect();
      return Math.round(
        box.top + window.scrollY + box.height / 2 - window.innerHeight / 2,
      );
    });

    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      privacy - 170,
    );
    await page.mouse.wheel(0, 100);

    const trace = await page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const seen: number[] = [];
          const started = performance.now();
          const tick = () => {
            seen.push(Math.round(window.scrollY));
            if (performance.now() - started < 1800) requestAnimationFrame(tick);
            else resolve(seen);
          };
          tick();
        }),
    );

    // Arrives, over many frames rather than one, and gives a little at the end.
    expect(trace.at(-1)).toBe(privacy);
    expect(new Set(trace).size, "moves across many frames").toBeGreaterThan(15);
    expect(Math.max(...trace), "overshoots before settling").toBeGreaterThan(
      privacy,
    );
  });

  test("yields to the visitor mid settle", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "gravity is pointer only");
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    await page.evaluate(() =>
      window.scrollTo({ top: 1200, behavior: "instant" }),
    );
    await page.waitForTimeout(300); // past the rest window: the settle is under way
    await page.mouse.wheel(0, 600);
    // The wheel lands, over however many frames the browser takes to apply it.
    await page.waitForFunction(() => window.scrollY > 1200);
    await page.waitForTimeout(400);

    // And it stays landed: no settle quietly drags the page back up.
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1200);
  });

  test("the day step buttons come to rest where the steps settle", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "pinned layout is desktop");
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const rulers = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>('[data-settle="1.35"]'),
      ).map((element) => {
        const box = element.getBoundingClientRect();
        return Math.round(
          box.top + window.scrollY + box.height / 2 - window.innerHeight / 2,
        );
      }),
    );
    expect(rulers).toHaveLength(4);

    for (const [index, ruler] of rulers.entries()) {
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.waitForTimeout(400);
      await page.locator("#day button").nth(index).click();
      await page.waitForTimeout(2400);
      const at = await page.evaluate(() => window.scrollY);
      expect(
        Math.abs(at - ruler),
        `step ${index + 1} rests where it settles`,
      ).toBeLessThanOrEqual(2);
    }
  });
});

test.describe("the story layer", () => {
  // The hero and the tour share one phone. It has to be the same phone: it
  // lands in the middle of the screen as the hero's copy leaves, and it is
  // still there, unmoved, once the tour has arrived under it.
  test("the phone stays put while the tour arrives", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "pinned layout is desktop");
    await page.goto("/", { waitUntil: "networkidle" });

    const heroHeight = await page.evaluate(
      () => document.querySelector("[data-chapter='hero']")!.clientHeight,
    );
    const centreAt = async (top: number) => {
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        top,
      );
      await page.waitForTimeout(1200);
      return page.evaluate(() => {
        const box = document
          .querySelector(".story-device__phone")!
          .getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      });
    };

    const landed = await centreAt(heroHeight * 0.8);
    const arrived = await centreAt(heroHeight + 200);

    expect(Math.abs(landed.x - 1280 / 2)).toBeLessThan(2);
    expect(Math.abs(arrived.x - landed.x)).toBeLessThan(2);
    expect(Math.abs(arrived.y - landed.y)).toBeLessThan(2);
    await expect(
      page.locator("h3:visible", { hasText: "Review your symptoms" }),
    ).toBeVisible();

    // And it leaves with the tour. A sticky layer pulled over its siblings by
    // a negative margin overstayed by a screen and hung over the privacy
    // chapter, which is why the layer sits in a track of its own.
    const privacyTop = await page.evaluate(() => {
      const box = document.querySelector("#privacy")!.getBoundingClientRect();
      return box.top + window.scrollY;
    });
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      privacyTop,
    );
    await page.waitForTimeout(400);
    const gone = await page.evaluate(
      () =>
        document.querySelector(".story-device__phone")!.getBoundingClientRect()
          .bottom,
    );
    expect(
      gone,
      "the phone has scrolled away above the privacy chapter",
    ).toBeLessThan(0);
  });

  // The tour's panel has to be able to sit above its own top edge while it
  // slides in, and nothing it holds may spill out sideways.
  test("nothing spills sideways at any point in the handover", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "pinned layout is desktop");
    await page.goto("/", { waitUntil: "networkidle" });

    for (const fraction of [0, 0.3, 0.55, 0.8, 1.1]) {
      await page.evaluate(
        (f) =>
          window.scrollTo({
            top:
              document.querySelector("[data-chapter='hero']")!.clientHeight * f,
            behavior: "instant",
          }),
        fraction,
      );
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `no sideways scroll at ${fraction}`).toBeLessThanOrEqual(
        1,
      );
    }
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
