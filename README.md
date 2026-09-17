# `Lyria` — Astro code template

> A pixel-perfect Astro template for podcasts and audio shows — fast, static-first, with GSAP animations and a file-based episode CMS.

**Live demo:** https://lyria.temlis.workers.dev

---

## ✨ What's inside

- **Astro 6** static-first framework (SSG, zero-JS by default — no React / islands)
- **CSS plain + Client-First** class naming (Webflow-style — easy to customize)
- **GSAP 3 + ScrollTrigger** animations
- **Swiper 11** sliders / carousels
- **TypeScript** strict
- **Content Collections** for type-safe, markdown-based content (blog, services, team…)
- **Optimized assets** (AVIF / WebP images, self-hosted fonts)
- **SEO** — sitemap via `@astrojs/sitemap`
- **Cloudflare Workers-ready** deploy config (GitHub Actions)

---

## 🚀 Quick start

```bash
# 1. Clone or download this template
git clone <your-repo-url> my-site
cd my-site

# 2. Install dependencies (Node 22.12+)
npm install

# 3. Start the dev server → http://localhost:4321
npm run dev

# 4. Build for production
npm run build

# 5. Preview the production build locally
npm run preview
```

**Requirements:** Node 22.12+ (LTS) · npm 10+

---

## 🗺️ Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/blog` | Blog |
| `/contact` | Contact |
| `/episodes` | Episodes |
| `/blog/[slug]` | Blog detail (dynamic) |
| `/episodes/[slug]` | Episodes detail (dynamic) |
| `/401` | Auth (Webflow, noindex) |
| `/404` | Not found |
| `/robots.txt` | Robots |

---

## 📁 Project structure

```
lyria/
├── astro.config.mjs              # Astro config + integrations
├── package.json
├── tsconfig.json                 # TS strict
├── wrangler.jsonc                 # Cloudflare Workers config (assets-only)
├── .github/workflows/deploy.yml  # CI → Cloudflare Workers on push to main
├── public/                       # Static assets (images, fonts, icons)
└── src/
    ├── layouts/                   # BaseLayout + CSS imports
    ├── styles/                    # tokens / global / component CSS
    ├── components/                # PascalCase .astro sections
    ├── content/                   # markdown collections + Zod schemas
    ├── pages/                     # file-based routing
    └── scripts/                   # GSAP / interaction TS
```

---

## 🎨 Customization

- **Brand colors:** edit `src/styles/tokens.css`
- **Fonts:** edit the fontsource imports in `package.json` and the family references in `tokens.css`
- **Content (CMS):** edit the markdown files in `src/content/`
- **Page sections / copy:** edit the component files in `src/components/`
- **Animations:** edit the GSAP setup in `src/scripts/`

---

## 📤 Deploy — Cloudflare Workers

This template ships with `.github/workflows/deploy.yml` for **Cloudflare Workers** (static assets).

1. Set the repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
2. Push to `main` → GitHub Actions runs `npm ci` → `npm run build` → `wrangler deploy`.
3. Worker name: `lyria` → live at **https://lyria.temlis.workers.dev**

> Static Astro output — also deployable to any static host (Netlify, Vercel, or any `dist/` server).

---

## 📝 License

Single license per purchase. Use on unlimited projects you build for yourself or clients. You may not resell or redistribute the template files.

---

Part of the **Temlis** template catalog (Produlis). Ported to Astro with [Claude Code](https://claude.com/claude-code).
