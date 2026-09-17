# CLAUDE.md — working in this codebase

Lyria is a static **Astro** podcast/audio template. Plain CSS (Client-First
naming), GSAP animations, file-based content collections. No CSS framework.

## Commands

```bash
npm run dev -- --port 4321   # dev
npm run build                # static -> dist/
```

## Architecture

- **`BaseLayout.astro`** — every page wraps in it. Owns `<head>`: SEO meta, OG,
  Twitter, canonical, JSON-LD (site-wide Organization + WebSite always; per-page
  via the `schema` prop), the font + CSS cascade, and the `<script>` that mounts
  the animation engine. Pass page-specific structured data via `schema={...}`.
- **CSS cascade order** (in `BaseLayout`): `normalize → tokens → webflow →
  global-styles → marquee → grid-slider → components → anim`. Keep custom
  overrides in `components.css`; never edit `webflow.css` (it's the merged
  source stylesheet).
- **Content:** `src/content/{episodes,blogs}/*.json`, schema in
  `src/content.config.ts`. Pages glob the collection and generate routes.

## Animation system (`src/scripts/scroll-reveal.ts`)

- **Reveals:** add `data-reveal="left|right|bottom|top|shrink"` to an element
  (preset slide-in: ∓100px / scale 1.25, 1s, `power3.out`, trigger ~`top 95%`).
  A **bare** `data-reveal` = generic fade + translateY 15% (0.7s). Stagger via
  `data-reveal-delay="<ms>"` (e.g. `100`, `200`, `300` to cascade siblings).
- **FOUC:** initial hidden states are in `src/styles/anim.css`, gated on
  `html.anim-ready` (added in `<head>` only when JS runs and motion is allowed).
  If you add a reveal that must start hidden before paint, add its initial state
  there too. **Always** keep `prefers-reduced-motion` bypassed.
- The engine also handles hover letter-rise (`.link_text-wrap`), card hovers,
  cursor-follow, marquees, sticky-card scroll, and the detail hero parallax.

## Conventions & gotchas

- **GSAP edits:** after changing GSAP-related deps, `rm -rf node_modules/.vite`
  and restart dev. Editing the `.ts` itself does **not** need this.
- The `504 (Outdated Optimize Dep)` console error from the Astro dev-toolbar is
  a Vite artifact — harmless.
- Letter-rise hover binds to the `.link_text-wrap` element itself (not a wrapping
  `<a>`), so full-card-clickable cards don't trigger it on whole-card hover.
- Blog cards (`.article_card`) are **fully clickable** (whole card is the `<a>`,
  "Read more" is decorative). Episode/latest cards are not full-card — they use
  separate image/title/read-more links.
- A few animation hooks in the markup are **inert** (`animation="loop"`/
  `"text-loop"`): they have no handler and are intentionally static. Don't animate
  them.
- Verify motion with Playwright by scrolling the page and asserting no
  `[data-reveal]` stays at `opacity < 0.95`. For stagger timing, gate the engine
  with `gsap.globalTimeline.timeScale(0.1)` and scroll a below-fold element.
