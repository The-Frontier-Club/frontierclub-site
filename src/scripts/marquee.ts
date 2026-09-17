// =============================================================================
// marquee.ts - optional enhancer for the CSS-only marquee (marquee.css)
//
// PROBLEM IT SOLVES
// The pure-CSS marquee hardcodes a `--marquee-duration` in seconds. That makes
// the velocity inconsistent: the same 30s reads fast with 4 cards and crawls
// with 12 (Coverly 2026: 60s/8 cards was visibly mis-calibrated). It also
// assumes the author manually duplicated the set 2× - which only guarantees a
// seamless loop if 1 set is already WIDER than the viewport.
//
// This optional script fixes both, with NO change to the markup contract:
//   1. AUTO-FILL - clones the FIRST set until the track is at least
//      (viewport width × 2), so a single set is never narrower than the clip.
//      Then translateX(-50%) is always seamless regardless of item count.
//   2. CONSTANT px/s SPEED - measures one set's width and sets
//      --marquee-duration = setWidth / pxPerSecond. Same perceived velocity for
//      any number of items / any container width.
//   3. REDUCED MOTION - if the user prefers reduced motion, it does NOT clone
//      and does NOT set a duration (CSS already pins `animation: none`). It also
//      bails on a `change` so toggling the OS setting takes effect live.
//
// MARKUP CONTRACT
//   <div class="marquee" data-marquee data-marquee-speed="40">
//     <div class="marquee_track">
//       <div class="marquee_set">…items…</div>      ← ONE authored set is enough
//       <!-- set 2 is OPTIONAL: the script clones to fill. If you ship a static
//            duplicate for no-JS seamlessness, mark it aria-hidden and the
//            script will normalise the count. -->
//     </div>
//   </div>
//
//   • data-marquee        - opt-in marker (required). Script targets only these.
//   • data-marquee-speed  - pixels per second (default 40). The ONE knob a
//                           director tunes; width/item-count no longer matter.
//
// CSS PAIRING
// marquee.css owns: clip/overflow, will-change, pause-on-hover, reverse,
// prefers-reduced-motion, and the seamless margin-right gap math. This script
// only clones sets and writes --marquee-duration. Keep both in sync via the
// `.marquee` / `.marquee_track` / `.marquee_set` class names.
// =============================================================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

interface MarqueeEl extends HTMLElement {
  _marqueeWired?: boolean;
}

function setWidthOf(track: HTMLElement): number {
  const set = track.querySelector<HTMLElement>('.marquee_set');
  // getBoundingClientRect includes the trailing margin-right of the last item
  // only via offsetWidth differences, so measure the set element directly.
  return set ? set.getBoundingClientRect().width : 0;
}

// Clone the FIRST .marquee_set (aria-hidden) until the track is wide enough that
// `width: max-content` exceeds 2× the viewport - guarantees -50% is seamless and
// the clip is always covered. Returns the width of ONE set (the loop period).
function fill(el: MarqueeEl, track: HTMLElement): number {
  const original = track.querySelector<HTMLElement>('.marquee_set');
  if (!original) return 0;

  // Reset to a single authored set so re-runs (resize) are idempotent.
  track
    .querySelectorAll<HTMLElement>('.marquee_set[data-marquee-clone]')
    .forEach((c) => c.remove());
  // If the author shipped a static duplicate (no clone flag), keep just the first.
  const extras = [...track.querySelectorAll<HTMLElement>('.marquee_set')].slice(1);
  extras.forEach((c) => c.remove());

  const oneSet = setWidthOf(track);
  if (oneSet === 0) return 0;

  const need = Math.max(window.innerWidth * 2, oneSet * 2);
  // We need the FINAL track to be exactly 2 copies of a "filled set" so -50% is a
  // clean repeat. Build one filled set (original + enough clones to cover the
  // viewport), then duplicate that whole filled set once.
  const copiesPerSet = Math.max(1, Math.ceil(need / 2 / oneSet));

  // Append (copiesPerSet - 1) clones to complete set "A", then one more full
  // batch of copiesPerSet clones for set "B". Total = 2 × copiesPerSet sets.
  const totalClones = copiesPerSet * 2 - 1;
  for (let i = 0; i < totalClones; i++) {
    const clone = original.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('data-marquee-clone', '');
    track.appendChild(clone);
  }

  // The loop period is one HALF of the track = copiesPerSet sets wide.
  return oneSet * copiesPerSet;
}

function apply(el: MarqueeEl) {
  const track = el.querySelector<HTMLElement>('.marquee_track');
  if (!track) return;

  if (reduceMotion.matches) {
    // CSS already pins animation:none. Strip any clones/duration so the static
    // content is honest and not doubled.
    track
      .querySelectorAll<HTMLElement>('.marquee_set[data-marquee-clone]')
      .forEach((c) => c.remove());
    track.style.removeProperty('--marquee-duration');
    return;
  }

  const halfWidth = fill(el, track);
  if (halfWidth === 0) return;

  const pxPerSecond = parseFloat(el.dataset.marqueeSpeed ?? '40');
  const duration = halfWidth / pxPerSecond; // seconds for one period to pass
  track.style.setProperty('--marquee-duration', `${duration}s`);
}

function init() {
  const els = [...document.querySelectorAll<MarqueeEl>('[data-marquee]')];
  els.forEach((el) => {
    el._marqueeWired = true;
    apply(el);
  });

  // Re-measure on resize (debounced) so px/s stays constant across breakpoints.
  let t: number | undefined;
  window.addEventListener('resize', () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => els.forEach(apply), 150);
  });

  // React live to OS reduced-motion toggles.
  reduceMotion.addEventListener('change', () => els.forEach(apply));
}

// Run after fonts/layout settle so set widths are accurate.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// =============================================================================
// ALTERNATIVE - GSAP horizontalLoop helper
//
// Use this variant ONLY when the CSS marquee is not enough:
//   • items have DYNAMIC widths (CMS logos of different sizes) and you want a
//     mathematically perfect seamless loop without the margin-right trick;
//   • you want pointer/touch DRAG to scrub the marquee (Draggable + Inertia);
//   • you need to programmatically jump to / center a specific item.
//
// It's the canonical GSAP "horizontalLoop" helper (GreenSock forums). Requires
// `gsap` and (for drag) the Draggable + InertiaPlugin. It builds a single
// seamless timeline by laying items end-to-end and wrapping their xPercent.
// Pair with marquee.css for clip + reduced-motion, but DROP the CSS @keyframes
// animation on .marquee_track (GSAP drives the transform instead).
//
// import gsap from 'gsap';
// // import { Draggable } from 'gsap/Draggable';
// // import { InertiaPlugin } from 'gsap/InertiaPlugin';
// // gsap.registerPlugin(Draggable, InertiaPlugin);
//
// function horizontalLoop(items: HTMLElement[], config: any = {}) {
//   items = gsap.utils.toArray(items);
//   const tl = gsap.timeline({
//     repeat: config.repeat ?? -1,
//     paused: config.paused,
//     defaults: { ease: 'none' },
//     onReverseComplete() { this.totalTime(this.rawTime() + this.duration() * 100); },
//   });
//   const length = items.length;
//   const startX = items[0].offsetLeft;
//   const widths: number[] = [];
//   const xPercents: number[] = [];
//   let curIndex = 0;
//   const pixelsPerSecond = (config.speed || 1) * 100;
//   const snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1);
//   let totalWidth: number;
//
//   gsap.set(items, {
//     xPercent: (i, el) => {
//       const w = (widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px') as string));
//       xPercents[i] = snap(
//         (parseFloat(gsap.getProperty(el, 'x', 'px') as string) / w) * 100 +
//           (gsap.getProperty(el, 'xPercent') as number)
//       );
//       return xPercents[i];
//     },
//   });
//   gsap.set(items, { x: 0 });
//   totalWidth =
//     items[length - 1].offsetLeft +
//     (xPercents[length - 1] / 100) * widths[length - 1] -
//     startX +
//     items[length - 1].offsetWidth * (gsap.getProperty(items[length - 1], 'scaleX') as number) +
//     (parseFloat(config.paddingRight) || 0);
//
//   for (let i = 0; i < length; i++) {
//     const item = items[i];
//     const curX = (xPercents[i] / 100) * widths[i];
//     const distanceToStart = item.offsetLeft + curX - startX;
//     const distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, 'scaleX') as number);
//     tl.to(item, { xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100), duration: distanceToLoop / pixelsPerSecond }, 0)
//       .fromTo(
//         item,
//         { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
//         { xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false },
//         distanceToLoop / pixelsPerSecond
//       );
//   }
//   return tl; // pause on hover: el.addEventListener('mouseenter', () => tl.pause()); 'mouseleave' → tl.play();
// }
// =============================================================================
