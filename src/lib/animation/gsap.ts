'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Single registration point for GSAP plugins. Import gsap from here, never directly. */
let registered = false;
if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power2.out', duration: 0.9 });
  registered = true;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger };
