# Customizing Lyria

## Content (episodes & blog)

Entries are JSON files under `src/content/`. Add or edit a file and the route,
listing card, and detail page update automatically. Images live in
`public/images/` and are referenced by absolute path (e.g. `/images/cms/my-art.webp`).

### Episode — `src/content/episodes/<slug>.json`

| Field | Type | Notes |
|---|---|---|
| `name` | string | **required** — episode title |
| `number` | string | e.g. `"26"` (shown as `#26`) |
| `author` | string | host / guest |
| `date` | string | display date |
| `shortDescription` | string | card + meta description |
| `thumbnail` | string | main image (card **and** detail hero use this) |
| `cover` | string | small square cover |
| `image` | string | wide photo |
| `description` | string | rich-text HTML for the body |
| `spotify` / `youtube` / `applePodcast` | string | "listen on" links (omit → the link is hidden/inert) |
| `order` | number | sort order (higher = newer) |

The file name (without `.json`) becomes the URL slug.

### Blog post — `src/content/blogs/<slug>.json`

| Field | Type | Notes |
|---|---|---|
| `name` | string | **required** — post title |
| `author`, `date`, `shortDescription` | string | meta |
| `thumbnail` | string | card + hero image |
| `resumen` | string | rich-text HTML body |
| `order` | number | sort order (higher = newer) |

> **Images:** export as WebP (or AVIF) for size. Convert any new PNG/JPG before
> adding it — the bundled CMS images are WebP at ~quality 82.

## Contact form

The form in `src/pages/contact.astro` is a **stub**: it validates natively, then
reveals the success message. No backend is wired. To connect a provider
(Formspree, Basin, a Worker, etc.), replace the `submit` handler in the inline
`<script>` at the bottom of `contact.astro` with a `fetch()` to your endpoint.

## Branding

- **Logo / wordmark:** `public/images/Lyria*.svg` and the `brand` / `logoSrc`
  props passed to `<Navbar>` in each page.
- **Colors & fonts:** CSS custom properties in `src/styles/tokens.css`
  (background `#010314`, accent `#bbdbfa`). Fonts are imported in
  `BaseLayout.astro` via `@fontsource`.
- **og-image:** `public/images/og-image.jpg` (1200×630). Replace with your own.
- **Default meta:** the fallback title/description live in `BaseLayout.astro`.

## Deploy

Built for **Cloudflare Workers** (`wrangler.jsonc`). Before deploying, set the
real public URL so canonical/OG/sitemap links resolve correctly:

```bash
# build-time env var (or a CI/repo variable)
SITE_URL="https://your-domain.com" npm run build
npx wrangler deploy
```

`astro.config.mjs` reads `SITE_URL` (falling back to a placeholder). The
`robots.txt` and sitemap derive their host from it automatically.
