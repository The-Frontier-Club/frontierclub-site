# Handoff — Mission 200 website

Paste this to Claude Code as your first message when you open this project,
so it has the context this build so far doesn't otherwise carry.

## Who I am / background
- G, a brand and creative consultant based in Gibraltar, working with
  founder-led/growth-stage businesses. Design and brand strategy background —
  no web development experience.

## The project
- Mission 200: a founding community of 200 members for The Frontier Club, a
  group travel community co-founded by Harry Jaggard and Kieran Brown.
- Built from a Temlis Astro template ("Lyria" — originally a podcast site).
- Site is a **single scrolling page** (`src/pages/index.astro`). Nav links
  are same-page anchors (`#founders`, `#trip`, `#stories`) except Apply,
  which is the **only** link that leaves the page (currently a placeholder
  URL — see Open Items).

## What's done
- **Brand**: Mission 200 is the brand name throughout (copy, meta, footer).
  The visual logo (`public/images/frontier-club-logo.png`) reads "THE
  FRONTIER CLUB" — that's intentional, not a mismatch to fix. Accent color
  is `#bbff50` (lime), set via the `--base--sky-blue` token — see the
  comment in `src/styles/components.css` for why it had to be overridden
  there specifically, not in `tokens.css` directly (cascade order issue).
- **Homepage sections**: Hero, Founders, The Trip (South Africa — see
  `src/lib/trip.ts` + `src/content/highlights/*.json`), Stories
  (testimonials), "Stay in the Know," marquee, footer.
- **Trips content model**: `src/content.config.ts` has two *separate*
  collections — `episodes` (the old per-trip-detail-page model, kept alive
  but unlinked from nav) and `highlights` (the new non-linking highlight
  cards for the one hero trip). Don't merge these without checking both
  still work — see comments in that file for why they're split.
- **Privacy policy**: `/privacy`, linked from the footer. Contact email is
  contact@joinfrontierclub.com. Several `[TODO]` HTML comments remain in
  `src/pages/privacy.astro` for facts only a lawyer/the founders can
  confirm (legal entity name, registered address, which specific
  third-party tools are actually in use, supervisory authority for
  complaints). **This page needs an actual lawyer's review before real
  applicants use the site — it's a solid draft, not legal sign-off.**

## Orphaned but intentionally kept
`/about`, `/episodes`, `/episodes/[slug]`, `/blog`, `/contact` still exist
and still build, but aren't linked from the live one-pager's nav or footer.
Decision was made explicitly to leave them rather than delete — revisit
when there's a reason to.

## Open items, roughly in priority order
1. **Real Apply form** — every "Apply" link/button currently points to
   `https://your-form-tool.com/frontier-club-application` (search this
   exact string to find every instance). Once a real Typeform/Tally form
   exists, swap this in everywhere it appears.
2. **Real images** — hero video, founder photos, trip highlight photos are
   all still placeholder/stock content from the original template.
3. **GitHub + deployment** — nothing has been pushed to GitHub yet. This
   template ships with `.github/workflows/deploy.yml` already configured
   for Cloudflare Workers — needs a GitHub repo created, the two Cloudflare
   secrets added (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), then a
   push to `main` to go live.
4. Privacy policy lawyer review + the facts listed in its `[TODO]` comments.
5. Domain + DNS, once deployed.

## Working style notes
I have no coding background — please explain what you're doing and why in
plain language as you go, the way you would to someone who understands
brand/design but not code. I'd rather understand a change than just receive
it.
