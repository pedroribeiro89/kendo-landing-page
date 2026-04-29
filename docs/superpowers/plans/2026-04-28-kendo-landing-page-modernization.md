# KendoBH Astro Modernization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Vite/Tailwind 3 single-page kendo landing page with an Astro 5 + Tailwind v4 implementation matching the modern-editorial design spec, deployed via Netlify free tier.

**Architecture:** Static Astro site generated to `dist/`. Content lives in Markdown/JSON via Astro Content Collections; sections render as `.astro` components; interactivity uses native HTML `<details>` + ~200 bytes of inline JS. Tailwind v4 with CSS-first `@theme` tokens, self-hosted variable fonts, AVIF/WebP responsive images via Astro `<Image />`. No JS framework runtime, no third-party scripts, no analytics.

**Tech Stack:** Astro 5, Tailwind v4 (`@tailwindcss/vite`), TypeScript, sharp, `@astrojs/sitemap`, pnpm, Netlify static hosting.

**Branch policy:** All work on `test-ai`. Do **NOT** merge to `main` without explicit user permission. The user will inspect a Netlify deploy preview before approving any merge.

**Source spec:** `docs/superpowers/specs/2026-04-28-kendo-landing-page-modernization-design.md`

---

## File structure (target)

```
kendo-landing-page/
├── astro.config.mjs              # Astro + Tailwind v4 + sitemap
├── tsconfig.json                 # TypeScript strict
├── netlify.toml                  # Build config, headers, security
├── .nvmrc                        # Node 20
├── package.json                  # pnpm; Astro + Tailwind + sharp + sitemap
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── og-image.jpg              # 1200×630 social card
│   └── fonts/                    # self-hosted variable fonts
│       ├── CabinetGrotesk-Variable.woff2
│       └── InterVariable.woff2
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   └── 404.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── nav/
│   │   │   ├── Header.astro
│   │   │   └── Footer.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── Kendo.astro
│   │   │   ├── Iaido.astro
│   │   │   ├── History.astro
│   │   │   ├── Keiko.astro
│   │   │   └── Faq.astro
│   │   └── ui/
│   │       ├── SectionHeader.astro
│   │       ├── DojoCard.astro
│   │       └── ContactCard.astro
│   ├── content/
│   │   ├── config.ts             # Astro Content Collections schemas
│   │   ├── sections/
│   │   │   ├── kendo.md
│   │   │   ├── iaido.md
│   │   │   ├── history.md
│   │   │   └── keiko.md
│   │   ├── dojos.json
│   │   └── faq.json
│   ├── assets/
│   │   ├── kendo.webp            # existing
│   │   ├── iaido.webp            # existing
│   │   ├── history.webp          # existing
│   │   ├── matsuoka.webp         # existing
│   │   ├── amcnb.webp            # existing
│   │   ├── kendobh-logo.webp     # existing
│   │   ├── cbk-logo.png          # existing
│   │   └── amcnb-logo.png        # existing
│   ├── lib/
│   │   └── seo.ts                # buildPageSeo(), buildOrgJsonLd(), buildDojoJsonLd()
│   └── styles/
│       └── global.css            # @import "tailwindcss" + @theme tokens + base
└── docs/superpowers/
    ├── specs/
    │   └── 2026-04-28-kendo-landing-page-modernization-design.md
    └── plans/
        └── 2026-04-28-kendo-landing-page-modernization.md
```

**Files removed:** `vite.config.js`, `tailwind.config.cjs`, `postcss.config.cjs`, `src/index.html`, `src/main.js`, `src/style.css`, `src/js/faq.js`, `src/js/mobile-menu.js`, old `src/.DS_Store`, `package-lock.json` (we use pnpm).

**Each file's responsibility:**

- `BaseLayout.astro` — owns `<html lang="pt-BR">`, `<head>` (meta, fonts, JSON-LD, OG), `<body>` skip-link + `<main>` slot. Used only by pages.
- `Header.astro` / `Footer.astro` — site nav. Header owns the `<details>` mobile menu and the inline close-on-link JS.
- `sections/*.astro` — one per section, queries its content from collections. No business logic.
- `ui/*.astro` — small reusable presentational pieces. Pure props in, markup out.
- `lib/seo.ts` — pure functions returning OG/JSON-LD payloads from typed inputs. Unit-testable.
- `content/config.ts` — Zod schemas for collections. The single source of truth for content shape.
- `styles/global.css` — Tailwind import, `@theme` tokens, base resets, `@font-face` rules.

---

## Verification approach

This is presentation-heavy work; classical unit-test-first TDD doesn't fit every component. The plan applies tests where they earn their keep:

- **Pure logic (`lib/seo.ts`):** real Vitest unit tests with assertions against expected JSON-LD shape.
- **Interactivity (mobile menu, FAQ):** Playwright smoke tests covering open/close + close-on-link behavior.
- **Visual rendering:** dev-server preview + manual section walkthrough at 360px / 768px / 1280px viewport widths.
- **Build correctness:** `astro build` must exit 0; `astro check` must pass with zero errors.
- **Performance:** Lighthouse run via `lhci` against the budget gate at the end (Task 18).
- **Accessibility:** `pa11y` over `astro dev` URL + manual keyboard pass (Task 17).

Each task ends with a `git commit` so progress is checkpointable.

---

## Task 1: Bootstrap Astro project on test-ai

**Files:**
- Create: `package.json` (replacing existing)
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.nvmrc`
- Create: `src/pages/index.astro`
- Create: `src/env.d.ts`
- Delete: `src/index.html`, `src/main.js`, `src/style.css`, `src/js/`, `vite.config.js`, `tailwind.config.cjs`, `postcss.config.cjs`, `package-lock.json`
- Move: `src/assets/*` → keep in place (Astro reads from `src/assets/`)

- [ ] **Step 1: Confirm working branch is `test-ai`**

```bash
git rev-parse --abbrev-ref HEAD
```
Expected output: `test-ai`. If not, stop and switch with `git checkout test-ai`.

- [ ] **Step 2: Snapshot the current source for reference**

The old HTML and content stays accessible via git history. To make copy-paste during content extraction trivial, copy the current `src/index.html` to a scratch path that is NOT committed:

```bash
mkdir -p .scratch
cp src/index.html .scratch/old-index.html
```

Add `.scratch/` to `.gitignore`:

```bash
echo ".scratch/" >> .gitignore
```

- [ ] **Step 3: Remove obsolete config and source files**

```bash
rm -f vite.config.js tailwind.config.cjs postcss.config.cjs package-lock.json
rm -f src/index.html src/main.js src/style.css
rm -rf src/js
find src -name ".DS_Store" -delete
find . -maxdepth 2 -name ".DS_Store" -delete
```

Add `.DS_Store` to `.gitignore` if not already global:

```bash
grep -q "^\.DS_Store$" .gitignore || echo ".DS_Store" >> .gitignore
```

- [ ] **Step 4: Replace `package.json`**

Overwrite `package.json` with:

```json
{
  "name": "kendo-landing-page",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "lh": "lhci autorun"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "@playwright/test": "^1.48.0",
    "pa11y": "^8.0.0",
    "@lhci/cli": "^0.14.0"
  },
  "packageManager": "pnpm@9.12.0"
}
```

- [ ] **Step 5: Add `.nvmrc` and Node version files**

```bash
echo "20" > .nvmrc
```

- [ ] **Step 6: Create `astro.config.mjs`**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kendobh.com.br',
  output: 'static',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
```

- [ ] **Step 7: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules", ".scratch"]
}
```

- [ ] **Step 8: Create `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 9: Create a placeholder `src/pages/index.astro` so the project builds**

```astro
---
// src/pages/index.astro
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>KendoBH</title>
  </head>
  <body>
    <main>Astro is alive.</main>
  </body>
</html>
```

- [ ] **Step 10: Install dependencies**

```bash
pnpm install
```

Expected: pnpm resolves all packages without errors.

- [ ] **Step 11: Verify dev server runs**

```bash
pnpm dev
```

Expected: server starts at `http://localhost:4321/`. Visit it; you should see "Astro is alive." Stop the server with Ctrl-C.

- [ ] **Step 12: Verify production build**

```bash
pnpm build
```

Expected: build succeeds and produces `dist/index.html`. No errors.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Astro project on test-ai

Replaces Vite + Tailwind v3 setup with Astro 5 + Tailwind v4 scaffolding.
Removes obsolete config and the monolithic src/index.html. Adds placeholder
home page so the project builds clean.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Design tokens & global styles

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css` with the full token system**

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* canvas */
  --color-ink-950: #050507;
  --color-ink-900: #0a0a0d;
  --color-ink-800: #14141a;
  --color-ink-700: #1f1f28;
  --color-ink-500: #4a4a55;
  --color-ink-300: #a8a8b3;
  --color-ink-100: #e8e8ec;
  --color-paper: #ffffff;

  /* signature accents */
  --color-kendo-red: #ff2d55;
  --color-iaido-gold: #d4a437;

  /* fonts (referenced after @font-face below) */
  --font-display: "Cabinet Grotesk", system-ui, sans-serif;
  --font-body: "Inter Variable", system-ui, sans-serif;

  /* fluid type scale */
  --text-eyebrow: clamp(0.6875rem, 0.65rem + 0.25vw, 0.75rem);
  --text-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lede: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  --text-h3: clamp(1.25rem, 1.1rem + 0.75vw, 1.625rem);
  --text-h2: clamp(2rem, 1.5rem + 2vw, 3.5rem);
  --text-h1: clamp(2.75rem, 2rem + 4vw, 6rem);
  --text-kanji: clamp(8rem, 6rem + 12vw, 18rem);

  /* spacing rhythms */
  --section-gap: clamp(4rem, 8vw, 7rem);
  --container-pad: clamp(1rem, 4vw, 2rem);

  /* shared */
  --radius-md: 0.375rem;
}

/* font faces are added in Task 4 once the woff2 files exist */

/* base layer overrides */
@layer base {
  html {
    background: var(--color-ink-900);
    color: var(--color-ink-100);
    font-family: var(--font-body);
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;
  }

  body {
    min-height: 100dvh;
  }

  ::selection {
    background: var(--color-kendo-red);
    color: var(--color-paper);
  }

  /* Visible focus on every interactive element */
  :focus-visible {
    outline: 2px solid var(--color-iaido-gold);
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Hide default <details> marker; we render our own chevron */
  summary {
    list-style: none;
    cursor: pointer;
  }
  summary::-webkit-details-marker {
    display: none;
  }
}

/* utilities */
@layer utilities {
  .container-page {
    margin-inline: auto;
    max-width: 1200px;
    padding-inline: var(--container-pad);
  }

  .ghost-kanji {
    position: absolute;
    line-height: 1;
    font-family: var(--font-display);
    font-weight: 700;
    pointer-events: none;
    user-select: none;
    opacity: 0.05;
    z-index: 0;
  }
}
```

- [ ] **Step 2: Verify Tailwind compiles**

```bash
pnpm dev
```

Expected: server starts; visiting `http://localhost:4321` shows the placeholder page on a near-black canvas with light text. No console errors. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(design): add Tailwind v4 tokens and base styles

Defines color, type scale, spacing, and font tokens via @theme.
Adds focus-visible style, prefers-reduced-motion handling, and
custom <details> marker reset.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: BaseLayout + index page shell

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/layouts/BaseLayout.astro`**

```astro
---
// src/layouts/BaseLayout.astro
import "../styles/global.css";

interface Props {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

const {
  title,
  description,
  ogImage = "/og-image.jpg",
  canonical = Astro.url.href,
} = Astro.props;

const siteName = "KendoBH";
---
<!doctype html>
<html lang="pt-BR" class="scroll-smooth">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <meta name="theme-color" content="#0a0a0d" />

    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    <!-- OpenGraph -->
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content={siteName} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={new URL(ogImage, Astro.site)} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={new URL(ogImage, Astro.site)} />

    <!-- JSON-LD wired in Task 15 -->
    <slot name="head" />
  </head>
  <body>
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[var(--color-iaido-gold)] focus:px-3 focus:py-2 focus:text-[var(--color-ink-900)] focus:font-semibold">
      Pular para o conteúdo
    </a>
    <slot name="header" />
    <main id="main">
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

- [ ] **Step 2: Update `src/pages/index.astro` to use the layout**

```astro
---
// src/pages/index.astro
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout
  title="Kendo e Iaido em Belo Horizonte · KendoBH"
  description="Grupo de kendo e iaido tradicionais em Belo Horizonte, vinculado à Confederação Brasileira de Kendo desde 2008. Marque uma aula experimental."
>
  <p class="container-page py-16">Em construção.</p>
</BaseLayout>
```

- [ ] **Step 3: Verify dev render**

```bash
pnpm dev
```

Expected:
- Page title in tab: "Kendo e Iaido em Belo Horizonte · KendoBH"
- View source shows full meta, OG, canonical, theme-color
- "Em construção." renders inside `<main id="main">`
- Tab to focus: skip-to-content link becomes visible at top-left

Stop server.

- [ ] **Step 4: Verify type check**

```bash
pnpm check
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat(layout): add BaseLayout with full head, OG, skip link

Layout owns html/head/body with title, description, canonical,
OpenGraph, Twitter card, theme-color, favicon, and skip-to-content
link. JSON-LD slot is reserved for Task 15.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Self-host fonts

**Files:**
- Create: `public/fonts/CabinetGrotesk-Variable.woff2`
- Create: `public/fonts/InterVariable.woff2`
- Modify: `src/styles/global.css` (add `@font-face`)
- Modify: `src/layouts/BaseLayout.astro` (preload)

- [ ] **Step 1: Download font files**

Cabinet Grotesk Variable from Fontshare:
```bash
mkdir -p public/fonts
curl -L -o public/fonts/CabinetGrotesk-Variable.woff2 \
  "https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@1,2,3,4,5,7,8,9&display=swap" \
  || echo "If automated download fails, manually download from fontshare.com/fonts/cabinet-grotesk and place the woff2 in public/fonts/"
```

If the curl fetches CSS instead of the font binary directly, do this manually:
1. Open https://www.fontshare.com/fonts/cabinet-grotesk in a browser
2. Click "Download family"
3. Extract the variable woff2 file (e.g., `CabinetGrotesk-Variable.woff2`) into `public/fonts/`

Inter Variable (OFL):
```bash
curl -L -o public/fonts/InterVariable.woff2 \
  "https://github.com/rsms/inter/raw/master/docs/font-files/InterVariable.woff2"
```

- [ ] **Step 2: Verify files exist and are real font files (not HTML or 404)**

```bash
file public/fonts/*.woff2
```

Expected output for each: `Web Open Font Format (Version 2), TrueType, ...`. If output says HTML or empty, retry with manual download.

- [ ] **Step 3: Add `@font-face` rules to `src/styles/global.css`**

Insert immediately after `@import "tailwindcss";`:

```css
@font-face {
  font-family: "Inter Variable";
  src: url("/fonts/InterVariable.woff2") format("woff2-variations"),
       url("/fonts/InterVariable.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Cabinet Grotesk";
  src: url("/fonts/CabinetGrotesk-Variable.woff2") format("woff2-variations"),
       url("/fonts/CabinetGrotesk-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 4: Add font preload to BaseLayout `<head>`**

In `src/layouts/BaseLayout.astro`, just before `<slot name="head" />`, add:

```astro
<link rel="preload" href="/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin />
```

(Only the body font is preloaded; display font loads via CSS without preload to keep request count down.)

- [ ] **Step 5: Verify fonts render**

```bash
pnpm dev
```

Expected: Visit `http://localhost:4321`; "Em construção." should now render in Inter (open DevTools → Computed → font-family). No font-loading errors in console.

- [ ] **Step 6: Commit**

```bash
git add public/fonts src/styles/global.css src/layouts/BaseLayout.astro
git commit -m "feat(fonts): self-host Inter Variable and Cabinet Grotesk

Adds variable woff2 files to public/fonts, defines @font-face rules
with font-display: swap, and preloads only the body font weight
visible above the fold.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Content collections (sections, dojos, FAQ)

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/sections/kendo.md`
- Create: `src/content/sections/iaido.md`
- Create: `src/content/sections/history.md`
- Create: `src/content/sections/keiko.md`
- Create: `src/content/dojos.json`
- Create: `src/content/faq.json`

- [ ] **Step 1: Create the collections config**

```ts
// src/content/config.ts
import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const sections = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/sections" }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    eyebrowNumber: z.string(),
    accent: z.enum(["red", "gold", "neutral"]),
    kanji: z.string(),
    lede: z.string().optional(),
  }),
});

const dojos = defineCollection({
  loader: file("./src/content/dojos.json"),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    address: z.object({
      street: z.string(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
    }),
    geo: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    photo: z.string(),
    schedule: z.array(
      z.object({
        day: z.string(),
        time: z.string(),
        modality: z.enum(["kendo", "iaido"]),
      })
    ),
  }),
});

const faq = defineCollection({
  loader: file("./src/content/faq.json"),
  schema: z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
  }),
});

export const collections = { sections, dojos, faq };
```

- [ ] **Step 2: Create `src/content/sections/kendo.md`**

```md
---
title: Kendo
eyebrow: KENDO
eyebrowNumber: "01"
accent: red
kanji: 剣道
---

O Kendo é uma arte marcial japonesa em que se usa o bogu (armadura de proteção) e a shinai (espada de bambu) para treinar as técnicas de luta com a katana (espada japonesa). Segundo a [AJKF](https://www.kendo.or.jp/en/knowledge/) (All Japan Kendo Federation), o objetivo do kendo é desenvolver a mente e o corpo dos praticantes e facilitar o desenvolvimento do caráter humano através do treino persistente.

O propósito de se praticar kendo é moldar a mente e o corpo, cultivar um espírito vigoroso e através do treino correto e rígido, buscar o aperfeiçoamento na arte do kendo, estimar a cortesia e a honra, relacionar-se com os outros com sinceridade e sempre buscar cultivar a si mesmo. Isto vai permitir desenvolver a capacidade de amar seu país e sua sociedade, contribuir para o desenvolvimento da cultura e promover a paz e a prosperidade entre todas as pessoas.

O Kendo evoluiu da necessidade de se transmitir as técnicas de manejo da espada, utilizadas pelos samurais nas diversas escolas/famílias e evoluiu até se tornar uma forma de encarar a vida (ken=espada, do=caminho). Trata-se de uma arte marcial moderna que não é voltada diretamente para autodefesa. As atitudes que aprendemos durante o treinamento usamos no trabalho, na escola, com amigos e família. Durante os treinos é enfatizado a etiqueta, o respeito aos companheiros, o treino árduo e o aperfeiçoamento contínuo. As competições são encaradas como mais uma forma de aprendizado e não são o objetivo final do kendo. Para se ter uma ideia, os campeões do mundial recebem como prêmio uma espada de treino e um diploma — não existem prêmios em dinheiro.
```

- [ ] **Step 3: Create `src/content/sections/iaido.md`**

```md
---
title: Iaido
eyebrow: IAIDO
eyebrowNumber: "02"
accent: gold
kanji: 居合道
---

O iaido é uma arte marcial em que se aprende a sacar, cortar e retornar a espada à bainha em um instante para derrotar um agressor. A prática do iaido estimula o treinamento da mente, do corpo e o desenvolvimento do respeito, concentração, autoconhecimento, autocontrole, autocrítica, atenção aos detalhes entre outras habilidades essenciais no nosso dia-a-dia. Pode-se dizer que é uma prática semelhante a uma meditação em movimento.

A ligação entre o iaido e o kendo é muito próxima e é muito comum se ouvir que são lados de uma mesma moeda. Existem diversas escolas tradicionais de iaido, cada uma com suas próprias formas e protocolos, por isso em 1969 a [AJKF](https://www.kendo.or.jp/en/knowledge/) (All Japan Kendo Federation) estabeleceu o Seitei Iai, 7 formas padronizadas de treino (mais tarde se expandiu para 12 formas) com características representativas dos principais estilos antigos, com o objetivo de transmitir para os estudantes de kendo os princípios do iaido e para que praticantes de diferentes escolas de iai pudessem praticar juntos.

A escola tradicional que treinamos é o Mugai-ryu Iaihyodo. Originalmente a escola se chamava Jikkyo-ryu e o fundador do Mugai-ryu kenjutsu, Tsuji Gettan, aprendeu com seu fundador. Quando ficou claro que Jikkyo-ryu não teria um sucessor, ele foi oficialmente herdado pelos praticantes de Mugai-ryu. Nakagawa Shiryu Shinichi, o décimo primeiro sucessor, foi o responsável pela reforma e compilação do Mugai-ryu e Jikkyo-ryu e estabeleceu o Mugai-ryu Iaihyodo. A ramificação que treinamos é a [Meishi-ha Mugai-ryu Iaihyodo](http://mugairyu-international.com/mugai-ryu) liderada por [Niina Toyoaki](http://mugairyu-international.com/soke).
```

- [ ] **Step 4: Create `src/content/sections/history.md`**

```md
---
title: História
eyebrow: HISTÓRIA
eyebrowNumber: "03"
accent: neutral
kanji: 歴史
---

O kendo em Belo Horizonte começou em 2008 com um grupo de entusiastas que se juntou ao sensei recém-mudado de Brasília. Com o apoio da [AMCNB](https://www.amcnb.com.br/), iniciamos os treinos em outubro daquele ano.

Em 2009 o grupo se expandiu e passou a ter treinos em outros locais. Em fevereiro recebemos a visita da [ABK Brasília](https://www.instagram.com/kendoakb/) e em junho da [CBK (Confederação Brasileira de Kendo)](https://www.instagram.com/cbkendo/), realizando o primeiro seminário oficial de kendo e iaido em Belo Horizonte. No segundo semestre de 2009, nosso grupo foi oficialmente vinculado à CBK e desde então tem participado de diversos eventos promovidos pela confederação.

Em 2017 aconteceu outro grande marco no kendo de BH com a fundação do Matsuoka Budokai, criando um novo local de treino com piso próprio para a prática. Em 2018 realizamos o primeiro campeonato de kendo em Belo Horizonte para comemorar 10 anos do grupo.

O treino de Seitei Iai começou em BH com o apoio da [CBK](https://www.instagram.com/cbkendo/) na visita de 2009, mas a prática ainda era individual e incipiente. Em 2011 outro sensei se mudou para BH iniciando os treinos de Mugai-ryu Iaihyodo. Em 2018 recebemos a visita de senseis do Japão para o primeiro seminário de Mugai-ryu em BH com presença do Gosoke Niina Toyoaki, Kubota-sensei (8º dan) e Komatsu-sensei (6º dan).

Nosso grupo é o **único em Minas Gerais** vinculado à Confederação Brasileira de Kendo, que por sua vez é vinculada à Federação Internacional de Kendo no Japão. Nosso kendo é o **mesmo treinado no Japão e no mundo inteiro.**
```

- [ ] **Step 5: Create `src/content/sections/keiko.md`**

The `lede` is rendered next to the heading; the body Markdown renders above the dojo grid.

```md
---
title: Treinos · Contato
eyebrow: TREINOS · CONTATO
eyebrowNumber: "04"
accent: neutral
kanji: 稽古
lede: "Recebemos novos alunos sempre nas últimas aulas do mês. Marque uma aula experimental por qualquer um dos canais abaixo."
---

A matrícula é de R$ 120,00 e a mensalidade de R$ 70,00. Como o kendo é totalmente voluntário e sem fins lucrativos, todos os valores são usados para o próprio grupo. Emprestamos os equipamentos até você poder comprar o seu, mas exigimos que compre a shinai depois das primeiras aulas por ser um item pessoal de desgaste. Os valores incluem a filiação à Confederação Brasileira de Kendo, permitindo participar de eventos oficiais.

Os requisitos para treinar são roupas adequadas para exercícios físicos e muita vontade de treinar. O kendo pode ser praticado por qualquer pessoa e em qualquer idade — necessidades especiais devem ser avaliadas pelo instrutor responsável, com a devida orientação médica.

O treino prático de kendo usa keikogi e hakama, armadura de proteção (bogu) e a espada de treino (shinai). Também há treinos de kata utilizando a espada de madeira maciça (bokuto/boken). O treino dura de 1h30 a 2h, com alongamento, treino de golpes básicos e treino prático entre todos os alunos. No iaido se treinam movimentos básicos e katas, alternando entre dias de Seitei Iai e Mugai-ryu — iniciantes usam bokuto e saya (bainha); somente avançados utilizam espada de metal.
```

- [ ] **Step 6: Create `src/content/dojos.json`**

```json
[
  {
    "id": "matsuoka",
    "name": "Matsuoka Budokai",
    "address": {
      "street": "R. Barão de Leopoldina, 130",
      "neighborhood": "Alto dos Pinheiros",
      "city": "Belo Horizonte",
      "state": "MG"
    },
    "geo": {
      "lat": -19.9166667,
      "lng": -43.9333333
    },
    "photo": "matsuoka.webp",
    "schedule": [
      { "day": "Quarta-feira", "time": "20:00–21:30", "modality": "iaido" },
      { "day": "Quinta-feira", "time": "20:00–21:30", "modality": "kendo" },
      { "day": "Sábado", "time": "09:30–11:00", "modality": "iaido" },
      { "day": "Domingo", "time": "10:00–12:00", "modality": "kendo" }
    ]
  },
  {
    "id": "amcnb",
    "name": "AMCNB",
    "address": {
      "street": "R. Dom Lourenço de Almeida, 535",
      "neighborhood": "Nova Cachoeirinha",
      "city": "Belo Horizonte",
      "state": "MG"
    },
    "geo": {
      "lat": -19.8853,
      "lng": -43.9658
    },
    "photo": "amcnb.webp",
    "schedule": [
      { "day": "Terça-feira", "time": "20:00–21:30", "modality": "kendo" }
    ]
  }
]
```

> **Note for engineer:** the `geo.lat`/`geo.lng` values above are placeholder neighborhood-level coordinates. Before going live, confirm exact coordinates by searching each address in Google Maps and updating these values.

- [ ] **Step 7: Create `src/content/faq.json`**

```json
[
  {
    "id": "q1",
    "question": "O que preciso para iniciar os treinos?",
    "answer": "Para iniciar, primeiro entre em contato e marque uma aula experimental, que geralmente acontecem nas últimas aulas do mês. As aulas experimentais começam 30 minutos antes das aulas normais, dedicados a aprender os movimentos básicos e a dinâmica do treino. Depois você pode participar normalmente das aulas."
  },
  {
    "id": "q2",
    "question": "Quem pode participar?",
    "answer": "O kendo pode ser praticado por todos, de crianças a adultos, desde que não haja condição médica que impeça. O kendo é um exercício aeróbico exigente e muito técnico, e exige disciplina para evoluir."
  },
  {
    "id": "q3",
    "question": "Quanto custa treinar?",
    "answer": "Atualmente cobramos R$ 120,00 de matrícula e R$ 70,00 de mensalidade, incluindo todos os treinos de todas as modalidades. Os valores também incluem a filiação à Confederação Brasileira de Kendo, permitindo participar de eventos oficiais. Somos um grupo voluntário e todos os valores são usados para o próprio grupo (manutenção do dojo, visitas de professores de fora, etc)."
  }
]
```

- [ ] **Step 8: Verify Astro picks up the collections**

```bash
pnpm check
```

Expected: zero errors. Astro will auto-generate `.astro/types.d.ts` for the collections.

- [ ] **Step 9: Commit**

```bash
git add src/content
git commit -m "feat(content): add Astro Content Collections for sections, dojos, FAQ

Defines Zod schemas for sections (Markdown), dojos and faq (JSON).
Migrates all PT-BR copy from the old src/index.html into structured
content files. Geo coordinates are placeholder neighborhood-level —
to be confirmed before launch.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Header + mobile menu (`<details>`-based)

**Files:**
- Create: `src/components/nav/Header.astro`
- Modify: `src/layouts/BaseLayout.astro` (use Header in named slot)
- Modify: `src/pages/index.astro` (pass Header)

- [ ] **Step 1: Create `src/components/nav/Header.astro`**

```astro
---
// src/components/nav/Header.astro
const navLinks = [
  { href: "#kendo", label: "Kendo" },
  { href: "#iaido", label: "Iaido" },
  { href: "#history", label: "História" },
  { href: "#keiko", label: "Treinos / Contato" },
  { href: "#faq", label: "FAQ" },
];
---
<header class="absolute inset-x-0 top-0 z-40">
  <div class="container-page flex items-center justify-between py-5">
    <a href="#" class="flex items-baseline gap-2 text-[var(--color-paper)]" aria-label="KendoBH — início">
      <span lang="ja" class="text-xl text-[var(--color-kendo-red)] font-[family-name:var(--font-display)] font-bold">剣</span>
      <span class="font-[family-name:var(--font-display)] font-bold tracking-tight uppercase text-base sm:text-lg">KendoBH</span>
    </a>

    {/* Desktop nav */}
    <nav aria-label="Navegação principal" class="hidden md:flex items-center gap-7">
      {navLinks.map((l) => (
        <a href={l.href} class="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-300)] hover:text-[var(--color-paper)] transition-colors">
          {l.label}
        </a>
      ))}
    </nav>

    {/* Mobile menu — <details>-based */}
    <details id="mobile-menu" class="md:hidden relative">
      <summary class="list-none flex items-center justify-center w-10 h-10 rounded text-[var(--color-paper)] hover:bg-[var(--color-ink-800)] cursor-pointer" aria-label="Abrir menu">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
        </svg>
      </summary>

      <nav aria-label="Navegação principal" class="fixed inset-0 z-50 bg-[var(--color-ink-950)]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-8 p-8">
        <button type="button" data-close-menu class="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded text-[var(--color-paper)]" aria-label="Fechar menu">
          <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
          </svg>
        </button>

        {navLinks.map((l) => (
          <a href={l.href} class="text-2xl font-[family-name:var(--font-display)] font-bold uppercase tracking-tight text-[var(--color-paper)]">
            {l.label}
          </a>
        ))}
      </nav>
    </details>
  </div>
</header>

<script is:inline>
  // Close <details> mobile menu when a nav link is clicked, or when the
  // explicit close button is clicked. ~150 bytes minified.
  (function () {
    var menu = document.getElementById("mobile-menu");
    if (!menu) return;
    menu.addEventListener("click", function (e) {
      var target = e.target;
      if (!target) return;
      // Close on link click anywhere inside the open panel
      if (target.tagName === "A" || target.closest("[data-close-menu]")) {
        menu.open = false;
      }
    });
  })();
</script>
```

- [ ] **Step 2: Wire Header into BaseLayout**

In `src/layouts/BaseLayout.astro`, the `<slot name="header" />` already exists from Task 3. No change needed here.

- [ ] **Step 3: Update `src/pages/index.astro` to pass the Header**

```astro
---
// src/pages/index.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/nav/Header.astro";
---
<BaseLayout
  title="Kendo e Iaido em Belo Horizonte · KendoBH"
  description="Grupo de kendo e iaido tradicionais em Belo Horizonte, vinculado à Confederação Brasileira de Kendo desde 2008. Marque uma aula experimental."
>
  <Header slot="header" />
  <p class="container-page py-32 text-center">Em construção.</p>
</BaseLayout>
```

- [ ] **Step 4: Manual verification**

```bash
pnpm dev
```

Test at `http://localhost:4321`:

- **Desktop (≥ 768px):** Logo on left, 5 links on right, no burger.
- **Mobile (< 768px):** Logo on left, burger on right, no horizontal links.
- **Click burger:** full-screen menu appears, X button visible top-right.
- **Click a link:** menu closes, hash updates.
- **Click X:** menu closes.
- **Tab focus:** burger gets focus ring, then X (when open), then links. All keyboard-accessible.

Stop server.

- [ ] **Step 5: Add a Playwright smoke test for menu close-on-link**

Create `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:4321",
  },
  projects: [
    { name: "mobile", use: { viewport: { width: 375, height: 667 } } },
  ],
});
```

Create `tests/e2e/mobile-menu.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("mobile menu opens, navigates, and closes", async ({ page }) => {
  await page.goto("/");

  const menu = page.locator("#mobile-menu");
  await expect(menu).toHaveJSProperty("open", false);

  await page.locator("#mobile-menu > summary").click();
  await expect(menu).toHaveJSProperty("open", true);

  // First nav link inside the open panel
  await page.locator("#mobile-menu nav a").first().click();
  await expect(menu).toHaveJSProperty("open", false);
});

test("mobile menu close button works", async ({ page }) => {
  await page.goto("/");
  await page.locator("#mobile-menu > summary").click();
  await page.locator("[data-close-menu]").click();
  await expect(page.locator("#mobile-menu")).toHaveJSProperty("open", false);
});
```

- [ ] **Step 6: Run the Playwright tests**

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: both tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/nav/Header.astro src/pages/index.astro playwright.config.ts tests/e2e/mobile-menu.spec.ts
git commit -m "feat(nav): add Header with <details>-based mobile menu

Desktop renders horizontal nav above md; mobile uses native <details>
with a fixed full-screen panel. Inline ~150-byte script closes the
menu on link click or close-button click. Playwright smoke covers
open/navigate/close paths.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: SectionHeader UI component + Hero section

**Files:**
- Create: `src/components/ui/SectionHeader.astro`
- Create: `src/components/sections/Hero.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/ui/SectionHeader.astro`**

The shared eyebrow + heading pattern used by every section.

```astro
---
// src/components/ui/SectionHeader.astro
interface Props {
  number: string;
  eyebrow: string;
  accent: "red" | "gold" | "neutral";
}
const { number, eyebrow, accent } = Astro.props;

const accentColor =
  accent === "red"
    ? "var(--color-kendo-red)"
    : accent === "gold"
    ? "var(--color-iaido-gold)"
    : "var(--color-iaido-gold)"; /* neutral sections still use gold for the number */
---
<p class="flex items-center gap-3 text-[length:var(--text-eyebrow)] tracking-[0.35em] uppercase font-bold">
  <span class="text-[var(--color-ink-500)]">{number}</span>
  <span style={`color: ${accentColor}`}>{eyebrow}</span>
</p>
```

- [ ] **Step 2: Create `src/components/sections/Hero.astro`**

```astro
---
// src/components/sections/Hero.astro
---
<section class="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32 md:pt-48 md:pb-40">
  <div aria-hidden="true" class="ghost-kanji text-[length:var(--text-kanji)] text-[var(--color-kendo-red)] -right-[5%] top-[15%]" lang="ja">
    剣
  </div>

  <div class="container-page relative z-10 max-w-[1100px]">
    <p class="text-[length:var(--text-eyebrow)] tracking-[0.4em] uppercase font-bold text-[var(--color-iaido-gold)] mb-8">
      Belo Horizonte · Desde 2008
    </p>

    <h1 class="font-[family-name:var(--font-display)] font-extrabold tracking-[-0.025em] leading-[0.95] text-[length:var(--text-h1)] mb-6">
      O caminho<br />da <span class="text-[var(--color-kendo-red)]">espada viva.</span>
    </h1>

    <p lang="ja" class="text-[var(--color-iaido-gold)] tracking-[0.4em] font-semibold uppercase text-sm mb-8">
      剣道 · 居合道
    </p>

    <p class="text-[length:var(--text-lede)] text-[var(--color-ink-300)] leading-relaxed max-w-[58ch] mb-10">
      Kendo e Iaido tradicionais em Belo Horizonte, vinculados à Confederação
      Brasileira de Kendo e à Federação Internacional de Kendo no Japão.
    </p>

    <dl class="flex flex-wrap gap-x-10 gap-y-2 mb-10 text-xs uppercase tracking-[0.2em] text-[var(--color-ink-500)]">
      <div class="flex items-baseline gap-3">
        <dt class="text-[var(--color-paper)] font-bold">2 modalidades</dt>
        <dd>Kendo · Iaido</dd>
      </div>
      <div class="flex items-baseline gap-3">
        <dt class="text-[var(--color-paper)] font-bold">2 dojos</dt>
        <dd>Matsuoka · AMCNB</dd>
      </div>
    </dl>

    <a href="#keiko" class="inline-flex items-center gap-2 rounded bg-[var(--color-kendo-red)] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-paper)] transition-transform hover:-translate-y-0.5">
      Marcar aula experimental
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
      </svg>
    </a>
  </div>
</section>
```

- [ ] **Step 3: Wire Hero into `src/pages/index.astro`**

```astro
---
// src/pages/index.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/nav/Header.astro";
import Hero from "../components/sections/Hero.astro";
---
<BaseLayout
  title="Kendo e Iaido em Belo Horizonte · KendoBH"
  description="Grupo de kendo e iaido tradicionais em Belo Horizonte, vinculado à Confederação Brasileira de Kendo desde 2008. Marque uma aula experimental."
>
  <Header slot="header" />
  <Hero />
</BaseLayout>
```

- [ ] **Step 4: Manual verification**

```bash
pnpm dev
```

At `http://localhost:4321`:
- Hero renders dark canvas with the headline at large display size
- "espada viva." is in kendo-red
- 剣道 · 居合道 sub-label is in gold
- Ambient `剣` ghost is visible at very low opacity bleeding off the right
- CTA button is gold-on-red and lifts on hover
- At 360px width: heading wraps cleanly, kanji ghost still visible but smaller
- No layout shift on font load

Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/SectionHeader.astro src/components/sections/Hero.astro src/pages/index.astro
git commit -m "feat(sections): add Hero with kanji-led typographic treatment

Implements HC hero from spec: gold eyebrow, display headline with
kendo-red accent on 'espada viva', JA sub-label, lede, meta strip,
single CTA, and ambient 剣 ghost. SectionHeader UI component shared
by remaining sections.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Kendo section

**Files:**
- Create: `src/components/sections/Kendo.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/sections/Kendo.astro`**

```astro
---
// src/components/sections/Kendo.astro
import { Image } from "astro:assets";
import { getEntry, render } from "astro:content";
import SectionHeader from "../ui/SectionHeader.astro";
import kendoPhoto from "../../assets/kendo.webp";

const entry = await getEntry("sections", "kendo");
if (!entry) throw new Error("Missing 'kendo' section content");
const { Content } = await render(entry);
const { eyebrowNumber, eyebrow, accent, kanji } = entry.data;
---
<section id="kendo" class="relative overflow-hidden py-[var(--section-gap)]">
  <div aria-hidden="true" lang="ja" class="ghost-kanji text-[length:var(--text-kanji)] text-[var(--color-kendo-red)] -right-[6%] -top-[5%]">
    {kanji}
  </div>

  <div class="container-page relative z-10 grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:items-start">
    <div>
      <SectionHeader number={eyebrowNumber} eyebrow={eyebrow} accent={accent} />

      <h2 class="font-[family-name:var(--font-display)] font-extrabold leading-[0.95] tracking-[-0.025em] text-[length:var(--text-h2)] mt-6 mb-2">
        <span class="text-[var(--color-kendo-red)]">Kendo</span>
        <span lang="ja" class="text-[var(--color-kendo-red)] text-[0.45em] tracking-[0.1em] align-middle ml-2 opacity-90 font-semibold">{kanji}</span>
        <br />
        <span class="text-[var(--color-paper)]">o caminho</span>
        <br />
        <span class="text-[var(--color-paper)]">da espada.</span>
      </h2>

      <div class="w-12 h-[2px] bg-[var(--color-kendo-red)] my-8" aria-hidden="true"></div>

      <div class="prose-section text-[length:var(--text-body)] leading-[1.7] text-[var(--color-ink-300)] max-w-[58ch]">
        <Content />
      </div>
    </div>

    <figure class="relative">
      <div aria-hidden="true" class="absolute -left-2 -top-2 w-16 h-16 border-t-2 border-l-2 border-[var(--color-kendo-red)]"></div>
      <Image
        src={kendoPhoto}
        alt="Praticantes de kendo em luta usando bogu e shinai"
        widths={[400, 600, 800, 1200]}
        sizes="(max-width: 1024px) 90vw, 45vw"
        class="aspect-[4/5] w-full object-cover rounded-[var(--radius-md)]"
        loading="lazy"
      />
    </figure>
  </div>
</section>

<style>
  .prose-section :global(p) {
    margin-bottom: 1.125rem;
  }
  .prose-section :global(p:last-child) {
    margin-bottom: 0;
  }
  .prose-section :global(a) {
    color: var(--color-kendo-red);
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid color-mix(in srgb, var(--color-kendo-red) 35%, transparent);
    transition: border-color 0.2s ease;
  }
  .prose-section :global(a:hover) {
    border-bottom-color: var(--color-kendo-red);
  }
</style>
```

- [ ] **Step 2: Add Kendo to the page**

```astro
---
// src/pages/index.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/nav/Header.astro";
import Hero from "../components/sections/Hero.astro";
import Kendo from "../components/sections/Kendo.astro";
---
<BaseLayout
  title="Kendo e Iaido em Belo Horizonte · KendoBH"
  description="Grupo de kendo e iaido tradicionais em Belo Horizonte, vinculado à Confederação Brasileira de Kendo desde 2008. Marque uma aula experimental."
>
  <Header slot="header" />
  <Hero />
  <Kendo />
</BaseLayout>
```

- [ ] **Step 3: Manual verification**

```bash
pnpm dev
```

At `http://localhost:4321/#kendo`:
- Eyebrow `01 KENDO` in gold
- Heading "Kendo 剣道 / o caminho / da espada." with "Kendo" + 剣道 in red
- Thin red rule below heading
- 3 paragraphs of body copy at max 58ch width, on `--color-ink-300`
- Inline link to AJKF in red with underline
- Photo on the right at desktop, stacks below text on mobile
- Corner-bracket frame top-left of photo in red
- 剣道 ghost bleeds off-canvas right at very low opacity

Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Kendo.astro src/pages/index.astro
git commit -m "feat(sections): add Kendo section

Mirrored editorial split: copy left, photo right, red accent. Pulls
content from sections/kendo.md collection. Corner-bracket frame on
photo, ambient 剣道 ghost, body copy max-width 58ch, inline links
in red.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Iaido section

**Files:**
- Create: `src/components/sections/Iaido.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/sections/Iaido.astro`**

```astro
---
// src/components/sections/Iaido.astro
import { Image } from "astro:assets";
import { getEntry, render } from "astro:content";
import SectionHeader from "../ui/SectionHeader.astro";
import iaidoPhoto from "../../assets/iaido.webp";

const entry = await getEntry("sections", "iaido");
if (!entry) throw new Error("Missing 'iaido' section content");
const { Content } = await render(entry);
const { eyebrowNumber, eyebrow, accent, kanji } = entry.data;
---
<section id="iaido" class="relative overflow-hidden py-[var(--section-gap)]">
  <div aria-hidden="true" lang="ja" class="ghost-kanji text-[length:var(--text-kanji)] text-[var(--color-iaido-gold)] -left-[6%] -top-[5%]">
    {kanji}
  </div>

  <div class="container-page relative z-10 grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:items-start">
    <figure class="relative order-1 lg:order-none">
      <div aria-hidden="true" class="absolute -right-2 -top-2 w-16 h-16 border-t-2 border-r-2 border-[var(--color-iaido-gold)]"></div>
      <Image
        src={iaidoPhoto}
        alt="Praticante de iaido executando um corte com a espada"
        widths={[400, 600, 800, 1200]}
        sizes="(max-width: 1024px) 90vw, 45vw"
        class="aspect-[4/5] w-full object-cover rounded-[var(--radius-md)]"
        loading="lazy"
      />
    </figure>

    <div>
      <SectionHeader number={eyebrowNumber} eyebrow={eyebrow} accent={accent} />

      <h2 class="font-[family-name:var(--font-display)] font-extrabold leading-[0.95] tracking-[-0.025em] text-[length:var(--text-h2)] mt-6 mb-2">
        <span class="text-[var(--color-iaido-gold)]">Iaido</span>
        <span lang="ja" class="text-[var(--color-iaido-gold)] text-[0.45em] tracking-[0.1em] align-middle ml-2 opacity-90 font-semibold">{kanji}</span>
        <br />
        <span class="text-[var(--color-paper)]">arte de sacar</span>
        <br />
        <span class="text-[var(--color-paper)]">a espada.</span>
      </h2>

      <div class="w-12 h-[2px] bg-[var(--color-iaido-gold)] my-8" aria-hidden="true"></div>

      <div class="prose-section-gold text-[length:var(--text-body)] leading-[1.7] text-[var(--color-ink-300)] max-w-[58ch]">
        <Content />
      </div>
    </div>
  </div>
</section>

<style>
  .prose-section-gold :global(p) {
    margin-bottom: 1.125rem;
  }
  .prose-section-gold :global(p:last-child) {
    margin-bottom: 0;
  }
  .prose-section-gold :global(a) {
    color: var(--color-iaido-gold);
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid color-mix(in srgb, var(--color-iaido-gold) 35%, transparent);
    transition: border-color 0.2s ease;
  }
  .prose-section-gold :global(a:hover) {
    border-bottom-color: var(--color-iaido-gold);
  }
</style>
```

- [ ] **Step 2: Wire into `src/pages/index.astro`**

Add to imports:

```astro
import Iaido from "../components/sections/Iaido.astro";
```

Add `<Iaido />` after `<Kendo />`.

- [ ] **Step 3: Manual verification**

```bash
pnpm dev
```

At `#iaido`:
- Mirrors Kendo: photo left, copy right (stacks photo first on mobile)
- Heading "Iaido 居合道 / arte de sacar / a espada." with "Iaido" + 居合道 in gold
- Gold rule, gold accents on inline links
- 居合道 ghost bleeds off-canvas left

Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Iaido.astro src/pages/index.astro
git commit -m "feat(sections): add Iaido section

Mirrors Kendo with photo left, gold accents, and the Iaido subhead
'arte de sacar / a espada.' Inline links use gold; ambient 居合道
ghost bleeds off the left edge.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: History section

**Files:**
- Create: `src/components/sections/History.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/sections/History.astro`**

```astro
---
// src/components/sections/History.astro
import { Image } from "astro:assets";
import { getEntry, render } from "astro:content";
import SectionHeader from "../ui/SectionHeader.astro";
import historyPhoto from "../../assets/history.webp";

const entry = await getEntry("sections", "history");
if (!entry) throw new Error("Missing 'history' section content");
const { Content } = await render(entry);
const { eyebrowNumber, eyebrow, accent, kanji } = entry.data;
---
<section id="history" class="relative overflow-hidden py-[var(--section-gap)]">
  <div aria-hidden="true" lang="ja" class="ghost-kanji text-[length:var(--text-kanji)] text-[var(--color-paper)] -right-[8%] top-[10%] opacity-[0.04]">
    {kanji}
  </div>

  <div class="container-page relative z-10">
    <div class="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
      <div>
        <SectionHeader number={eyebrowNumber} eyebrow={eyebrow} accent={accent} />
        <h2 class="font-[family-name:var(--font-display)] font-extrabold leading-[0.95] tracking-[-0.025em] text-[length:var(--text-h2)] mt-6 text-[var(--color-paper)]">
          Mais de uma década<br />no caminho.
        </h2>
      </div>
      <p class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-h2)] leading-none text-[var(--color-iaido-gold)] tracking-tight">
        2008 →
      </p>
    </div>

    <div class="prose-section-history mt-10 grid gap-x-12 gap-y-5 text-[length:var(--text-body)] leading-[1.7] text-[var(--color-ink-300)] md:grid-cols-2 max-w-none">
      <Content />
    </div>

    <figure class="mt-14 relative">
      <div aria-hidden="true" class="w-full h-[1px] bg-[var(--color-iaido-gold)] mb-3 opacity-50"></div>
      <Image
        src={historyPhoto}
        alt="Foto de grupo do KendoBH em um seminário"
        widths={[600, 900, 1200, 1600]}
        sizes="(max-width: 1024px) 100vw, 1100px"
        class="w-full aspect-[16/7] object-cover rounded-[var(--radius-md)]"
        loading="lazy"
      />
    </figure>
  </div>
</section>

<style>
  .prose-section-history :global(p) {
    margin: 0;
  }
  .prose-section-history :global(strong) {
    color: var(--color-iaido-gold);
  }
  .prose-section-history :global(a) {
    color: var(--color-iaido-gold);
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid color-mix(in srgb, var(--color-iaido-gold) 35%, transparent);
  }
  .prose-section-history :global(a:hover) {
    border-bottom-color: var(--color-iaido-gold);
  }
</style>
```

- [ ] **Step 2: Wire into page**

Import and add `<History />` after `<Iaido />` in `src/pages/index.astro`.

- [ ] **Step 3: Manual verification**

```bash
pnpm dev
```

At `#history`:
- Eyebrow `03 HISTÓRIA`
- Headline + "2008 →" gold callout side-by-side at lg+
- Body copy two columns at md+, single column at mobile
- "**único em Minas Gerais**" and "**mesmo treinado no Japão e no mundo inteiro**" rendered in gold (from the Markdown `**bold**`)
- Gold thin rule above the wide banner photo
- Faint white 歴史 ghost in background

Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/History.astro src/pages/index.astro
git commit -m "feat(sections): add History section

Asymmetric heading + '2008 →' gold callout, two-column body at md+,
wide banner photo with gold rule above. Markdown **bold** segments
render in gold (the 'único em MG' / 'mesmo treinado no Japão' lines).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Keiko section + DojoCard + ContactCard

**Files:**
- Create: `src/components/ui/DojoCard.astro`
- Create: `src/components/ui/ContactCard.astro`
- Create: `src/components/sections/Keiko.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/ui/DojoCard.astro`**

```astro
---
// src/components/ui/DojoCard.astro
import { Image } from "astro:assets";

interface ScheduleItem {
  day: string;
  time: string;
  modality: "kendo" | "iaido";
}
interface Props {
  name: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  schedule: ScheduleItem[];
  photo: ImageMetadata;
  photoAlt: string;
}
const { name, street, neighborhood, city, state, schedule, photo, photoAlt } = Astro.props;
---
<article class="rounded-[var(--radius-md)] border border-[var(--color-ink-700)] bg-[var(--color-ink-800)] overflow-hidden transition-colors hover:border-[var(--color-iaido-gold)] focus-within:border-[var(--color-iaido-gold)]">
  <Image
    src={photo}
    alt={photoAlt}
    widths={[400, 600, 800]}
    sizes="(max-width: 768px) 90vw, 45vw"
    class="aspect-[16/9] w-full object-cover"
    loading="lazy"
  />
  <div class="p-6">
    <h3 class="font-[family-name:var(--font-display)] font-bold text-[length:var(--text-h3)] tracking-[-0.015em] text-[var(--color-paper)]">{name}</h3>
    <address class="not-italic text-sm text-[var(--color-ink-300)] leading-relaxed mt-2 mb-5">
      {street}<br />
      {neighborhood} · {city} / {state}
    </address>
    <ul class="grid gap-1.5 pt-4 border-t border-[var(--color-ink-700)] text-sm">
      {schedule.map((s) => (
        <li class="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center">
          <span class="text-[var(--color-ink-100)] font-medium">{s.day}</span>
          <span class="text-[var(--color-ink-500)] tabular-nums">{s.time}</span>
          <span
            class="text-[10px] tracking-[0.2em] uppercase font-bold"
            style={`color: ${s.modality === "kendo" ? "var(--color-kendo-red)" : "var(--color-iaido-gold)"}`}
          >
            {s.modality === "kendo" ? "Kendo" : "Iaido"}
          </span>
        </li>
      ))}
    </ul>
  </div>
</article>
```

- [ ] **Step 2: Create `src/components/ui/ContactCard.astro`**

```astro
---
// src/components/ui/ContactCard.astro
interface Props {
  href: string;
  label: string;
  value: string;
  icon: "email" | "whatsapp" | "instagram" | "facebook";
}
const { href, label, value, icon } = Astro.props;
---
<a
  href={href}
  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
  target={href.startsWith("http") ? "_blank" : undefined}
  class="group flex flex-col gap-1.5 p-5 rounded-[var(--radius-md)] border border-[var(--color-ink-700)] bg-[var(--color-ink-800)] transition-all hover:border-[var(--color-kendo-red)] hover:-translate-y-0.5"
>
  <span class="w-5 h-5 text-[var(--color-iaido-gold)]">
    {icon === "email" && (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/></svg>
    )}
    {icon === "whatsapp" && (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592"/></svg>
    )}
    {icon === "instagram" && (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/></svg>
    )}
    {icon === "facebook" && (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/></svg>
    )}
  </span>
  <span class="text-[10px] tracking-[0.3em] uppercase font-bold text-[var(--color-ink-300)] mt-1">{label}</span>
  <span class="text-sm font-semibold text-[var(--color-paper)]">{value}</span>
</a>
```

- [ ] **Step 3: Create `src/components/sections/Keiko.astro`**

```astro
---
// src/components/sections/Keiko.astro
import { getCollection, getEntry, render } from "astro:content";
import SectionHeader from "../ui/SectionHeader.astro";
import DojoCard from "../ui/DojoCard.astro";
import ContactCard from "../ui/ContactCard.astro";
import matsuokaPhoto from "../../assets/matsuoka.webp";
import amcnbPhoto from "../../assets/amcnb.webp";

const entry = await getEntry("sections", "keiko");
if (!entry) throw new Error("Missing 'keiko' section content");
const { Content } = await render(entry);
const { eyebrowNumber, eyebrow, accent, kanji, lede } = entry.data;

const dojos = await getCollection("dojos");
const photoMap: Record<string, ImageMetadata> = {
  "matsuoka.webp": matsuokaPhoto,
  "amcnb.webp": amcnbPhoto,
};

const dojoOrder = ["matsuoka", "amcnb"];
const sortedDojos = dojoOrder
  .map((id) => dojos.find((d) => d.id === id))
  .filter((d): d is NonNullable<typeof d> => d !== undefined);
---
<section id="keiko" class="relative overflow-hidden py-[var(--section-gap)]">
  <div aria-hidden="true" lang="ja" class="ghost-kanji text-[length:var(--text-kanji)] text-[var(--color-iaido-gold)] -left-[6%] top-[5%] opacity-[0.04]">
    {kanji}
  </div>

  <div class="container-page relative z-10">
    <SectionHeader number={eyebrowNumber} eyebrow={eyebrow} accent={accent} />

    <div class="mt-6 grid gap-10 lg:grid-cols-2 lg:items-end">
      <h2 class="font-[family-name:var(--font-display)] font-extrabold leading-[0.95] tracking-[-0.025em] text-[length:var(--text-h2)] text-[var(--color-paper)]">
        Onde<br />treinamos.
        <span lang="ja" class="text-[var(--color-iaido-gold)] text-[0.4em] tracking-[0.1em] align-middle ml-2 opacity-90 font-semibold">{kanji}</span>
      </h2>
      {lede && (
        <p class="text-[length:var(--text-lede)] text-[var(--color-ink-300)] leading-relaxed max-w-[50ch]">{lede}</p>
      )}
    </div>

    <div class="mt-12 prose-keiko text-[length:var(--text-body)] leading-[1.7] text-[var(--color-ink-300)] grid gap-x-12 gap-y-4 md:grid-cols-2 max-w-none">
      <Content />
    </div>

    <div class="mt-14 grid gap-8 sm:grid-cols-2">
      {sortedDojos.map((d) => (
        <DojoCard
          name={d.data.name}
          street={d.data.address.street}
          neighborhood={d.data.address.neighborhood}
          city={d.data.address.city}
          state={d.data.address.state}
          schedule={d.data.schedule}
          photo={photoMap[d.data.photo]}
          photoAlt={`Foto do dojo ${d.data.name}`}
        />
      ))}
    </div>

    <div class="mt-14 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
      <ContactCard
        href="mailto:kendobeaga@gmail.com"
        label="Email"
        value="kendobeaga@gmail.com"
        icon="email"
      />
      <ContactCard
        href="https://wa.me/553172445435"
        label="WhatsApp"
        value="+55 (31) 7244-5435"
        icon="whatsapp"
      />
      <ContactCard
        href="https://www.instagram.com/kendobh/"
        label="Instagram"
        value="@kendobh"
        icon="instagram"
      />
      <ContactCard
        href="https://www.facebook.com/KendoBH"
        label="Facebook"
        value="/KendoBH"
        icon="facebook"
      />
    </div>
  </div>
</section>

<style>
  .prose-keiko :global(p) {
    margin: 0;
  }
</style>
```

- [ ] **Step 4: Wire into page**

Import and add `<Keiko />` after `<History />`.

- [ ] **Step 5: Manual verification**

```bash
pnpm dev
```

At `#keiko`:
- Eyebrow `04 TREINOS · CONTATO`
- Heading "Onde treinamos. 稽古" — gold 稽古 sub-label
- Lede paragraph (first MD paragraph) on right
- 2-up grid of dojo cards (single column on mobile)
- Each dojo card: photo top, name + address, schedule with kendo/iaido tag colors
- 4-up contact row: Email, WhatsApp, Instagram, Facebook
- Hover lifts cards with kendo-red border

Stop server.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/DojoCard.astro src/components/ui/ContactCard.astro src/components/sections/Keiko.astro src/pages/index.astro
git commit -m "feat(sections): add Keiko section with DojoCard + ContactCard

Two-up dojo grid with photo, address, and schedule (color-coded
kendo/iaido tags). Four contact cards (email, WhatsApp, Instagram,
Facebook) with subtle hover lift. Pulls from dojos.json collection.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: FAQ section

**Files:**
- Create: `src/components/sections/Faq.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/sections/Faq.astro`**

```astro
---
// src/components/sections/Faq.astro
import { getCollection } from "astro:content";
import SectionHeader from "../ui/SectionHeader.astro";

const items = (await getCollection("faq")).sort((a, b) => a.data.id.localeCompare(b.data.id));
---
<section id="faq" class="relative py-[var(--section-gap)]">
  <div class="container-page max-w-[820px] mx-auto">
    <SectionHeader number="05" eyebrow="DÚVIDAS FREQUENTES" accent="neutral" />

    <h2 class="font-[family-name:var(--font-display)] font-extrabold leading-[0.95] tracking-[-0.025em] text-[length:var(--text-h2)] mt-6 mb-12 text-[var(--color-paper)]">
      Perguntas frequentes.
    </h2>

    <ul class="grid gap-3" role="list">
      {items.map((q) => (
        <li>
          <details class="group rounded-[var(--radius-md)] border border-[var(--color-ink-700)] bg-[var(--color-ink-800)] open:border-[var(--color-iaido-gold)] transition-colors">
            <summary class="flex items-center justify-between gap-4 p-5 cursor-pointer text-[length:var(--text-h3)] font-[family-name:var(--font-display)] font-semibold text-[var(--color-paper)]">
              <span>{q.data.question}</span>
              <svg class="shrink-0 transition-transform group-open:rotate-180 text-[var(--color-iaido-gold)]" width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
              </svg>
            </summary>
            <div class="px-5 pb-5 pt-1 border-l-2 border-[var(--color-iaido-gold)] ml-5 -mt-1">
              <p class="text-[var(--color-ink-300)] leading-relaxed text-[length:var(--text-body)]">{q.data.answer}</p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Wire into page**

Import and add `<Faq />` after `<Keiko />`.

- [ ] **Step 3: Manual verification**

```bash
pnpm dev
```

At `#faq`:
- Eyebrow `05 DÚVIDAS FREQUENTES`
- Heading "Perguntas frequentes."
- 3 collapsible items (3 questions from `faq.json`)
- Click summary → opens, chevron rotates 180°, gold left border on answer
- Tab to summary, press Enter or Space → toggles. Keyboard works without JS.
- Border becomes gold when open

Stop server.

- [ ] **Step 4: Add Playwright smoke test for FAQ**

Append to `tests/e2e/mobile-menu.spec.ts` or create `tests/e2e/faq.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("FAQ items toggle via keyboard", async ({ page }) => {
  await page.goto("/#faq");
  const firstItem = page.locator("#faq details").first();

  await expect(firstItem).not.toHaveAttribute("open", "");
  await page.locator("#faq summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(firstItem).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(firstItem).not.toHaveAttribute("open", "");
});
```

- [ ] **Step 5: Run tests**

```bash
pnpm test:e2e
```

Expected: all tests pass (including the existing mobile-menu tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Faq.astro src/pages/index.astro tests/e2e/faq.spec.ts
git commit -m "feat(sections): add FAQ with <details>-based accordions

Each FAQ entry renders as a native <details> element — keyboard,
focus, and screen-reader behavior is free. Open state shows a gold
left border on the answer block. Playwright smoke covers keyboard
toggle.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Footer

**Files:**
- Create: `src/components/nav/Footer.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/nav/Footer.astro`**

```astro
---
// src/components/nav/Footer.astro
import { Image } from "astro:assets";
import cbkLogo from "../../assets/cbk-logo.png";
import amcnbLogo from "../../assets/amcnb-logo.png";
import kendobhLogo from "../../assets/kendobh-logo.webp";
const year = new Date().getFullYear();
---
<footer class="bg-[var(--color-ink-950)] py-12 mt-[var(--section-gap)]">
  <div class="container-page">
    <div class="grid gap-8 sm:grid-cols-2 md:grid-cols-[auto_1fr_auto] md:items-center">
      <ul class="flex flex-wrap items-center gap-6">
        <li>
          <a href="https://cbkendo.com.br/" target="_blank" rel="noopener noreferrer" aria-label="Confederação Brasileira de Kendo">
            <Image src={cbkLogo} alt="CBK" widths={[110, 220]} sizes="110px" class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" loading="lazy" />
          </a>
        </li>
        <li>
          <a href="https://www.amcnb.com.br/" target="_blank" rel="noopener noreferrer" aria-label="Associação Mineira de Cultura Nipo-Brasileira">
            <Image src={amcnbLogo} alt="AMCNB" widths={[110, 220]} sizes="110px" class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" loading="lazy" />
          </a>
        </li>
        <li>
          <Image src={kendobhLogo} alt="KendoBH" widths={[110, 220]} sizes="110px" class="h-12 w-auto" loading="lazy" />
        </li>
      </ul>

      <p class="font-[family-name:var(--font-display)] font-bold text-2xl text-[var(--color-paper)] md:text-center">
        <span lang="ja" class="text-[var(--color-kendo-red)]">剣道</span> KENDOBH
      </p>

      <ul class="flex items-center gap-5 md:justify-end">
        <li>
          <a href="https://www.instagram.com/kendobh/" target="_blank" rel="noopener noreferrer" aria-label="Instagram do KendoBH" class="text-[var(--color-ink-300)] hover:text-[var(--color-paper)] transition-colors">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/></svg>
          </a>
        </li>
        <li>
          <a href="https://www.facebook.com/KendoBH" target="_blank" rel="noopener noreferrer" aria-label="Facebook do KendoBH" class="text-[var(--color-ink-300)] hover:text-[var(--color-paper)] transition-colors">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/></svg>
          </a>
        </li>
      </ul>
    </div>

    <p class="mt-10 pt-6 border-t border-[var(--color-ink-700)] text-xs text-[var(--color-ink-500)] text-center">
      © {year} KendoBH · Belo Horizonte / MG
    </p>
  </div>
</footer>
```

- [ ] **Step 2: Wire Footer into BaseLayout**

In `src/pages/index.astro`, add Footer to its named slot:

```astro
import Footer from "../components/nav/Footer.astro";
...
<Footer slot="footer" />
```

- [ ] **Step 3: Manual verification**

```bash
pnpm dev
```

Bottom of page:
- 3 affiliate logos (CBK, AMCNB, KendoBH) — first two are grayscale, gain color on hover
- Wordmark `剣道 KENDOBH` centered
- Instagram + Facebook icons in social row
- Copyright line with current year

Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/components/nav/Footer.astro src/pages/index.astro
git commit -m "feat(nav): add Footer

Affiliate logos (grayscale → color on hover), wordmark, social icons,
and auto-year copyright. Fully responsive.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Create `src/pages/404.astro`**

```astro
---
// src/pages/404.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Header from "../components/nav/Header.astro";
import Footer from "../components/nav/Footer.astro";
---
<BaseLayout
  title="Página não encontrada · KendoBH"
  description="A página solicitada não existe."
>
  <Header slot="header" />
  <section class="container-page py-32 sm:py-48 text-center">
    <p class="text-[length:var(--text-eyebrow)] tracking-[0.4em] uppercase font-bold text-[var(--color-iaido-gold)] mb-6">
      404
    </p>
    <h1 class="font-[family-name:var(--font-display)] font-extrabold leading-[0.95] tracking-[-0.025em] text-[length:var(--text-h2)] mb-6">
      Caminho não encontrado.
    </h1>
    <p class="text-[var(--color-ink-300)] max-w-md mx-auto mb-10">
      A página que você procura não existe. Volte ao início para explorar as modalidades, treinos e contatos.
    </p>
    <a href="/" class="inline-flex items-center gap-2 rounded bg-[var(--color-kendo-red)] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-paper)]">
      Ir para o início
    </a>
  </section>
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: `dist/404.html` is generated.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat(pages): add 404 page

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: SEO meta + JSON-LD + sitemap + robots.txt

**Files:**
- Create: `src/lib/seo.ts`
- Create: `tests/seo.test.ts`
- Modify: `src/pages/index.astro` (inject JSON-LD)
- Create: `public/robots.txt`
- Create: `public/favicon.svg`

- [ ] **Step 1: Write the SEO test first (TDD for the pure logic)**

```ts
// tests/seo.test.ts
import { describe, it, expect } from "vitest";
import {
  buildOrganizationJsonLd,
  buildDojoJsonLd,
  type DojoInput,
} from "../src/lib/seo";

describe("buildOrganizationJsonLd", () => {
  it("returns a valid Organization with sameAs and contact", () => {
    const ld = buildOrganizationJsonLd({
      siteUrl: "https://kendobh.com.br",
    });
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Organization");
    expect(ld.name).toBe("KendoBH");
    expect(ld.url).toBe("https://kendobh.com.br");
    expect(ld.sameAs).toContain("https://www.instagram.com/kendobh/");
    expect(ld.sameAs).toContain("https://www.facebook.com/KendoBH");
  });
});

describe("buildDojoJsonLd", () => {
  it("returns a SportsActivityLocation with full address and geo", () => {
    const dojo: DojoInput = {
      id: "matsuoka",
      name: "Matsuoka Budokai",
      address: {
        street: "R. Barão de Leopoldina, 130",
        neighborhood: "Alto dos Pinheiros",
        city: "Belo Horizonte",
        state: "MG",
      },
      geo: { lat: -19.9, lng: -43.9 },
      schedule: [
        { day: "Quinta-feira", time: "20:00–21:30", modality: "kendo" },
      ],
    };
    const ld = buildDojoJsonLd(dojo);
    expect(ld["@type"]).toBe("SportsActivityLocation");
    expect(ld.name).toContain("Matsuoka");
    expect(ld.address["@type"]).toBe("PostalAddress");
    expect(ld.address.streetAddress).toBe("R. Barão de Leopoldina, 130");
    expect(ld.address.addressLocality).toBe("Belo Horizonte");
    expect(ld.address.addressRegion).toBe("MG");
    expect(ld.address.addressCountry).toBe("BR");
    expect(ld.geo["@type"]).toBe("GeoCoordinates");
    expect(ld.geo.latitude).toBe(-19.9);
    expect(ld.geo.longitude).toBe(-43.9);
  });
});
```

- [ ] **Step 2: Run the test — expect it to fail (no implementation yet)**

```bash
pnpm test
```

Expected: Vitest reports both tests fail because `src/lib/seo.ts` doesn't exist yet.

- [ ] **Step 3: Create `src/lib/seo.ts`**

```ts
// src/lib/seo.ts

export interface DojoInput {
  id: string;
  name: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  geo: { lat: number; lng: number };
  schedule: { day: string; time: string; modality: "kendo" | "iaido" }[];
}

export function buildOrganizationJsonLd({ siteUrl }: { siteUrl: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KendoBH",
    alternateName: "KendoBH — Kendo e Iaido em Belo Horizonte",
    url: siteUrl,
    logo: `${siteUrl}/og-image.jpg`,
    sameAs: [
      "https://www.instagram.com/kendobh/",
      "https://www.facebook.com/KendoBH",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "kendobeaga@gmail.com",
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: ["Portuguese"],
    },
  };
}

export function buildDojoJsonLd(dojo: DojoInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `#dojo-${dojo.id}`,
    name: `KendoBH — ${dojo.name}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: dojo.address.street,
      addressLocality: dojo.address.city,
      addressRegion: dojo.address.state,
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: dojo.geo.lat,
      longitude: dojo.geo.lng,
    },
    sport: ["Kendo", "Iaido"],
    openingHoursSpecification: dojo.schedule.map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: portugueseDayToEnglish(s.day),
      opens: s.time.split("–")[0],
      closes: s.time.split("–")[1],
    })),
  };
}

function portugueseDayToEnglish(day: string): string {
  const map: Record<string, string> = {
    "Segunda-feira": "Monday",
    "Terça-feira": "Tuesday",
    "Quarta-feira": "Wednesday",
    "Quinta-feira": "Thursday",
    "Sexta-feira": "Friday",
    Sábado: "Saturday",
    Domingo: "Sunday",
  };
  return map[day] ?? day;
}
```

- [ ] **Step 4: Run the test again — expect it to pass**

```bash
pnpm test
```

Expected: both tests pass.

- [ ] **Step 5: Inject JSON-LD into `src/pages/index.astro`**

Add to the imports:

```ts
import { getCollection } from "astro:content";
import { buildOrganizationJsonLd, buildDojoJsonLd } from "../lib/seo";

const dojos = await getCollection("dojos");
const orgLd = buildOrganizationJsonLd({ siteUrl: Astro.site!.toString().replace(/\/$/, "") });
const dojoLds = dojos.map((d) => buildDojoJsonLd(d.data));
```

In the `<BaseLayout>`, fill the `head` slot:

```astro
<Fragment slot="head">
  <script type="application/ld+json" set:html={JSON.stringify(orgLd)} />
  {dojoLds.map((ld) => (
    <script type="application/ld+json" set:html={JSON.stringify(ld)} />
  ))}
</Fragment>
```

- [ ] **Step 6: Create `public/robots.txt`**

```txt
User-agent: *
Allow: /

Sitemap: https://kendobh.com.br/sitemap-index.xml
```

- [ ] **Step 7: Create `public/favicon.svg`**

A simple SVG favicon — `剣` glyph in kendo-red on dark.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="8" fill="#0a0a0d"/>
  <text x="32" y="44" font-family="serif" font-size="40" font-weight="700" text-anchor="middle" fill="#ff2d55">剣</text>
</svg>
```

- [ ] **Step 8: Verify build emits sitemap and JSON-LD is in HTML**

```bash
pnpm build
```

Expected:
- `dist/sitemap-index.xml` and `dist/sitemap-0.xml` exist (from `@astrojs/sitemap`)
- `dist/index.html` contains `<script type="application/ld+json">` for the Organization and each dojo
- `dist/robots.txt` and `dist/favicon.svg` exist

Validate JSON-LD in a browser tool (https://search.google.com/test/rich-results) after deploy preview is up — this is a Task 17 check.

- [ ] **Step 9: Commit**

```bash
git add src/lib/seo.ts tests/seo.test.ts src/pages/index.astro public/robots.txt public/favicon.svg
git commit -m "feat(seo): add JSON-LD, robots.txt, sitemap, favicon

Pure typed seo lib with vitest coverage builds Organization and
SportsActivityLocation JSON-LD. Inserted into <head> via BaseLayout
slot. Sitemap auto-generated by @astrojs/sitemap. SVG favicon ships
the 剣 glyph in kendo-red.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: Netlify config + first deploy preview

**Files:**
- Create: `netlify.toml`

- [ ] **Step 1: Create `netlify.toml`**

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "9"
  NPM_FLAGS = "--prefix=/dev/null"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.webp"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.avif"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "interest-cohort=()"
    X-Frame-Options = "DENY"
```

- [ ] **Step 2: Push to remote and create deploy preview**

If the GitHub remote is already configured:

```bash
git push origin test-ai
```

If Netlify is already linked, the push triggers a deploy preview automatically. Otherwise, the user needs to:
1. Log in to Netlify
2. Connect the GitHub repo
3. Configure build (it will pick up `netlify.toml` automatically)

> **Action for user:** confirm the deploy preview URL once Netlify finishes. Do not merge to `main`.

- [ ] **Step 3: Commit `netlify.toml`**

```bash
git add netlify.toml
git commit -m "build: add Netlify config

Static deploy with long-cache headers on hashed assets and security
headers on all responses. Build uses pnpm and Node 20.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

> Do not push the commit to `main`. The user controls when to merge.

---

## Task 17: Accessibility & motion pass

**Files:**
- Modify: `src/styles/global.css` (any final tweaks)
- Create: any missing aria-labels in components if pa11y flags them

- [ ] **Step 1: Run pa11y against the local dev server**

```bash
pnpm dev &
DEV_PID=$!
sleep 5
pnpm exec pa11y http://localhost:4321 --reporter cli --runner axe --include-warnings
kill $DEV_PID
```

Expected: zero errors. Address any warnings that aren't false positives.

Common things to check / fix if flagged:
- Missing `aria-label` on icon-only links → add it.
- Insufficient contrast on muted text → use `--color-ink-300` (17:1) instead of `--color-ink-500` for body content.
- Missing `lang` attribute on Japanese strings → confirm `lang="ja"` is on every `<span>` containing kanji.

- [ ] **Step 2: Manual keyboard walkthrough**

```bash
pnpm dev
```

In the browser, hide the mouse and Tab through the entire page from top to bottom:

- Skip-to-content link appears on first Tab
- Logo link
- Each desktop nav link (or burger on mobile)
- Hero CTA
- Each external link in body copy
- Each contact card
- Each FAQ summary (Enter/Space toggles)
- Each footer link

Every interactive element shows a visible 2px gold focus ring with 2px offset.

- [ ] **Step 3: Reduced-motion check**

In Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion" → "reduce".

Reload the page. Verify:
- No fade-in animations
- Hover transitions are instant (no smooth color/transform changes)
- `<details>` toggles snap open/close
- Smooth scroll is disabled

- [ ] **Step 4: Screen reader smoke test**

If on macOS: enable VoiceOver (Cmd+F5). Tab through the page and verify:
- Skip link is announced first
- Heading hierarchy is sensible (h1 → h2s → h3s)
- Each section landmark is announced
- Photo alts read sensibly in PT-BR
- Japanese kanji is announced with the Japanese voice (because of `lang="ja"`)
- Burger menu announces "Abrir menu" / "Fechar menu" correctly

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix(a11y): address pa11y findings and keyboard pass

[Describe what was fixed if anything was changed; otherwise skip the
commit and move on with no changes.]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

> If no fixes were needed, skip this commit.

---

## Task 18: Lighthouse perf budget verification

**Files:**
- Create: `lighthouserc.cjs`

- [ ] **Step 1: Create `lighthouserc.cjs`**

```js
module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:4321/"],
      startServerCommand: "pnpm preview",
      startServerReadyPattern: "Local",
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 1800 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
```

- [ ] **Step 2: Build and run Lighthouse CI**

```bash
pnpm build
pnpm lh
```

Expected: all assertions pass. If any score is below threshold, the run fails with a list of violations.

Common things that can fail and how to fix:
- **Performance < 95**: most likely image weights. Confirm Astro is emitting AVIF; tighten `widths={[]}` arrays; ensure `loading="lazy"` is correct.
- **CLS > 0.05**: a section is missing intrinsic dimensions. Audit each `<Image />` use site.
- **A11y < 95**: pa11y already covers most; check Lighthouse-specific items like color contrast on small text.
- **SEO < 95**: missing meta description (it's there), missing alt (audit), missing robots.txt or sitemap (both shipped).

- [ ] **Step 3: Run Lighthouse mobile preset for the mobile target**

Open Chrome DevTools → Lighthouse panel → Mobile + simulated throttling. Run audit on the local preview. Confirm Performance ≥ 95.

- [ ] **Step 4: Commit**

```bash
git add lighthouserc.cjs
git commit -m "chore(perf): add Lighthouse CI config with budget gates

Asserts Performance/A11y/Best-Practices/SEO ≥ 95, LCP < 1.8s,
CLS < 0.05, TBT < 200ms. Run via 'pnpm lh' against the preview server.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 19: Final cleanup and README

**Files:**
- Modify: `README.md`
- Modify: `package.json` (clean any leftover unused deps)

- [ ] **Step 1: Verify the project tree is clean**

```bash
ls src/
# expected: assets components content layouts lib pages styles env.d.ts
ls -la
# expected: no vite.config.js, no tailwind.config.cjs, no postcss.config.cjs
ls public/
# expected: favicon.svg, robots.txt, og-image.jpg (if added), fonts/
```

If anything stray remains, delete it.

> **Action for user:** the spec lists `og-image.jpg` (1200×630) as part of `public/`. If it doesn't exist yet, create or supply one with the wordmark + 剣 kanji on a dark background. The OG meta references it via Astro `Astro.site` so a missing file will cause a broken social preview. If you don't have one ready, leave the meta tag in place but acknowledge in the user-review step that this is pending.

- [ ] **Step 2: Rewrite `README.md`**

```md
# KendoBH Landing Page

Single-page site for the Belo Horizonte kendo and iaido group.

Built with [Astro](https://astro.build) (static), [Tailwind CSS v4](https://tailwindcss.com), and self-hosted variable fonts. Deployed on Netlify free tier. PT-BR only.

## Develop

```sh
pnpm install
pnpm dev          # http://localhost:4321
```

## Build

```sh
pnpm build        # static output in ./dist
pnpm preview      # serve dist locally
```

## Tests

```sh
pnpm test         # unit tests (vitest, src/lib/seo.ts)
pnpm test:e2e     # Playwright e2e: mobile menu + FAQ keyboard
pnpm lh           # Lighthouse CI against preview
pnpm check        # Astro / TypeScript type check
```

## Content

PT-BR copy lives in `src/content/`:
- `sections/*.md` — long-form copy per section
- `dojos.json` — dojo data (address, geo, schedule)
- `faq.json` — FAQ entries

Edit these files; no need to touch components.

## Branch policy

Production site is on `main`. The Astro rewrite lives on `test-ai`. Do not merge until the Netlify deploy preview has been visually approved.
```

- [ ] **Step 3: Final type check + build + tests**

```bash
pnpm check
pnpm test
pnpm test:e2e
pnpm build
```

Expected: all four exit 0.

- [ ] **Step 4: Commit**

```bash
git add README.md package.json
git commit -m "docs: rewrite README for the Astro stack

Documents dev/build/test commands, content authoring locations, and
the test-ai branch policy.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Final hand-off

After Task 19, the work is complete on `test-ai`. **Do not merge to `main`.** Hand control back to the user with:

- A summary of commits made on `test-ai`
- The Netlify deploy preview URL (from Task 16)
- Any deferred items: confirmed exact dojo geo coordinates, the `og-image.jpg` if not yet supplied, and the optional Section 13 deferred items from the spec (analytics, custom domain)

The user inspects the deploy preview and decides when to merge.
