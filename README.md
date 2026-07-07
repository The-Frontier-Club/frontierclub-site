# The Frontier Club — Website

Creator-led travel company site. Built with Astro, hosted on Netlify, domain: joinfrontierclub.com.

## Local development
```
npm install
npm run dev      # local preview at localhost:4321
npm run build    # production build to /dist
```

## Structure
- `src/layouts/Layout.astro` — shared page shell (head tags, nav, footer)
- `src/components/` — Nav, Footer
- `src/pages/` — one file per page (index, calendar, leaders, about, contact)
- `src/styles/global.css` — design tokens (colors, type, spacing) — PLACEHOLDER until brand pass
- `public/images/` — photos and assets

## Deploy (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- Contact form uses Netlify Forms (works automatically once hosted on Netlify)

## Next steps
1. Brand pass: real colors, fonts, logo in `global.css`
2. Real trip data in `src/pages/calendar.astro`
3. Leader bios + photos in `src/pages/leaders.astro`
4. Founding story in `src/pages/about.astro`
5. Real photography throughout
