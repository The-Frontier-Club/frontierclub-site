import type { APIRoute } from 'astro';

// Dynamic robots.txt - allows all crawlers and points to the sitemap that
// @astrojs/sitemap generates (sitemap-index.xml). The host is derived from the
// configured `site` (astro.config), so it stays correct across the deploy URL.
// Per-page noindex (401/404) is handled by the <meta name="robots"> in BaseLayout.
export const GET: APIRoute = ({ site }) => {
  const base = site?.toString() ?? 'https://joinfrontierclub.com';
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', base).href}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
