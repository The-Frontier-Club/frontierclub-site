# Site map — Lyria

## Routes

| Route | Page file | Description |
|---|---|---|
| `/` | `src/pages/index.astro` | Home — hero, latest episodes (sticky scroll showcase), stories, portfolio, frequency, footer |
| `/about` | `src/pages/about.astro` | About the host (Brandon Green) + team, reviews, frequency |
| `/episodes` | `src/pages/episodes/index.astro` | Episodes showcase grid (from CMS) |
| `/episodes/[slug]` | `src/pages/episodes/[slug].astro` | Episode detail — hero, listen-on links, about-host, related episodes, stories |
| `/blog` | `src/pages/blog/index.astro` | Blog listing (from CMS) |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` | Blog post detail + related posts slider |
| `/contact` | `src/pages/contact.astro` | Contact form (stub) + marquee |
| `/robots.txt` | `src/pages/robots.txt.ts` | Dynamic robots.txt → sitemap |
| `/401` | `src/pages/401.astro` | Password-gate utility page (standalone, no nav/footer) |
| `/404` | `src/pages/404.astro` | Not-found page |

The sitemap (`/sitemap-index.xml`) is generated at build by `@astrojs/sitemap`
and excludes `/401` and `/404`.

## Shared components (`src/components/`)

| Component | Used by | Notes |
|---|---|---|
| `Navbar.astro` | all pages | Logo + full-width "MENU" dropdown (all viewports) |
| `Footer.astro` | all (except 401) | Quick links, seller links, marquee wordmark |
| `LoopSection.astro` | home, about, episodes, contact, episode detail | Scroll-driven marquee (`text-scroll`) / static loop bar (`is-loop`) |
| `FrequencySection.astro` | most | Platform cards; `isSecond` variant for about/episodes |
| `StoriesSection.astro` | home, about, episodes, episode detail | Quote cards; delay/reveal props per page |
| `LatestSection.astro` | home | "Latest" episode grid |
| `PortfolioSection.astro` | home, episodes | Sticky 3-card scroll showcase; `headingTag` prop |
| `TeamSection.astro` | about | Team member cards |
| `ReviewSection.astro` | about | Listener reviews |
| `BlogsSection.astro` | blog | Blog card grid (full-card clickable) |
| `RelatedEpisodesSlider.astro` | episode detail | Swiper carousel |
| `RelatedBlogsSlider.astro` | blog detail | Swiper carousel |

## Animation engine

`src/scripts/scroll-reveal.ts` (mounted in `BaseLayout`) drives all motion:
scroll-into-view reveals (`data-reveal="left|right|bottom|top|shrink"` +
`data-reveal-delay`), the home hero LOAD entrance, scroll-driven + continuous
marquees, word-highlight, link letter-rise hover, portfolio card hover +
cursor-follow, sticky-card scroll, and the detail-page hero parallax + image
reveal. Initial (hidden) states live in `src/styles/anim.css`, gated on
`html.anim-ready` to avoid FOUC and respect `prefers-reduced-motion`.
