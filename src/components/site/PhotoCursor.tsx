'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/animation/gsap';

/**
 * The single desktop micro-interaction: a hairline pointer that swells over
 * photographs and links. Fine pointers only, disabled for reduced motion.
 */
export function PhotoCursor() {
  const dot = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el) return;
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;

    const x = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
    let visible = false;

    const move = (event: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to(el, { opacity: 1, duration: 0.3 });
      }
      x(event.clientX);
      y(event.clientY);
      const over = (event.target as HTMLElement)?.closest('a, button, [data-cursor]');
      gsap.to(el, { scale: over ? 2.6 : 1, duration: 0.4, ease: 'power3.out' });
    };
    const leave = () => {
      visible = false;
      gsap.to(el, { opacity: 0, duration: 0.3 });
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', leave);
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/70 opacity-0 mix-blend-difference lg:block"
    />
  );
}
