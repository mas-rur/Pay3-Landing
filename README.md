# Pay3 — Landing Page

The marketing page for the upcoming Pay3 L1 blockchain, at `pay3.space`.

This is a **separate, standalone project** from the Pay3 Wallet — no wallet
code or dependencies live here on purpose, since the wallet is its own
deployment at `app.pay3.space`. This project is just `app/page.jsx` plus the
minimum Next.js scaffolding (`app/layout.jsx`, `next.config.mjs`,
`package.json`) needed to run it.

## 1. Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 2. Before you deploy — two URLs to update

Both are constants at the top of `app/page.jsx`:

```js
const WALLET_URL = "https://app.pay3.space";
const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/"; // TODO
```

- **`WALLET_URL`** — already set to `app.pay3.space` as requested. Both the
  "Launch Wallet" buttons (nav + content section) link here.
- **`CHROME_EXTENSION_URL`** — you asked for the "Add to Chrome" button to be
  enabled now, even though the extension doesn't exist yet. Rather than
  leave it a dead link, it currently points at the general Chrome Web Store
  homepage as a placeholder. **Update this to your real extension's listing
  URL once it's published** — otherwise people who click it land somewhere
  generic instead of your actual extension. It's the one thing in this
  project that's a placeholder standing in for a future asset, so it's
  flagged here and again as a code comment right above the constant.

## 3. Logo

Put `logo.png` in `public/` (not `app/` — Next.js only serves static files
from `public/`). It's used in the header brand mark and as the favicon. A
reminder is also in `public/PUT_YOUR_LOGO_HERE.txt`. Until it's added, the
brand mark falls back to a small "P3" badge — nothing breaks.

## 4. Deploying (e.g. to Vercel)

1. Push this project to its own GitHub repo (separate from the wallet's
   repo).
2. Import it in Vercel as its own project.
3. Assign the `pay3.space` domain to it in Vercel's domain settings — do
   **not** assign `app.pay3.space` here, that domain belongs to the wallet's
   separate Vercel project.
4. No environment variables are needed — this page doesn't call any APIs.

If you'd rather run both the landing page and the wallet from a single
repo/project instead of two, that's also possible (e.g. via Next.js
rewrites or a monorepo), but it's a bigger restructuring than what's here —
ask if you want that instead.

## 5. What's on the page, and why it's built this way

- **No wallet content.** Per your request, this page doesn't describe wallet
  features, chains, or show any wallet UI — it's purely about the Pay3 L1,
  with the wallet and Chrome extension as two exit-CTAs.
- **A rotating voxel sphere in the hero**, built with Three.js
  (`InstancedMesh` of ~460 small cubes arranged with a Fibonacci sphere
  distribution, a few "spiked" outliers for that fragmented-crystal look,
  colored via a black→accent-blue gradient by facing/height, slowly
  rotating). It's lazy-loaded (dynamic `import("three")`) so it doesn't
  block the initial page load — confirmed in this environment that it code-
  splits into its own ~740KB chunk, separate from the ~110KB first-load JS.
  If WebGL fails to initialize for any reason, a CSS radial-gradient orb
  underneath it stays visible instead of leaving a blank gap.
- **A pixelated dither transition band** between the black hero and white
  content section — a grid of small squares whose black/white ratio shifts
  from top to bottom, generated with a deterministic seeded function (not
  `Math.random()`) so it renders identically on the server and after client
  hydration — using real randomness here would otherwise cause a hydration
  mismatch.
- **"Press Start 2P"** (Google Fonts, open license) for the big pixel-block
  headline and wordmark, paired with Space Grotesk for everything else —
  matching the reference image's mix of a chunky pixel display face and a
  clean regular body face, in Pay3's own black / white / `#67C6FE` palette
  rather than the reference's blue.
- One thing I can't verify from here: **I don't have a browser/GPU in this
  environment**, so I could build and confirm the Three.js scene compiles
  and runs without throwing, but I can't see the actual rendered voxel
  sphere myself. Take a look once it's running and let me know if the
  shape, density, or colors need adjusting — easy to iterate on.

## 6. Known `npm audit` findings

Same as the wallet project: `npm audit` reports high-severity findings in
`postcss`/`sharp`, both pulled in transitively by Next.js's image optimizer
and unrelated to anything this page actually does. `npm audit fix --force`
"fixes" this by downgrading Next.js to an ancient version — don't run it.

## 7. Tech

Next.js 15 (App Router) · React · Three.js (lazy-loaded, hero visual only) ·
lucide-react icons · Space Grotesk + Press Start 2P (Google Fonts).
