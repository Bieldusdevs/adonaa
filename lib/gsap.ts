'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: 'power3.out', duration: 1.1 });
}

export { gsap, ScrollTrigger, useGSAP };

/** Revela linhas de texto com a cadência de uma cortina de seda a abrir. */
export function useRevelacaoTexto<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const linhas = el.querySelectorAll('.reveal-linha > span');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        linhas,
        { yPercent: 118, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.25,
          stagger: 0.09,
          delay,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay]);

  return ref;
}

/** Parallax discreto para as fotografias de produto. */
export function useParallax<T extends HTMLElement>(intensidade = 12) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -intensidade,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.1 },
      });
    }, el);

    return () => ctx.revert();
  }, [intensidade]);

  return ref;
}
