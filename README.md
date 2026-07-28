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
- Supabase for the launch list, reached only from the server

Every page is statically prerendered. The one exception is
`/api/launch-list`, which writes a single row to Supabase on the server so that
the browser still makes no third party request of its own. There is no
analytics and no tracking: fonts are self hosted and the Content Security
Policy in `next.config.ts` blocks anything cross origin.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional, for the launch list
npm run dev                  # http://localhost:3000
```

Without Supabase credentials the launch list form reports that it is
unavailable and points at the email address, which is the intended behaviour
for a preview build. To wire it up, apply `supabase/launch_list.sql` to the
project the app uses and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

Product screenshots are generated from the app repository:

```bash
node scripts/screens.mjs ../ParkiWell/marketing/raw
```

Filenames carry a content hash, so re-running it after the app's captures
change is enough: `/screens/*` stays immutable in the cache and new artwork is
always a new URL.

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
src/app/api/             the launch list endpoint
src/hooks/               reduced motion, scroll gravity, viewport helpers
src/lib/stages.ts        timing for the pinned scroll sequences
src/lib/tones.ts         the chapter tone scale, mirrored in globals.css
src/lib/screens.ts       generated: hashed paths for the product screenshots
supabase/                SQL for the launch list table and its policies
public/screens/          product screenshots
scripts/                 screenshot build, and diagnostics for layout and weight
```

## Design notes

Scrolling the home page walks one continuous colour: warm paper, through clay,
sand, sage, mint and steel, and back to paper under the footer. Each chapter
starts on the tone the one above it ended on, so there is no boundary to see.
The stops are in `src/lib/tones.ts` and in `--tone-0` through `--tone-9` in
`globals.css`, and tests keep the two copies in step.

Scrolling has weight. The page waits for you to stop, then springs the rest of
the way onto the nearest chapter, so it arrives with a little give rather than
a click. Nothing is taken away while you are scrolling: any input cancels the
settle, a long flick crosses the whole page, and the end of the page is a place
you are allowed to stop. Touch keeps the browser's own snapping, and anyone who
has asked for reduced motion gets neither.

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
