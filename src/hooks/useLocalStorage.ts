"use client";

import { useEffect, useState } from "react";

/**
 * Persistência simples em localStorage com hidratação segura para SSR.
 * Retorna o valor apenas após montar no cliente para evitar mismatch.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignora leitura inválida */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage cheio/indisponível */
    }
  }, [key, value, hydrated]);

  return { value, setValue, hydrated } as const;
}
