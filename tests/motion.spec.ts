import { expect, test } from "@playwright/test";
import { JOURNEY_ENTER, JOURNEY_FINISH } from "../src/lib/story";

test("the phone never overlays screenshot text during forward or reverse handovers", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "mobile uses the stacked tour",
  );
  await page.goto("/", { waitUntil: "networkidle" });
  const result = await page.evaluate(
    async ({ enter, finish }) => {
      document.documentElement.dataset.scrollLocked = "true";
      const track = document.querySelector<HTMLElement>(".journey-pinned")!;
      const top = track.getBoundingClientRect().top + scrollY;
      const distance = track.offsetHeight - innerHeight;
      const frames: {
        visible: string[];
        drifting: boolean;
        scaled: boolean;
      }[] = [];
      const visit = async (progress: number) => {
        window.scrollTo({
          top: top + distance * (enter + progress * (finish - enter)),
          behavior: "instant",
        });
        await new Promise(requestAnimationFrame);
        const screens = [
          ...document.querySelectorAll<HTMLElement>("[data-phone-screen]"),
        ];
        frames.push({
          visible: screens
            .filter(
              (screen) =>
                Number(getComputedStyle(screen).opacity) > 0.001 &&
                getComputedStyle(screen).visibility !== "hidden",
            )
            .map((screen) => screen.dataset.phoneScreen!),
          drifting: screens.some((screen) => {
            const style = getComputedStyle(screen);
            const opacity = Number(style.opacity);
            return (
              opacity > 0.05 &&
              opacity < 0.95 &&
              Math.abs(new DOMMatrix(style.transform).m42) > 0.1
            );
          }),
          scaled: screens.some(
            (screen) =>
              Math.abs(
                new DOMMatrix(getComputedStyle(screen).transform).m11 - 1,
              ) > 0.001,
          ),
        });
      };
      for (let frame = 0; frame <= 100; frame++) await visit(frame / 100);
      for (let frame = 100; frame >= 0; frame--) await visit(frame / 100);
      return frames;
    },
    { enter: JOURNEY_ENTER, finish: JOURNEY_FINISH },
  );

  expect(
    result.filter((frame) => frame.visible.length > 1),
    "one screenshot at a time, including intermediate frames",
  ).toEqual([]);
  expect(
    result.some((frame) => frame.drifting),
    "screens visibly animate between settled states",
  ).toBe(true);
  expect(
    result.some((frame) => frame.scaled),
    "text does not shimmer from screenshot scaling",
  ).toBe(false);
  const seen = new Set(result.flatMap((frame) => frame.visible));
  for (const screen of [
    "Symptom records",
    "Medications",
    "Guided practice",
    "Support resources",
  ])
    expect(seen.has(screen)).toBe(true);
});

test("the closing phones finish at rest and do not rewind with the scroll", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.dataset.scrollLocked = "true";
    const section = document.querySelector<HTMLElement>("#get")!;
    window.scrollTo({
      top: section.offsetTop - innerHeight * 0.55,
      behavior: "instant",
    });
  });
  // The entrance must wait for the phone area, rather than play below the fold.
  await page.waitForTimeout(200);
  expect(
    await page
      .locator(".closing-phone--centre")
      .evaluate(
        (phone) => new DOMMatrix(getComputedStyle(phone).transform).m42,
      ),
  ).toBeGreaterThan(50);
  const sampledY = await page.evaluate(async () => {
    const fan = document.querySelector<HTMLElement>(".closing-fan")!;
    const centre = document.querySelector<HTMLElement>(
      ".closing-phone--centre",
    )!;
    window.scrollTo({
      top: fan.getBoundingClientRect().top + scrollY - innerHeight * 0.65,
      behavior: "instant",
    });
    const values: number[] = [];
    const start = performance.now();
    while (performance.now() - start < 1400) {
      values.push(new DOMMatrix(getComputedStyle(centre).transform).m42);
      await new Promise(requestAnimationFrame);
    }
    return values;
  });
  expect(
    new Set(sampledY.map((value) => Math.round(value))).size,
    "a visible entrance with intermediate positions",
  ).toBeGreaterThan(5);
  expect(sampledY.at(-1)).toBeLessThan(0.1);
  const phones = page.locator(".closing-phone");
  await expect
    .poll(() =>
      phones.evaluateAll((phones) =>
        phones.every((phone) => {
          const transform = new DOMMatrix(getComputedStyle(phone).transform);
          return Math.abs(transform.m42) < 0.01;
        }),
      ),
    )
    .toBe(true);

  const settled = await phones.evaluateAll((phones) =>
    phones.map((phone) => getComputedStyle(phone).transform),
  );
  await page.evaluate(() =>
    window.scrollBy({ top: -innerHeight, behavior: "instant" }),
  );
  await page.waitForTimeout(150);
  expect(
    await phones.evaluateAll((phones) =>
      phones.map((phone) => getComputedStyle(phone).transform),
    ),
  ).toEqual(settled);
  await page.locator("#get").scrollIntoViewIfNeeded();
  expect(
    await phones.evaluateAll((phones) =>
      phones.map((phone) => getComputedStyle(phone).transform),
    ),
  ).toEqual(settled);
});

test("the closing stays within one desktop viewport and keeps large phones", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "900px desktop composition");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#get", { waitUntil: "networkidle" });
  expect(
    await page
      .locator("#get")
      .evaluate((section) => section.getBoundingClientRect().height),
  ).toBeLessThanOrEqual(900);
  expect(
    await page
      .locator(".closing-phone--centre")
      .evaluate((phone) => (phone as HTMLElement).offsetWidth),
  ).toBeGreaterThanOrEqual(260);
  await expect(page.locator("#get h2")).toBeVisible();
});

test("the coach moves at rest and pauses offscreen without resetting its pose", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const arm = page.locator(".movement-arm--left");
  await expect(arm).toHaveCSS("animation-play-state", "paused");
  await page.evaluate(() => {
    document.documentElement.dataset.scrollLocked = "true";
    document
      .querySelector(".movement-scene")!
      .scrollIntoView({ block: "center" });
  });
  await expect(arm).toHaveCSS("animation-play-state", "running");
  const positions = await arm.evaluate(async (arm) => {
    const samples: number[] = [];
    const start = performance.now();
    while (performance.now() - start < 2300) {
      samples.push(new DOMMatrix(getComputedStyle(arm).transform).m12);
      await new Promise(requestAnimationFrame);
    }
    return samples;
  });
  expect(
    new Set(positions.map((value) => value.toFixed(3))).size,
    "the arms keep lifting smoothly with no scrolling",
  ).toBeGreaterThan(10);
  expect(positions.at(-1)).toBeGreaterThan(positions[0] + 0.1);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(arm).toHaveCSS("animation-play-state", "paused");
  const pausedPose = await arm.evaluate(
    (arm) => getComputedStyle(arm).transform,
  );
  await page.waitForTimeout(250);
  expect(await arm.evaluate((arm) => getComputedStyle(arm).transform)).toBe(
    pausedPose,
  );
  expect(
    await arm.evaluate(
      (arm) => new DOMMatrix(getComputedStyle(arm).transform).m12,
    ),
  ).toBeGreaterThan(0.1);
});

test("the coach stage eases through a fast scroll to either boundary", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "mobile uses the unpinned stage",
  );
  await page.goto("/", { waitUntil: "networkidle" });
  const turns = await page.evaluate(async () => {
    document.documentElement.dataset.scrollLocked = "true";
    const chapter = document.querySelector<HTMLElement>("#future")!;
    const stage = document.querySelector<HTMLElement>(".movement-space")!;
    const top = chapter.getBoundingClientRect().top + scrollY;
    const distance = chapter.offsetHeight - innerHeight;
    const sample = async (progress: number) => {
      window.scrollTo({ top: top + distance * progress, behavior: "instant" });
      const values: number[] = [];
      const start = performance.now();
      while (performance.now() - start < 1600) {
        values.push(new DOMMatrix(getComputedStyle(stage).transform).m13);
        await new Promise(requestAnimationFrame);
      }
      return values;
    };
    return [await sample(1), await sample(0)];
  });
  for (const turn of turns) {
    expect(
      new Set(turn.map((value) => value.toFixed(3))).size,
      "the stage travels through intermediate angles after scrolling stops",
    ).toBeGreaterThan(15);
    expect(Math.abs(turn.at(-1)! - turn[0])).toBeGreaterThan(0.2);
    expect(
      Math.max(
        ...turn.slice(1).map((value, index) => Math.abs(value - turn[index])),
      ),
    ).toBeLessThan(0.08);
  }
});

test("reduced motion starts with the finished fan and preserves dark mode", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#get", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page
      .locator(".closing-phone")
      .evaluateAll((phones) =>
        phones.every(
          (phone) =>
            Math.abs(new DOMMatrix(getComputedStyle(phone).transform).m42) <
            0.01,
        ),
      ),
  ).toBe(true);
  await page.locator(".movement-scene").scrollIntoViewIfNeeded();
  await expect(page.locator(".movement-arm--left")).toHaveCSS(
    "animation-iteration-count",
    "1",
  );
  await expect
    .poll(() =>
      page
        .locator(".movement-arm--left")
        .evaluate((arm) => new DOMMatrix(getComputedStyle(arm).transform).m12),
    )
    .toBe(0);
  expect(errors).toEqual([]);
});
