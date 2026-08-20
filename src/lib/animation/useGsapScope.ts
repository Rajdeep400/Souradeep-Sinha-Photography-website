'use client';

import { useEffect, useRef } from 'react';
import type { DependencyList, RefObject } from 'react';
import { ScrollTrigger, gsap, prefersReducedMotion } from './gsap';

type Setup = (context: {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  scope: HTMLElement;
  self: gsap.Context;
}) => void;

/**
 * Scoped GSAP context with guaranteed cleanup.
 * Every Stage 2 animation should be created inside one of these — all tweens
 * and ScrollTriggers created in `setup` are reverted on unmount.
 */
export function useGsapScope<T extends HTMLElement = HTMLDivElement>(
  setup: Setup,
  deps: DependencyList = [],
): RefObject<T | null> {
  const scopeRef = useRef<T | null>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReducedMotion()) return;

    const ctx = gsap.context((self) => {
      setup({ gsap, ScrollTrigger, scope, self });
    }, scope);

    ScrollTrigger.refresh();

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
