'use client';

import { useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/animation/gsap';

type Faq = { id: number; question: string; answer: string };

/** Calm, minimal accordion — the page settles down here by design. */
export function FaqAccordion({ heading, items }: { heading: string; items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(items[0]?.id ?? null);
  const panels = useRef<Record<number, HTMLElement | null>>({});

  function toggle(id: number) {
    const next = open === id ? null : id;
    const previous = open;
    setOpen(next);
    if (prefersReducedMotion()) return;

    if (previous != null && panels.current[previous]) {
      gsap.to(panels.current[previous], { height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut' });
    }
    if (next != null && panels.current[next]) {
      gsap.to(panels.current[next], {
        height: 'auto',
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }

  if (items.length === 0) return null;

  return (
    <section className="bg-ivory">
      <div className="mx-auto w-full max-w-4xl px-5 py-24 sm:px-8">
        <h2 className="font-display text-3xl sm:text-5xl">{heading}</h2>
        <dl className="mt-12 border-t border-ink/10">
          {items.map((item) => {
            const isOpen = open === item.id;
            return (
              <div key={item.id} className="border-b border-ink/10">
                <dt>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-lg sm:text-2xl">{item.question}</span>
                    <span
                      className={`shrink-0 text-gold transition-transform duration-500 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                </dt>
                <dd
                  ref={(el) => {
                    panels.current[item.id] = el;
                  }}
                  style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-ink/70">{item.answer}</p>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
