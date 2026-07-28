# Pay3 — Landing Page

The marketing page for Pay3, at `pay3.space`. Redesigned around ton.org's
actual current structure (glow hero, live stat strip, feature-tile grid,
minimal nav) — pulled from the live site rather than guessed — adapted into
Pay3's white/black/`#67C6FE` brand instead of TON's dark theme.

Standalone project, no wallet code here — the wallet is its own deployment
at `app.pay3.space`, the testnet at `testnet.pay3.space`, the docs at
`docs.pay3.space`.

## 1. Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 2. Four URLs, one placeholder among them

All near the top of `app/page.jsx`:

```js
const WALLET_URL = "https://app.pay3.space";
const TESTNET_URL = "https://testnet.pay3.space";
const DOCS_URL = "https://docs.pay3.space";
const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/"; // TODO
```

The first three are real, as requested. `CHROME_EXTENSION_URL` is still a
placeholder — the button is enabled (not "coming soon"), but there's no
extension published yet, so it currently points at the general Chrome Web
Store rather than a dead link. **Update it once the real extension is live**,
or people who click it land somewhere generic.

## 3. The hero font

The big "PAY3" wordmark in the hero uses a custom font; everything else
(including the smaller "Pay3" wordmark in the nav and footer) stays Space
Grotesk, as requested.

Put your font file in `public/fonts/font.ttf` — there's a reminder in
`public/fonts/PUT_YOUR_FONT_HERE.txt`. It's wired up via a plain CSS
`@font-face` rule in `app/page.jsx` (search for `Pay3Hero`), not
`next/font/local`. That's a deliberate choice: `next/font/local` reads the
font file at *build time* — if it's missing, `next build` fails outright.
A runtime `@font-face` degrades gracefully instead: no file yet, and the
browser just falls back to Space Grotesk Bold for that one heading, nothing
breaks. Drop the real file in later and it swaps in automatically on the
next deploy, no code changes needed.

## 4. What changed from the previous version

- **Structure**: pivoted from the pixel/voxel poster layout to a cleaner,
  sectioned, stat-driven layout — hero → live stat strip → Vision (3 cards)
  → Key Features (6 tiles) → Available Now (Wallet/Testnet/Docs, the main
  conversion section) → Roadmap → footer. No more dither band or pixel body
  copy.
- **Testnet is real now**: the hero eyebrow says "Testnet live," there's a
  dedicated "Try the Testnet" button alongside "Launch Wallet," and it's one
  of three cards in the "Available Now" section.
- **Docs are suggested**, not just linked: a "Documentation" card sits next
  to Wallet and Testnet in "Available Now," plus links in the nav and a
  "Developers" column in the footer.
- **Roadmap corrected**: "Pay3 L1 Testnet" is now marked **Live**, not "In
  progress" — it was stale relative to reality after the testnet actually
  shipped.
- **Footer rebuilt**: from a single thin line to a proper 4-column layout —
  brand blurb, Product links, Developer links, and a live-status column —
  plus the same bottom bar with copyright and tags as before.
- The voxel sphere hero visual (Three.js) carries over unchanged, just
  resized and moved into a two-column hero layout instead of being the
  full-width centerpiece.

## 5. Logo

Put `logo.png` in `public/` (not `app/`). Falls back to a "P3" text badge
until it's added.

## 6. Deploying (e.g. to Vercel)

Same as before: its own repo, its own Vercel project, assign it the
`pay3.space` domain. No environment variables needed.

## 7. Known `npm audit` findings

Same `postcss`/`sharp` transitive findings as the other three Pay3
projects, from Next.js's image optimizer, unrelated to this page. Don't run
`npm audit fix --force`.

## 8. Tech

Next.js 15 (App Router) · React · Three.js (lazy-loaded, hero visual only) ·
lucide-react icons · Space Grotesk (Google Fonts) + your custom font (local,
hero only).
