# KendoBH Landing Page — Modernization Design

**Date:** 2026-04-28
**Branch:** `test-ai` (do not merge to `main` without explicit permission)
**Status:** Design spec — pending user review before plan

## 1. Goal

Refactor the existing single-page Vite/Tailwind site into an Astro-based, modern-editorial landing page for the Belo Horizonte kendo and iaido group. Same scope (Kendo, Iaido, História, Treinos/Contato, FAQ — all in PT-BR), modernized presentation, dramatically smaller JS footprint, and a deliberate visual identity.

## 2. Non-goals

- No new sections (no blog, no calendar, no instructor profiles, no gallery page).
- No translations beyond PT-BR (Japanese kanji stays as decorative + `lang="ja"` annotations; no full JA translation).
- No CMS, no dynamic data, no serverless functions.
- No analytics in the initial cut (separate decision later).
- No commissioned photography. Existing assets in `src/assets/` only.
- No JS framework runtime on the client (no React, Preact, Vue, Alpine).

## 3. Success criteria

- Lighthouse ≥ 95 mobile, ≥ 99 desktop on Performance, SEO, Accessibility, Best Practices
- LCP < 1.8s on mid-tier Android over 4G
- CLS < 0.05, INP < 100ms
- Total JS shipped < 5 KB (uncompressed, inline only — no external module fetch)
- Total CSS shipped < 25 KB gzipped
- WCAG 2.2 AA on all interactive elements
- All copy preserved from current site (no content loss)
- Static deploy on Netlify free tier with no quota concerns

## 4. Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Astro (static) | Smallest JS footprint, ideal for content + SEO sites, good DX |
| Visual direction | Modern Editorial | Dark canvas, bold sans, magazine-style hierarchy |
| Color palette | Crimson + Gold (P3) | `#ff2d55` for kendo, `#d4a437` for iaido, near-black canvas |
| Hero treatment | HC — Typographic / kanji-led | Type does the heavy lifting; ambient kanji ghost; works without strong hero photo |
| Languages | PT-BR only | Audience is local (BH / Brazil); preserve `lang="ja"` on Japanese strings |
| Content scope | Visual + tech refresh | Same 5 sections; same body copy (refined formatting only) |
| Imagery | Existing assets only | `kendo.webp`, `iaido.webp`, `history.webp`, `matsuoka.webp`, `amcnb.webp`, `kendobh-logo.webp` |
| Deployment | Netlify (free tier) | Auto-deploy from GitHub, deploy previews on PRs |
| Interactivity strategy | `<details>` + ~200 bytes inline JS | Native HTML for menu and FAQ, ~8 lines of inline JS only to close menu on link click |
| CSS framework | Tailwind v4 (CSS-first config) | Smaller runtime than v3; `@theme` token system |
| Typography | Cabinet Grotesk (display) + Inter (body), both self-hosted variable fonts | Both free (Fontshare / OFL), variable, Latin Extended for PT-BR |

## 5. Architecture & file structure

```
kendo-landing-page/
├── astro.config.mjs              # Astro + Tailwind v4 + sitemap
├── netlify.toml                  # build config + cache + security headers
├── package.json                  # pnpm; only Astro + Tailwind + sharp
├── public/
│   ├── favicon.svg               # replaces favicon.ico
│   ├── robots.txt
│   └── og-image.jpg              # 1200×630, wordmark + kanji
├── src/
│   ├── pages/
│   │   └── index.astro           # the only page
│   ├── layouts/
│   │   └── BaseLayout.astro      # <html>, <head>, fonts, schema.org JSON-LD
│   ├── components/
│   │   ├── nav/
│   │   │   ├── Header.astro      # desktop nav + mobile <details> menu
│   │   │   └── Footer.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── Kendo.astro
│   │   │   ├── Iaido.astro
│   │   │   ├── History.astro
│   │   │   ├── Keiko.astro
│   │   │   └── Faq.astro
│   │   └── ui/
│   │       ├── SectionHeader.astro   # eyebrow + heading + ghost-kanji
│   │       ├── DojoCard.astro
│   │       └── FaqItem.astro
│   ├── content/                  # source-of-truth copy
│   │   ├── kendo.md
│   │   ├── iaido.md
│   │   ├── history.md
│   │   ├── keiko.md
│   │   ├── dojos.json            # name, address, schedule per dojo
│   │   └── faq.json              # question/answer pairs
│   ├── assets/
│   │   └── (existing photos, processed by Astro <Image />)
│   └── styles/
│       └── global.css            # Tailwind v4 imports + @theme tokens + base styles
└── docs/superpowers/specs/
    └── 2026-04-28-kendo-landing-page-modernization-design.md
```

Key principles:
- **Content separated from markup**: long copy lives in `content/*.md`. Components import and render. Future content edits don't touch presentation.
- **Single page only**: no router, no nested layouts beyond `BaseLayout`.
- **`BaseLayout` owns**: `<html lang="pt-BR">`, `<head>`, font preload, theme-color, OpenGraph meta, JSON-LD, skip-to-content link.
- **Components are file-bounded**: each `.astro` component owns its markup, scoped styles (if any), and consumed data.

## 6. Design system

### 6.1 Color tokens (Tailwind v4 `@theme`)

```css
@theme {
  /* canvas */
  --color-ink-950: #050507;
  --color-ink-900: #0a0a0d;
  --color-ink-800: #14141a;
  --color-ink-700: #1f1f28;
  --color-ink-500: #4a4a55;
  --color-ink-300: #a8a8b3;
  --color-ink-100: #e8e8ec;
  --color-paper:   #ffffff;

  /* signature accents */
  --color-kendo-red:  #ff2d55;
  --color-iaido-gold: #d4a437;

  /* contextual semantics */
  --color-bg: var(--color-ink-900);
  --color-fg: var(--color-ink-100);
  --color-fg-muted: var(--color-ink-300);
  --color-border: var(--color-ink-700);
}
```

**Accent discipline:**
- Hero & Kendo section → kendo-red signature
- Iaido section → iaido-gold signature
- History, Keiko, FAQ → neutral white-on-ink (eyebrow uses gold for the section number)
- Body copy is always on `--color-ink-100` (17:1 contrast, AAA)
- kendo-red `#ff2d55` on `#0a0a0d` is 5.85:1 — passes AA for large text and UI components only. Never used for small body text.

### 6.2 Typography

```css
@theme {
  --font-display: "Cabinet Grotesk", system-ui, sans-serif;
  --font-body:    "Inter Variable", system-ui, sans-serif;

  --text-eyebrow: clamp(0.6875rem, 0.65rem + 0.25vw, 0.75rem);
  --text-body:    clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lede:    clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  --text-h3:      clamp(1.25rem, 1.1rem + 0.75vw, 1.625rem);
  --text-h2:      clamp(2rem, 1.5rem + 2vw, 3.5rem);
  --text-h1:      clamp(2.75rem, 2rem + 4vw, 6rem);
  --text-kanji:   clamp(8rem, 6rem + 12vw, 18rem);
}
```

Both fonts self-hosted as variable fonts. Subset to Latin Extended (full PT-BR coverage) plus a tiny custom Japanese subset containing only the kanji actually used: 剣 道 居 合 稽 古. `font-display: swap`. Preload only the body font weight visible above the fold.

### 6.3 Spacing & layout

- Container: `max-width: 1200px`, padding `clamp(1rem, 4vw, 2rem)`
- Section vertical rhythm: `clamp(4rem, 8vw, 7rem)` between sections
- Body copy max-width: `58ch`
- Breakpoints: Tailwind defaults (`sm 640`, `md 768`, `lg 1024`, `xl 1280`)
- Mobile-first: every component renders at 360px width without breaking

### 6.4 Iconography

- Inline SVGs only, ~24×24 default size
- Set: Bootstrap Icons subset (already in current site — Instagram, Facebook, mail envelope, WhatsApp glyph, chevrons, list/X for menu)
- No icon font, no Font Awesome (already removed in current site)
- Decorative icons: `aria-hidden="true"`. Functional icons: explicit accessible name.

## 7. Section blueprints

### 7.1 Header / nav

- Pinned to top. Default behavior: transparent over the hero, becomes `--color-ink-900` background once scrolled past hero. Implementation must use pure CSS (e.g. CSS scroll-driven animations or `:has()` patterns). **If no pure-CSS approach works reliably across target browsers, fall back to a static `--color-ink-900` background from page load — never add JS scroll listeners.**
- Logo: `剣` glyph in red + "KENDOBH" wordmark in display font
- Desktop (≥ md): horizontal link list aligned right
- Mobile (< md): `<details>` element. Summary is the burger button. Open content is a fixed full-screen panel with vertical link list.
- Inline JS (~200 bytes) closes the menu on link click. If JS fails, menu stays open (graceful degradation).
- Skip-to-content link: visible on focus, jumps to `#main`.

### 7.2 Hero (HC typographic)

- Eyebrow: `BELO HORIZONTE · DESDE 2008` (gold, uppercase, 0.4em letter-spacing)
- Display heading: 3-line phrase, mixed weights, `--color-kendo-red` on the strong word ("espada viva")
- Sub-label: `剣道 · 居合道` in gold, smaller
- Lede: 2-line sentence, `--color-ink-300`
- Meta strip: `2 modalidades · Kendo · Iaido` / `2 dojos · Matsuoka · AMCNB`
- Single primary CTA: "Marcar aula experimental →" — anchor link to `#keiko`, kendo-red background
- Ambient layer: giant red `剣` at `--text-kanji` size, opacity 6%, `position: absolute`, bleeding off the right edge. `aria-hidden="true"`.
- This is the LCP candidate — no large image; the LCP element will likely be the display heading. `<h1>` with explicit `font-display: swap` ensures fast text render.

### 7.3 Kendo section (mirrored editorial split, red accent)

- Eyebrow: `01 · KENDO`
- Heading: `Kendo` (red) + `剣道` (small inline annotation in red), then "o caminho da espada." in white
- Thin red rule (48px × 2px) under heading
- Body: 3 paragraphs, max 58ch width, `--color-ink-300`. Existing copy preserved.
- Inline links keep red accent
- Photo on right (`kendo.webp`) at 4:5 aspect, with a corner-bracket frame in red top-left
- Ambient `剣道` ghost in red at 5% opacity, off-canvas right
- Mobile: stacks; photo first, then text

### 7.4 Iaido section (mirrors Kendo, gold accent)

- Eyebrow: `02 · IAIDO`
- Heading: `Iaido` (gold) + `居合道` (small inline annotation in gold), then a 2-line subhead in white — parallel structure to the Kendo heading. Suggested copy: "a meditação / em movimento." Final wording confirmed during implementation.
- Thin gold rule (48px × 2px) under heading — mirrors Kendo's red rule
- Body: 3 paragraphs, max 58ch width, `--color-ink-300`. Existing copy preserved.
- Inline links use gold accent
- Photo on left (`iaido.webp`) at 4:5 aspect, corner-bracket frame in gold top-right
- Ambient `居合道` ghost in gold at 5% opacity, off-canvas left
- Mobile: stacks; photo first, then text

### 7.5 History section

- Eyebrow: `03 · HISTÓRIA`
- Heading + lede top-left (60% width), large date treatment "2008 →" top-right (decorative, gold)
- Body copy in two columns at `md+`, single column on mobile
- Inline pull-quote: `Único grupo em Minas Gerais vinculado à CBK`
- Photo (`history.webp`) below the copy as a wide banner with thin gold rule above
- Ambient `歴史` ghost in neutral white at 4% opacity (decorative kanji for "history")

### 7.6 Keiko section (treinos / contato / dojos)

- Eyebrow: `04 · TREINOS · CONTATO`
- Heading: "Onde treinamos." + `稽古` annotation in gold
- Lede + intro paragraphs (existing copy on what to expect, costs, requirements)
- Dojo grid: 2-up cards (single-column on mobile)
  - `DojoCard` component:
    - Photo top (`matsuoka.webp` / `amcnb.webp`), 16:9
    - Name (display font, ~22px)
    - Address as `<address>` element, muted
    - Schedule as a 3-column micro-table: weekday · time · modality
    - Modality tag: red for Kendo, gold for Iaido
    - Border lifts to gold on hover/focus-within
- Contact row: 4-up grid of contact cards (email, WhatsApp, Instagram, Facebook). Single-column on mobile, 2×2 on `sm`, 4-up on `md+`. Each card has icon + label + value, lifts on hover.
- Ambient `稽古` ghost in gold at 4% opacity, off-canvas left

### 7.7 FAQ section

- Eyebrow: `05 · DÚVIDAS FREQUENTES`
- Heading: "Perguntas frequentes."
- Each Q is a `<details>`:
  - `<summary>`: question + chevron icon (rotates 180° via CSS when `[open]`)
  - Open content: answer paragraph, slight left indent, gold rule on the left when `[open]`
  - Hover/focus state: `--color-ink-800` background lift
- Animation: `interpolate-size: allow-keywords` for height transition where supported; snaps in older browsers (no JS fallback)

### 7.8 Footer

- 3 affiliate logos (CBK, AMCNB, KendoBH) in a horizontal row, grayscale by default, full color on hover
- Wordmark `剣道 KENDOBH`
- Social + contact: Instagram, Facebook, email, WhatsApp
- Tiny credit line: copyright + year (auto-generated)
- All on `--color-ink-950` to differentiate from main canvas

## 8. Performance plan

| Concern | Approach |
|---|---|
| Images | Astro `<Image />` emits `<picture>` with AVIF + WebP, `srcset` 1×/2×, intrinsic `width`/`height`. `loading="eager"` + `fetchpriority="high"` only on the LCP image. Everything else `loading="lazy"`. |
| Fonts | Self-hosted, subsetted variable fonts (Cabinet Grotesk + Inter). Custom JA subset for 6 kanji only. `font-display: swap`. Preload single body weight only. |
| CSS | Tailwind v4 tree-shaken to a single CSS file. Inline critical CSS via Astro for above-the-fold. |
| JS | Inline `<script>` in `<head>` for the close-menu-on-link handler. Total ~200 bytes. No module fetch, no hydration. |
| HTML | Astro's built-in HTML minification. Long copy lives in Markdown for clean source. |
| Caching | `netlify.toml` sets `Cache-Control: public, max-age=31536000, immutable` on hashed asset paths and image files |
| Compression | Brotli enabled by Netlify default; HTTP/2 multiplexing free. |
| Third-party | None. No analytics, no fonts CDN, no embeds. |

## 9. SEO plan

- Per-page `<title>`: `Kendo e Iaido em Belo Horizonte · KendoBH`
- Per-page `<meta name="description">`: 150–160 chars, mentions kendo, iaido, Belo Horizonte, CBK
- Canonical URL via Astro env-aware base
- OpenGraph: `og:title`, `og:description`, `og:image` (1200×630), `og:locale = pt_BR`, `og:type = website`, `og:url`
- Twitter Card: `summary_large_image`
- **Schema.org JSON-LD** in `<head>`:
  - One `SportsActivityLocation` (or `MartialArtsSchool`) entry per dojo, with `name`, `address` (PostalAddress), `telephone`, `openingHours`, `geo` (latitude/longitude per dojo — looked up from Google Maps during implementation and committed into `dojos.json`), `sameAs` (Instagram, Facebook URLs)
  - Site-level `Organization` with logo, contactPoint, sameAs
- `sitemap.xml` via `@astrojs/sitemap`
- `robots.txt` allowing all crawlers, pointing to sitemap
- Semantic HTML: one `<h1>` (hero), `<h2>` per section, ordered `<h3>` for sub-blocks (FAQ, dojo names). `<nav>`, `<main>`, `<footer>` landmarks. `<address>` for dojo contact info.
- `lang="pt-BR"` on root, `lang="ja"` on every Japanese string (preserves your existing accessibility commit)

## 10. Accessibility plan (WCAG 2.2 AA)

- All accent-on-canvas pairs verified for contrast; body copy stays on `--color-ink-100` (AAA)
- Focus styles: 2px gold outline + 2px offset on every interactive element
- Skip-to-content link, visible on focus
- `<details>` provides keyboard support out of the box; explicit `aria-label` on the burger summary ("Abrir menu" / "Fechar menu")
- Photo `alt` text: descriptive PT-BR sentences (tighten existing alts)
- Decorative kanji ghosts: `aria-hidden="true"`
- `prefers-reduced-motion: reduce`: disables all transitions/animations; `<details>` toggles instantly; no fade-ups
- Color is never the only signal: modality tags also have text labels ("Kendo" / "Iaido"), schedule tables include weekday names
- Keyboard navigation tested end-to-end (Tab order through nav, hero CTA, sections, FAQ, footer)
- Screen reader pass on iOS VoiceOver and Android TalkBack before merge

## 11. Motion philosophy

Three categories only:

1. **Page entry** — per-section fade-up of 12px, 250ms, `cubic-bezier(.2,.6,.2,1)`. CSS-only via `@starting-style` (modern browsers) or `animation-name` triggered by IntersectionObserver-free CSS approach. Skipped under `prefers-reduced-motion`.
2. **State changes** — `<details>` height interpolation via `interpolate-size: allow-keywords` (Chrome/Safari recent); older browsers snap.
3. **Hover/focus** — 150–200ms ease on `border-color`, `opacity`, `transform`. Never on layout-affecting properties (no animated `width`, `height`, `margin`).

No: scroll-jacking, parallax, autoplay video, scroll-triggered animation libraries, intersection-observer fade-ins, sticky headers with scroll listeners.

## 12. Build & deploy

### 12.1 Stack

- Package manager: `pnpm` (already in use)
- Node version pinned: 20 (in `.nvmrc` and `netlify.toml`)
- Dev dependencies: `astro`, `@astrojs/sitemap`, `tailwindcss@4`, `@tailwindcss/vite`, `sharp` (image optimization)
- Output: static `dist/`

### 12.2 `netlify.toml`

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "9"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.webp"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "interest-cohort=()"
```

### 12.3 Free-tier fit

- Bandwidth: page ~200 KB total per visit; 100 GB/month Netlify free tier covers 500k+ visits
- Build minutes: ~30–90s per build; 300 min/month covers 200+ deploys
- Sites: 1 of 100 allowed
- No serverless functions, no Netlify Image CDN runtime calls (image optimization is at build time)
- No Netlify Forms (mailto / WhatsApp links instead)

### 12.4 Migration / cutover (high-level — detailed in implementation plan)

1. All work on the existing `test-ai` branch (do NOT merge to `main` without explicit user permission)
2. Scaffold Astro project structure alongside existing `src/`
3. Build components/sections one by one, comparing against current site
4. Migrate body copy into `content/*.md`; structured data into `dojos.json` / `faq.json`
5. Wire `<Image />`, fonts, head metadata, schema.org JSON-LD
6. Local Lighthouse run against the perf budget; iterate until green
7. Manual mobile + desktop walkthrough; keyboard + screen reader pass
8. Replace old `src/` contents; remove obsolete config (`vite.config.js`, `tailwind.config.cjs`, `postcss.config.cjs`, old `vite-plugin-html` / `terser` deps)
9. Connect Netlify to the `test-ai` branch deploy preview; verify in production-like env
10. **Hand control back to user for merge decision** — never merge automatically

### 12.5 Verification gates

- Lighthouse mobile ≥ 95, desktop ≥ 99 on all four pillars
- Visual diff against current production site for content parity
- Mobile menu opens/closes correctly with `<details>` (and with the close-on-link inline JS)
- FAQ keyboard-navigable
- `prefers-reduced-motion` respected (verified via DevTools toggle)
- Screen reader smoke test (VoiceOver or TalkBack)
- 404 page exists and looks consistent
- `robots.txt` and `sitemap.xml` reachable; sitemap lists `/`

## 13. Out of scope (deferred decisions)

- Analytics tooling (Plausible/Umami/Cloudflare/none)
- Custom domain / DNS migration
- A possible photoshoot for higher-quality hero imagery
- Translations
- A blog / news section
- Booking system for experimental classes
- Logo redesign
