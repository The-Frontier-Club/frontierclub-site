// scroll-reveal.ts — Lyria animation system (Phase S3).
// Faithful recreation of the source's two animation runtimes, decoded from
// lyria-temlis.js (see lyria-source/ANIMATION_MAP.md):
//
//   IX3 (GSAP timelines, attribute hooks `animation="..."`):
//     • Hero LOAD entrance .................. t-60b4c794  (wf:load, site-wide)
//     • Section vertical parallax ........... t-c52944a0  (scroll-scrub, .section_latest)
//     • Scroll-driven marquee ............... t-bac9e1e3  (scroll-scrub, .loop_flex)
//     • Word highlight (light-up) ........... t-a924af47  (scroll-scrub, [animation="highlight"])
//     • Per-letter link hover swap .......... t-0a1ab51c  (hover, .link_text-wrap)
//
//   IX2 (legacy):
//     • Generic "View" reveal ............... actionList a  (opacity+translateY15%) → [data-reveal]
//     • Continuous "Loop" marquee ........... actionList loop → [animation="loop"/"text-loop"]
//
// Easing index decoded from the JS easing array:
//   0=none · 8=power3.out · 11=power4.out · 28=sine.in · 29=sine.out · 30=sine.inOut
// Legacy IX2 strings: outQuart→power3.out.
//
// FOUC: initial hidden states for the LOAD + View reveals live in anim.css,
// gated on `html.anim-ready` (added synchronously in <head> only when motion is
// allowed). GSAP overrides those with inline styles as it animates. No JS / no
// GSAP / reduced-motion → the gate never applies → everything is visible.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = <T extends HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/* ============================================================================
   A) Hero LOAD entrance — timeline t-60b4c794 (wf:load, site scope → every page)
   One timeline; all actions positioned on the same line:
     home-img         scale 1.2→1      pos 0    dur .6  sine.in
     item             scale 0→1        pos 0    stagger amount .3 (from start)  sine.in
     home-text        opacity 0→1      pos .1                                   sine.inOut
     text-description opacity+y100%→0  pos .1   stagger amount .2  SplitText words, masked  sine.inOut
     tag              opacity+y100%→0  pos .1   stagger amount .3                sine.inOut
   ========================================================================== */
function initHeroLoad() {
  if (reduce) return;
  const tl = gsap.timeline({ defaults: { duration: 0.5 } }); // IX3 DEFAULTS.DURATION

  $$('[animation="home-img"]').forEach((el) =>
    tl.fromTo(el, { scale: 1.2 }, { scale: 1, duration: 0.6, ease: 'sine.in' }, 0)
  );

  const items = $$('[animation="item"]');
  if (items.length)
    tl.fromTo(
      items,
      { scale: 0 },
      { scale: 1, duration: 0.5, ease: 'sine.in', stagger: { amount: 0.3, from: 'start' } },
      0
    );

  $$('[animation="home-text"]').forEach((el) =>
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, ease: 'sine.inOut' }, 0.1)
  );

  $$('[animation="text-description"]').forEach((el) => {
    gsap.set(el, { opacity: 1 }); // element visible; the split words carry the fade
    const split = new SplitText(el, { type: 'words', mask: 'words' });
    tl.fromTo(
      split.words,
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, ease: 'sine.inOut', stagger: { amount: 0.2 } },
      0.1
    );
  });

  const tags = $$('[animation="tag"]');
  if (tags.length)
    tl.fromTo(
      tags,
      { opacity: 0, yPercent: 100 },
      { opacity: 1, yPercent: 0, duration: 0.5, ease: 'sine.inOut', stagger: { amount: 0.3 } },
      0.1
    );
}

/* ============================================================================
   B) Scroll-into-view reveals → [data-reveal]
   The source drives these with Webflow IX2 SLIDE/SHRINK presets (decoded from
   the bundle), NOT a single generic reveal. Each preset is opacity 0→1 plus a
   directional move, all 1000ms / outQuart (= power3.out) / delay 0, fired once
   when the element scrolls ~5% into view (≈ start "top 95%").

     data-reveal="left"   → translateX -100px → 0   (slideInLeft)
     data-reveal="right"  → translateX +100px → 0   (slideInRight)
     data-reveal="bottom" → translateY +100px → 0   (slideInBottom)
     data-reveal="top"    → translateY -100px → 0   (slideInTop)
     data-reveal="shrink" → scale 1.25 → 1          (shrinkIn)

   A bare `data-reveal` (no/!unknown value) falls back to the legacy generic
   reveal (opacity + translateY 15%, 0.7s) used on pages not yet tuned to the
   source presets. `data-reveal="<number>"` sets that legacy reveal's delay.

   Per-element stagger: each Webflow SCROLL_INTO_VIEW event carries its own
   `delay` (ms) in the event config — sections cascade their children 0 / 100 /
   200 / 300 ms even though they enter the viewport together. Carry that with
   `data-reveal-delay="<ms>"` on the preset path.
   ========================================================================== */
const SLIDE_PX = 100; // source preset move distance
function presetVars(dir: string): [gsap.TweenVars, gsap.TweenVars] | null {
  switch (dir) {
    case 'left': return [{ opacity: 0, x: -SLIDE_PX }, { opacity: 1, x: 0 }];
    case 'right': return [{ opacity: 0, x: SLIDE_PX }, { opacity: 1, x: 0 }];
    case 'bottom': return [{ opacity: 0, y: SLIDE_PX }, { opacity: 1, y: 0 }];
    case 'top': return [{ opacity: 0, y: -SLIDE_PX }, { opacity: 1, y: 0 }];
    case 'shrink': return [{ opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1 }];
    default: return null;
  }
}
function initViewReveal() {
  if (reduce) return;
  $$('[data-reveal]').forEach((el) => {
    const dir = (el.dataset.reveal || '').trim();
    const preset = presetVars(dir);
    if (preset) {
      const delay = (parseFloat(el.dataset.revealDelay || '0') || 0) / 1000; // ms → s
      gsap.fromTo(el, preset[0], {
        ...preset[1],
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      });
    } else {
      const delay = parseFloat(dir) || 0.1;
      gsap.fromTo(
        el,
        { opacity: 0, yPercent: 15 },
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.7,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      );
    }
  });
}

/* ============================================================================
   C) Section vertical parallax — timeline t-c52944a0
   Trigger .section_latest (scrub .8, top bottom → bottom top); targets within:
   [animation="section"] yPercent 12 → -12, linear.
   ========================================================================== */
function initSectionParallax() {
  if (reduce) return;
  $$('.section_latest').forEach((section) => {
    $$('[animation="section"]', section).forEach((el) =>
      gsap.fromTo(
        el,
        { yPercent: 12 },
        {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        }
      )
    );
  });
}

/* ============================================================================
   D) Scroll-driven marquee — timeline t-bac9e1e3
   Trigger .loop_flex (scrub .8, top bottom → bottom top); two rows slide opposite:
   text-scroll-one x -100%→0%, text-scroll-two x 0%→-100%, linear.
   ========================================================================== */
function initScrollMarquee() {
  if (reduce) return;
  $$('.loop_flex').forEach((flex) => {
    const st = { trigger: flex, start: 'top bottom', end: 'bottom top', scrub: 0.8 } as const;
    $$('[animation="text-scroll-one"]', flex).forEach((el) =>
      gsap.fromTo(el, { xPercent: -100 }, { xPercent: 0, ease: 'none', scrollTrigger: st })
    );
    $$('[animation="text-scroll-two"]', flex).forEach((el) =>
      gsap.fromTo(el, { xPercent: 0 }, { xPercent: -100, ease: 'none', scrollTrigger: st })
    );
  });
}

/* ============================================================================
   E) Scroll word-highlight — timeline t-a924af47
   Trigger [animation="highlight"] (scrub .8, top bottom → bottom center);
   SplitText words, each opacity 50%→100%, stagger each .2, linear.
   ========================================================================== */
function initHighlight() {
  if (reduce) return;
  $$('[animation="highlight"]').forEach((el) => {
    const split = new SplitText(el, { type: 'words' });
    gsap.fromTo(
      split.words,
      { opacity: 0.5 },
      {
        opacity: 1,
        ease: 'none',
        stagger: { each: 0.2 },
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom center', scrub: 0.8 },
      }
    );
  });
}

/* ============================================================================
   F) Per-letter link hover swap — timeline t-0a1ab51c
   Source applies to ALL .link_text-wrap site-wide; the navbar already wires its
   own copies, so here we handle every .link_text-wrap OUTSIDE [data-navbar].
   Both .text_link_tag copies' chars slide y → -100%, stagger amount .2 from
   start, power4.out; reverse on mouseleave.
   ========================================================================== */
function initLinkHover() {
  if (reduce) return;
  $$('.link_text-wrap').forEach((wrap) => {
    if (wrap.closest('[data-navbar]')) return; // navbar handles its own
    const tags = $$('.text_link_tag', wrap);
    if (!tags.length) return;
    const splits = tags.map((t) => new SplitText(t, { type: 'chars' }));
    const seq: Element[] = [];
    const max = Math.max(...splits.map((s) => s.chars.length));
    for (let i = 0; i < max; i++) for (const s of splits) if (s.chars[i]) seq.push(s.chars[i]);
    const tl = gsap.to(seq, {
      yPercent: -100,
      duration: 0.5,
      ease: 'power4.out',
      stagger: { amount: 0.2, from: 'start' },
      paused: true,
    });
    // Source IX t-0a1ab51c triggers on `mouseenter` of the `.link_text-wrap`
    // ITSELF (pluginConfig type:"mouseenter", trigger class "link_text-wrap").
    // Bind to the wrap, NOT a wrapping <a>: now that blog cards are a full-card
    // <a>, `closest('a')` would be the whole card → the letter-rise would fire on
    // any card hover (it doesn't in the source — only the read-more text does).
    wrap.addEventListener('mouseenter', () => tl.play());
    wrap.addEventListener('mouseleave', () => tl.reverse());
  });
}

/* ============================================================================
   G) Continuous "Loop" marquee — the giant LYRIA footer wordmark only.
   In the source this is the footer's CSS `footerMarquee` keyframes; we drive it
   in JS so any number of identical copies wraps seamlessly at one child width.
   NOTE: the `animation="loop"/"text-loop"` attribute hooks (e.g. the episode-
   detail `.loop_flex.is-loop` bar) have NO handler in the source JS/CSS — they
   are inert, so that bar is STATIC. Do not animate it.
   ========================================================================== */
function continuousMarquee(track: HTMLElement, pxPerSecond: number, dir: 1 | -1) {
  const first = track.children[0] as HTMLElement | undefined;
  if (!first) return;
  const styles = getComputedStyle(track);
  const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
  const step = first.getBoundingClientRect().width + gap;
  if (step <= 0) return;
  const wrap = gsap.utils.wrap(-step, 0);
  gsap.to(track, {
    x: dir < 0 ? `-=${step}` : `+=${step}`,
    duration: step / pxPerSecond,
    ease: 'none',
    repeat: -1,
    modifiers: { x: (x) => `${wrap(parseFloat(x))}px` },
  });
}

function initLoopMarquee() {
  if (reduce) return;
  // Footer wordmark: the row of repeated LYRIA logos (the only continuous loop).
  $$('.footer_track').forEach((track) => continuousMarquee(track, 80, -1));
}

/* ============================================================================
   H) Hero image parallax — source IX a-60 "Parallax Image" (already approved).
   TWO targets: the frame `.home_hero-img` lags down so the title/links overlap
   it, and the inner `.img-parallax` crop drifts gap-safe within the frame.
   ========================================================================== */
function initHeroParallax() {
  if (reduce) return;
  $$('.home_hero-img').forEach((frame) => {
    const section = frame.closest<HTMLElement>('.section_hero') ?? frame;
    // Source a-60 "Parallax Image" (SCROLL_PROGRESS). Spans the full hero transit
    // so the image is already offset at the top of the page and keeps drifting —
    // matching the published site. The frame and the inner crop (.img-parallax)
    // move at DIFFERENT rates (the inner image drifts a touch more), which is the
    // parallax-within-parallax look of the published page.
    const trigger = { trigger: section, start: 'top top', end: 'bottom top', scrub: 1.2 } as const;
    // Start slightly pre-offset (matches the published, where the image is already
    // a few px down at the top of the page) and drift down as you scroll. The
    // inner crop ends a touch further than the frame → the parallax-within-parallax.
    gsap.fromTo(frame, { yPercent: 2 }, { yPercent: 16, ease: 'none', scrollTrigger: trigger });
    const img = frame.querySelector<HTMLElement>('.img-parallax');
    if (img) {
      gsap.fromTo(
        img,
        { yPercent: 2.5 },
        { yPercent: 14.5, ease: 'none', scrollTrigger: { ...trigger, invalidateOnRefresh: true } }
      );
    }
    // The entrance fade for this image lives in initHeroImageReveal() (shared
    // with the blog-detail hero), so it composes the same way on both pages.
  });
}

/* ============================================================================
   H2) Detail-page hero image entrance — DESIGNER ADDITION (not in the Webflow
   source; both detail hero images are static/parallax-only in the original).
   Simple opacity 0→1 + translateY 15%→0 from below, power3.out (the project's
   View-reveal vocabulary). Applied to BOTH detail heroes:
     • episode detail → .home_hero-img (also carries the a-60 parallax above;
       GSAP keeps `y` and `yPercent` as independent transform parts, so the
       entrance `y` and the scrubbed parallax `yPercent` simply sum — no fight).
     • blog detail   → .hero_blog (static, no parallax).
   Initial opacity:0 is gated in anim.css (`html.anim-ready .home_hero-img,
   .hero_blog`) to avoid FOUC; reduced-motion bypasses entirely.
   ========================================================================== */
function initHeroImageReveal() {
  if (reduce) return;
  // .home_hero-img / .hero_blog = detail hero images; [data-rise-reveal] lets any
  // element opt into the same entrance (e.g. the Episodes cards container).
  $$('.home_hero-img, .hero_blog, [data-rise-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: '15%' },
      {
        opacity: 1,
        y: '0%',
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      }
    );
  });
}

/* ============================================================================
   I) Portfolio card image hover — source a-52/a-53 ("Cursor Hover Card In/Out")
   On hover the "View More" pill (.view_button) scales + fades in (it starts
   hidden via CSS) and the image contrast pops 70% → 120%; reverse on leave.
   500ms outQuart (= power3.out). The pill's transform is GSAP-owned so the
   cursor-follow (a-40) can compose with the scale on the same element.
   ========================================================================== */
function initPortfolioHover() {
  if (reduce) return;
  // .portfolio_img = episode showcase cards; .article_img = blog cards (blogs.html
  // a-52/a-53 hover + a-40 cursor-follow on .view_wrap). Same inner structure
  // (.view_button + .img), so one binding covers both.
  $$('.portfolio_img, .article_img').forEach((card) => {
    const btn = card.querySelector<HTMLElement>('.view_button');
    const img = card.querySelector<HTMLElement>('.img');
    if (!btn) return;
    // Cursor follow: the pill drifts toward the pointer. The large showcase
    // cards (a-40 "…Large Card") travel x −200→+200px / y −220→+220px; the
    // smaller related-slider cards (a-64 "…Small Card") travel ±100px on both
    // axes. quickTo only animates x/y, leaving scale/opacity from the hover
    // tween untouched (both compose into one transform).
    const small = !!card.closest('.card_item'); // related-slider card → a-64
    const RX = small ? 100 : 200;
    const RY = small ? 100 : 220;
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    const pos = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width * 2 - 1) * RX, y: ((e.clientY - r.top) / r.height * 2 - 1) * RY };
    };
    card.addEventListener('mouseenter', (e) => {
      const p = pos(e as MouseEvent);
      gsap.set(btn, { x: p.x, y: p.y }); // reveal AT the pointer, not the card centre
      gsap.to(btn, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });
      if (img) gsap.to(img, { filter: 'contrast(120%)', duration: 0.5, ease: 'power3.out' });
    });
    card.addEventListener('mousemove', (e) => {
      const p = pos(e as MouseEvent);
      xTo(p.x);
      yTo(p.y);
    });
    card.addEventListener('mouseleave', () => {
      // a-53: fade + shrink in place (do NOT snap back to centre).
      gsap.to(btn, { scale: 0, opacity: 0, duration: 0.5, ease: 'power3.out' });
      if (img) gsap.to(img, { filter: 'contrast(70%)', duration: 0.5, ease: 'power3.out' });
    });
  });
}

/* ============================================================================
   J) Portfolio "Scroll Three Cards" — source a-36 (SCROLL_PROGRESS, scrubbed
   over .relative). The 3 sticky cards stack; as the next one covers the current,
   the current slides down (yPercent +25), recedes in Z (−25vw → shrinks via the
   .relative perspective:1000px) and fades out. Keyframes (scroll progress):
   is-one 30→55%, is-two 55→70%, is-three 70→90%.
   ========================================================================== */
function initPortfolioScroll() {
  if (reduce) return;
  $$('.relative').forEach((rel) => {
    const one = rel.querySelector<HTMLElement>('.latest_card.is-one');
    const two = rel.querySelector<HTMLElement>('.latest_card.is-two');
    const three = rel.querySelector<HTMLElement>('.latest_card.is-three');
    if (!one || !two || !three) return;
    const zBack = () => -window.innerWidth * 0.25; // −25vw in px (perspective lives on .relative)
    const leave = { opacity: 0, yPercent: 25, z: zBack, ease: 'none' } as const;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: rel, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
    tl.fromTo(one, { opacity: 1, yPercent: 0, z: 0 }, { ...leave, duration: 0.25 }, 0.3);
    tl.fromTo(two, { opacity: 1, yPercent: 0, z: 0 }, { ...leave, duration: 0.15 }, 0.55);
    tl.fromTo(three, { opacity: 1, yPercent: 0, z: 0 }, { ...leave, duration: 0.2 }, 0.7);
    tl.to(three, { duration: 0.1 }, 0.9); // pad to full scroll length (keyframes end at 90%)
  });
}

/* ============================================================================
   K) Home hero parallax — source a-35 "Scroll Parallax Home" (SCROLL_PROGRESS,
   scrubbed over the hero). The image drifts DOWN (+40px) while the title,
   description and play-link row drift UP (−60px). Home only (these classes are
   the home hero; the detail-page parallax above uses .home_hero-img).
   ========================================================================== */
function initHeroParallaxHome() {
  if (reduce) return;
  const img = document.querySelector<HTMLElement>('.hero_header-img');
  if (!img) return;
  const hero = img.closest<HTMLElement>('.section_hero') ?? img;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
  tl.fromTo(img, { y: 0 }, { y: 40 }, 0);
  hero
    .querySelectorAll<HTMLElement>('.h1-big, .max-description.is-26rem, .hero_content_bottom')
    .forEach((el) => tl.fromTo(el, { y: 0 }, { y: -60 }, 0));
}

/* ============================================================================
   L) About section "Scroll Smooth" — source a-39 (SCROLL_PROGRESS, scrubbed).
   The whole .section_about rises (yPercent 20 → 0) and fades (opacity .85 → 1)
   over the first 20% of its scroll-through, then holds. Home only.
   ========================================================================== */
function initAboutScrollSmooth() {
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('.section_about').forEach((sec) => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    tl.fromTo(sec, { yPercent: 20, opacity: 0.85 }, { yPercent: 0, opacity: 1, duration: 0.2 }, 0);
    tl.to(sec, { duration: 0.8 }, 0.2); // hold settled for the remaining scroll
  });
}

/* Hero background video: hold on the poster frame when the visitor asked for
   reduced motion, same gate every animation above uses. */
function initHeroVideo() {
  if (!reduce) return;
  $$<HTMLVideoElement>('.hero_header-img video').forEach((v) => {
    v.autoplay = false;
    v.loop = false;
    v.pause();
  });
}

function init() {
  initHeroLoad();
  initPortfolioHover();
  initPortfolioScroll();
  initHeroParallaxHome();
  initAboutScrollSmooth();
  initViewReveal();
  initSectionParallax();
  initScrollMarquee();
  initHighlight();
  initLinkHover();
  initLoopMarquee();
  initHeroParallax();
  initHeroImageReveal();
  initHeroVideo();
}

if (document.fonts?.ready) {
  // Wait for webfonts so SplitText measures final glyph widths (avoids reflow
  // mid-split that would mis-place chars/words).
  document.fonts.ready.then(init);
} else {
  init();
}
