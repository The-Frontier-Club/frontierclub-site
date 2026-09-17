import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';
import 'swiper/css';

// =============================================================================
// grid-slider.ts — responsive grid → slider mechanism (generic, reusable)
//
// PROBLEM IT SOLVES
// In many Webflow source templates a card grid has NO real slider: on
// tablet/mobile it just collapses to `display:flex; overflow:auto`, becoming a
// mouse-drag/scroll strip with no arrows (a Webflow time-saving hack). This
// converts those grids into PROPER Swiper sliders WITH arrows below a
// breakpoint, while leaving the desktop CSS grid completely untouched
// (≥breakpoint → plain grid, NO Swiper driving it).
//
// MARKUP CONTRACT (per target grid — see grid-slider.css for the CSS side):
//   <div class="<grid-class> swiper" data-grid-slider data-gap="16"
//        [data-slider-mq="767"]>
//     <div class="swiper-wrapper" role="list">          ← role="list" goes HERE
//       <div class="<item-class> swiper-slide" role="listitem"> …card… </div>
//       …
//     </div>
//     <div class="arrow-group">
//       <div class="swiper-button-prev" data-prev> …SVG… </div>
//       <div class="swiper-button-next" data-next> …SVG… </div>
//     </div>
//   </div>
//
//   • data-grid-slider — opt-in marker (required). The script targets only these.
//   • data-gap         — spaceBetween in px during the swipe transition
//                        (defaults to 16). The DESKTOP grid gap is set in CSS,
//                        NOT here — this only affects the slider state.
//   • data-spv         — slidesPerView. Read but defaults to 1 (one full card,
//                        no peek, since arrows already signal it's a slider).
//                        Set to a number/`"auto"` if a peek is desired.
//   • data-slider-mq   — per-target max-width breakpoint in px (default 991).
//                        The CSS gate keys off the SAME value via attribute
//                        selectors, so both must agree.
//
// MECHANISM
// One matchMedia per distinct breakpoint. Below the breakpoint → init Swiper on
// every opted-in target; at/above → destroy it so the desktop grid CSS regains
// control. No autoplay — manual/drag only (respects prefers-reduced-motion
// implicitly: nothing animates on its own).
// =============================================================================

const instances = new WeakMap<HTMLElement, Swiper>();

function maxFor(el: HTMLElement): number {
  return parseInt(el.dataset.sliderMq ?? '991', 10);
}

function initOne(el: HTMLElement) {
  if (instances.has(el)) return;

  // Default: exactly ONE full card at 100% of the slider's content width at all
  // active breakpoints — NO peek of the next card, since the arrows already
  // signal it's a slider. Override per-target with `data-spv` (number or "auto")
  // if a peek is wanted. `data-gap` (spaceBetween, px) only shows during the
  // swipe transition because only one card is visible at rest with spv=1.
  const spvRaw = el.dataset.spv;
  const spv: number | 'auto' =
    spvRaw === 'auto' ? 'auto' : spvRaw ? parseFloat(spvRaw) : 1;
  const gap = parseFloat(el.dataset.gap ?? '16');

  const opts: SwiperOptions = {
    modules: [Navigation],
    slidesPerView: spv,
    spaceBetween: gap,
    grabCursor: true,
    speed: 500,
    navigation: {
      nextEl: el.querySelector<HTMLElement>('[data-next]'),
      prevEl: el.querySelector<HTMLElement>('[data-prev]'),
    },
  };

  instances.set(el, new Swiper(el, opts));
}

function destroyOne(el: HTMLElement) {
  const sw = instances.get(el);
  if (sw) {
    sw.destroy(true, true); // also reset inline styles so the grid CSS takes over
    instances.delete(el);
  }
}

// One matchMedia per distinct breakpoint, evaluating only the targets that opt
// into that breakpoint. Below the breakpoint → init Swiper; at/above → destroy
// so the desktop grid CSS regains control.
function wire(targets: HTMLElement[], max: number) {
  const mql = window.matchMedia(`(max-width: ${max}px)`);
  const apply = (matches: boolean) =>
    targets.forEach((el) => (matches ? initOne(el) : destroyOne(el)));
  apply(mql.matches);
  mql.addEventListener('change', (e) => apply(e.matches));
}

const all = [...document.querySelectorAll<HTMLElement>('[data-grid-slider]')];
const byBreakpoint = new Map<number, HTMLElement[]>();
all.forEach((el) => {
  const max = maxFor(el);
  (byBreakpoint.get(max) ?? byBreakpoint.set(max, []).get(max)!).push(el);
});
byBreakpoint.forEach((targets, max) => wire(targets, max));
