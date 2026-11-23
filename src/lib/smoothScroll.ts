import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Buttery wheel/trackpad scrolling for the whole page (touch stays native). Off for reduced motion.
let lenis: Lenis | null = null;

const NAV_OFFSET = -84;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  lenis = new Lenis({ autoRaf: true, lerp: 0.085, anchors: { offset: NAV_OFFSET, duration: 1.6, easing: easeInOut } });
}

/** Fly to a section like a camera move. Falls back to native smooth scrolling when Lenis is off. */
export function travelTo(
  target: string | HTMLElement,
  { duration = 1.8, offset = NAV_OFFSET, onComplete }: { duration?: number; offset?: number; onComplete?: () => void } = {}
) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return onComplete?.();
  if (lenis) {
    lenis.scrollTo(el, { offset, duration, easing: easeInOut, onComplete: () => onComplete?.() });
    return;
  }
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });
  if (onComplete) setTimeout(onComplete, 900);
}

/** Current scroll speed in px per frame (0 when Lenis is off or idle). */
export const scrollVelocity = () => lenis?.velocity ?? 0;
