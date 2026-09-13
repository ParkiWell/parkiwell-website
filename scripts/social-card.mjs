// Draw the share card from local brand artwork and an actual product screen.
// Run after changing the screen or the card copy: node scripts/social-card.mjs
//
// The renderer is the one Next uses for Open Graph images. It takes fonts as
// files rather than from the machine, so the card is set in the site's own
// faces and comes out the same everywhere. The faces are fetched from Google
// Fonts on the first run, as static TrueType instances because the renderer
// applies no variation axes, and cached under node_modules/.cache.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import sharp from "sharp";

const { ImageResponse } = createRequire(import.meta.url)("next/og");

const root = new URL("../", import.meta.url);
const cache = new URL("node_modules/.cache/social-card/", root);

// Light theme tokens from globals.css, and the phone frame from .phone-frame.
const paper = "#f4f0e7";
const ink = "#12363a";
const muted = "#4c6567";
const frame = "#20363a";

async function font(family, axes) {
  const file = new URL(
    `${family}-${axes}.ttf`.replace(/[^\w.-]+/g, "-"),
    cache,
  );
  try {
    return await readFile(file);
  } catch {}
  // A browser this old is offered static TrueType instances instead of the
  // variable woff2 the site serves, and TrueType is what the renderer reads.
  // The first face listed is the requested instance.
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:${axes}`,
    { headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64; rv:1.9)" } },
  ).then((response) =>
    response.ok
      ? response.text()
      : Promise.reject(new Error(`${response.status} for ${family} ${axes}`)),
  );
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`no TrueType file offered for ${family} ${axes}`);
  const data = Buffer.from(await (await fetch(url)).arrayBuffer());
  await mkdir(cache, { recursive: true });
  await writeFile(file, data);
  return data;
}

async function dataUri(buffer) {
  const png = await sharp(buffer).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

const screenManifest = await readFile(new URL("src/lib/screens.ts", root), "utf8");
const screen = screenManifest.match(/home: \{\s*light: "([^"]+)"/)[1];
const screenshot = await dataUri(
  await readFile(new URL(`public${screen}`, root)),
);
const mark = await dataUri(
  await sharp(new URL("public/brand/mark.svg", root).pathname)
    .resize(112, 112)
    .png()
    .toBuffer(),
);

// A childless element gets no children key at all: the renderer reads an
// empty array as several children and demands a flex display for it.
const el = (type, style, ...children) => ({
  type,
  props: {
    style,
    ...(children.length > 0 && {
      children: children.length === 1 ? children[0] : children,
    }),
  },
});
const img = (src, style) => ({ type: "img", props: { src, style } });

// The phone is the site's .phone-frame at 1rem = 16px, sunk into the foot of
// the card the way the closing chapter sinks its three.
const phoneWidth = 318;
const screenWidth = phoneWidth - 2 - 2 * 7.2;
const screenHeight = screenWidth * (1477 / 680);

const phone = el(
  "div",
  {
    position: "absolute",
    left: 816,
    top: 96,
    width: phoneWidth,
    display: "flex",
    padding: 7.2,
    borderRadius: 41.6,
    border: "1px solid #7e8a89",
    background: frame,
    boxShadow:
      "1px 1px 0 #849593, 3px 2px 0 #465b5d, 5px 3px 0 #273c3e, 7px 4px 0 #192f32, 14px 22px 28px -14px rgba(18, 54, 58, 0.3), 22px 42px 65px -25px rgba(18, 54, 58, 0.28)",
  },
  el(
    "div",
    {
      position: "relative",
      display: "flex",
      width: screenWidth,
      height: screenHeight,
      overflow: "hidden",
      borderRadius: 34.4,
      background: "#f1f4fb",
    },
    img(screenshot, { width: screenWidth, height: screenHeight }),
    el("div", {
      position: "absolute",
      top: 0,
      left: screenWidth * 0.33,
      width: screenWidth * 0.34,
      height: 20,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      background: frame,
    }),
  ),
  el("div", {
    position: "absolute",
    right: -5,
    top: "26%",
    width: 3,
    height: "7%",
    borderRadius: 2,
    background: "#617779",
  }),
);

const copy = el(
  "div",
  {
    position: "absolute",
    left: 72,
    top: 64,
    bottom: 60,
    width: 700,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  el(
    "div",
    { display: "flex", flexDirection: "column" },
    el(
      "div",
      { display: "flex", alignItems: "center", gap: 14 },
      img(mark, { width: 56, height: 56 }),
      el(
        "span",
        {
          fontFamily: "Bricolage Grotesque",
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: "-0.045em",
          color: ink,
        },
        "ParkiWell",
      ),
    ),
    el(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        marginTop: 56,
        fontFamily: "Bricolage Grotesque Display",
        fontWeight: 700,
        fontSize: 92,
        lineHeight: 0.92,
        letterSpacing: "-0.055em",
        color: ink,
      },
      el("span", {}, "Parkinson’s"),
      el("span", {}, "care, organized."),
    ),
    el(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        marginTop: 30,
        fontSize: 28,
        lineHeight: 1.42,
        color: muted,
      },
      el("span", {}, "Symptom records. Medication reminders."),
      el("span", {}, "Speech and movement practice."),
    ),
  ),
  el(
    "div",
    { display: "flex", flexDirection: "column", width: 640 },
    el("div", { height: 1, background: ink, opacity: 0.25 }),
    el(
      "span",
      { marginTop: 22, fontSize: 24, fontWeight: 600, color: ink },
      "Coming to iPhone and Android",
    ),
    el("span", { marginTop: 8, fontSize: 21, color: muted }, "parkiwell.com"),
  ),
);

const response = new ImageResponse(
  el(
    "div",
    {
      position: "relative",
      display: "flex",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      background: paper,
      fontFamily: "Nunito Sans",
    },
    copy,
    phone,
  ),
  {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Bricolage Grotesque",
        data: await font("Bricolage Grotesque", "wght@700"),
        weight: 700,
        style: "normal",
      },
      // The site's .display face: weight 750 at width 88, which Google
      // serves as its semi-condensed bold instance.
      {
        name: "Bricolage Grotesque Display",
        data: await font("Bricolage Grotesque", "wdth,wght@88,750"),
        weight: 700,
        style: "normal",
      },
      {
        name: "Nunito Sans",
        data: await font("Nunito Sans", "wght@400"),
        weight: 400,
        style: "normal",
      },
      {
        name: "Nunito Sans",
        data: await font("Nunito Sans", "wght@600"),
        weight: 600,
        style: "normal",
      },
    ],
  },
);

const card = Buffer.from(await response.arrayBuffer());
const hash = createHash("sha256").update(card).digest("hex").slice(0, 8);
const filename = `social-card-${hash}.png`;
await writeFile(new URL(`public/brand/${filename}`, root), card);
await writeFile(
  new URL("src/lib/social-image.ts", root),
  `// Drawn by scripts/social-card.mjs using local artwork and a product screenshot.
export const socialImage = {
  url: "/brand/${filename}",
  width: 1200,
  height: 630,
  alt: "ParkiWell: Parkinson's care, organized. Symptom records, medication reminders, and speech and movement practice. Coming to iPhone and Android.",
} as const;
`,
);
console.log(`Wrote public/brand/${filename}`);
