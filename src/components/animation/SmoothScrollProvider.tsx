'use client';

import Lenis from 'lenis';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ScrollTrigger, gsap, prefersReducedMotion } from '@/lib/animation/gsap';

type SmoothScrollValue = { lenis: Lenis | null };

const SmoothScrollContext = createContext<SmoothScrollValue>({ lenis: null });

export const useLenis = () => useContext(SmoothScrollContext).lenis;

/**
 * Owns the single Lenis instance and keeps ScrollTrigger in sync with it.
 * Stage 2 animations should read the instance via useLenis() rather than
 * creating their own scroll listeners.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const raf = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    const onScroll = () => ScrollTrigger.update();
    instance.on('scroll', onScroll);

    raf.current = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf.current);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (typeof value === 'number') instance.scrollTo(value, { immediate: true });
        return instance.scroll;
      },
    });

    setLenis(instance);
    ScrollTrigger.refresh();

    return () => {
      if (raf.current) gsap.ticker.remove(raf.current);
      instance.off('scroll', onScroll);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis }}>{children}</SmoothScrollContext.Provider>
  );
}
