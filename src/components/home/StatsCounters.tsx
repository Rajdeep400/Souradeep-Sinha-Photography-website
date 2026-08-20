'use client';

import { useGsapScope } from '@/lib/animation/useGsapScope';
import type { Stat } from '@/lib/content';

/**
 * Achievements counters. Every label, number, prefix and suffix comes from
 * SQLite via /studio — nothing here is hardcoded. Numbers render as their final
 * value in the HTML (correct without JS and for reduced motion), then count up
 * from zero once when the section first enters the viewport.
 */
export function StatsCounters({ items }: { items: Stat[] }) {
  const shown = items.filter((item) => item.visible && item.value > 0);

  const scope = useGsapScope<HTMLElement>(({ gsap, scope }) => {
    gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((node, index) => {
      const target = Number(node.dataset.value || 0);
      const proxy = { n: 0 };
      gsap.to(proxy, {
        n: target,
        duration: 1.8,
        delay: index * 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: scope, start: 'top 78%', once: true },
        onStart: () => {
          // zero out only as the count-up begins, so the real value stays
          // visible until then (and for anyone without JS)
          node.textContent = '0';
        },
        onUpdate: () => {
          node.textContent = String(Math.round(proxy.n));
        },
        onComplete: () => {
          node.textContent = String(target);
        },
      });
    });
  }, [shown.map((s) => `${s.id}:${s.value}`).join(',')]);

  if (shown.length === 0) return null;

  return (
    <section ref={scope} className="bg-ivory">
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.45em] text-ink/45">By the numbers</p>
        <div className="mt-10 grid gap-x-12 gap-y-12 border-t border-ink/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((stat) => (
            <div key={stat.id}>
              <p className="font-display text-4xl leading-none sm:text-5xl">
                {stat.prefix}
                <span data-counter data-value={stat.value}>
                  {stat.value}
                </span>
                {stat.suffix}
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-ink/70">
                {stat.label}
              </p>
              <span className="mt-4 block h-px w-10 bg-gold" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
