# ParkiWell website

The marketing site for [ParkiWell](https://parkiwell.com), a Parkinson's care
companion for iPhone and Android. The app keeps symptoms, medications, and
guided speech and movement practice in one place and works offline. An
a broader on-device movement coach is being explored for a future release.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, with semantic colour tokens that drive light and dark themes
- Motion for scroll-driven sequences
- Playwright for cross-browser checks

Everything is statically prerendered. There is no database, no analytics, no
tracking, and no third party request at runtime: fonts are self hosted and the
Content Security Policy in `next.config.ts` blocks anything cross origin.

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000
```

## Checks

```bash
npm run lint           # eslint
npm run build          # type check and static build
npm run test           # playwright, desktop Chromium and mobile WebKit
```

`npm run test` builds nothing itself: run `npm run build` first, then the test
command starts a production server on port 3210.

## Structure

```text
src/app/                 routes: home, support, privacy, terms, sitemap, robots
src/components/          header, footer, shared UI
src/components/sections  home page sections, one file per section
src/content/             privacy and terms, in Markdown, rendered at build time
src/hooks/               reduced motion and viewport helpers
src/lib/stages.ts        timing for the pinned scroll sequences
src/lib/tones.ts         the chapter tone scale, mirrored in globals.css
public/screens/          product screenshots
scripts/                 diagnostics for layout overflow, stage timing, weight
```

## Design notes

Scrolling the home page walks one continuous colour: warm paper, through clay,
sand, sage, mint and steel, and back to paper under the footer. Each chapter
starts on the tone the one above it ended on, so there is no boundary to see.
The stops are in `src/lib/tones.ts` and in `--tone-0` through `--tone-9` in
`globals.css`, and tests keep the two copies in step.

Scrolling has weight. Chapters snap into place once you come to rest near one,
and the pinned day sequence takes a little over a screen of scrolling per step,
so the story is walked through rather than flicked past. The snapping is
`proximity` and never blocks a fast scroll, and it turns off completely for
anyone who has asked for reduced motion.

The day journey is the only pinned section with scroll-linked motion. It stops
pinning and becomes a plain stacked story on small screens and whenever the
visitor has asked for reduced motion, so nothing important is only reachable
by animating. That choice is made in CSS rather than in JavaScript, for the
reason spelled out in [AGENTS.md](AGENTS.md).

Copy avoids em dashes throughout, and a test fails the build if one appears on
a rendered page.

## Security

Every response carries a Content Security Policy that keeps the page to this
origin, plus HSTS, a Permissions-Policy that switches off every gated browser
feature, and the cross-origin isolation headers. Brand artwork is the single
exception to the same-origin resource policy, because share cards and favicons
are fetched by other sites. The Markdown renderer behind the legal pages
escapes raw HTML and refuses link schemes other than http, https, mailto, and
site-relative paths, so nothing in `src/content/` can ever execute. Tests cover
all of it.

## Contributing

Read [AGENTS.md](AGENTS.md) before changing copy or motion. Claims about the
app have to match the shipped app.
