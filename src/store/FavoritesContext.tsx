"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types";
import { getById } from "@/lib/products";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface FavoritesValue {
  ids: string[];
  items: Product[];
  count: number;
  hydrated: boolean;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { value: ids, setValue: setIds, hydrated } = useLocalStorage<string[]>(
    "ja-favorites",
    [],
  );

  const items = useMemo(
    () =>
      ids
        .map((id) => getById(id))
        .filter((p): p is Product => p !== undefined),
    [ids],
  );

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) =>
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    [setIds],
  );

  const remove = useCallback(
    (id: string) => setIds((prev) => prev.filter((x) => x !== id)),
    [setIds],
  );

  const value: FavoritesValue = {
    ids,
    items,
    count: ids.length,
    hydrated,
    isFavorite,
    toggle,
    remove,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error(
      "useFavorites deve ser usado dentro de <FavoritesProvider>",
    );
  return ctx;
}
