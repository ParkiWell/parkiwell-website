<div align="center">

<img src="public/brand/mark.svg" alt="" width="72">

# parkiwell.com

**The story of a calmer care day, told by scrolling through one.**

The marketing site for [ParkiWell](https://github.com/ParkiWell/ParkiWell), a
Parkinson's care companion for iPhone and Android.

[**parkiwell.com**](https://parkiwell.com) · Coming soon to the App Store and Google Play

</div>

---

<!-- screens:start -->
<p align="center">
  <img src="public/screens/home-51413e45.webp" alt="Home: your whole day at a glance" width="22%">
  <img src="public/screens/manage-edd5e566.webp" alt="Manage: medications and doses" width="22%">
  <img src="public/screens/recovery-fd3dde23.webp" alt="Recovery: practice with a plan" width="22%">
  <img src="public/screens/community-dark-b54937e3.webp" alt="Community, in dark mode" width="22%">
</p>
<!-- screens:end -->

## Built for trust

- **No third party requests.** Fonts, images and scripts all come from this
  origin. A Content Security Policy enforces it rather than trusting us to
  remember.
- **No analytics, no tracking, no cookies.** There is nothing to consent to
  because nothing is collected.
- **The launch list holds an email address and nothing else.** Your browser
  never talks to the database; the server writes the row. The key it uses can
  add an address and cannot read the list back.
- **Fast by default.** Every page is prerendered, screenshots are served
  immutable, and the whole thing is a single origin with no client side
  routing to wait for.

Read the [Privacy Policy](https://parkiwell.com/privacy), the
[Terms of Service](https://parkiwell.com/terms), or visit
[Support](https://parkiwell.com/support).

## Medical disclaimer

ParkiWell is an organizational and educational tool. It is **not** a medical
device and does not provide medical advice, diagnosis, or treatment. Always
consult your care team about your health.

## For developers

Next.js App Router, React, TypeScript and Tailwind, with Motion for the
scroll-driven sequences and Playwright for cross-browser checks. The launch
list is a Route Handler that writes to the same Supabase project the app uses.

```bash
npm install
npm run dev            # http://localhost:3000

npm run lint           # eslint
npm run build          # type check and static build
npm run test           # playwright, desktop Chromium and mobile WebKit
```

Product screenshots are generated from the app repository, with a content hash
in each filename so the immutable caching stays honest:

```bash
node scripts/screens.mjs ../ParkiWell/marketing/raw
```

The launch list needs `supabase/launch_list.sql` applied to the project and
`SUPABASE_URL` and `SUPABASE_ANON_KEY` set; see [.env.example](.env.example).
Without them the form says it is unavailable rather than pretending to have
saved anything. Deployment is written up in
[docs/DEPLOYING.md](docs/DEPLOYING.md).
