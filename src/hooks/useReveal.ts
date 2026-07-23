"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Micro-animação de entrada ao rolar a página (scroll reveal).
 * Usa IntersectionObserver — sem dependências externas.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px", ...options },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, options]);

  return { ref, visible } as const;
}
