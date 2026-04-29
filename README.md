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
