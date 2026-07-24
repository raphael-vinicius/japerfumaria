"use client";

/** Utilitários de comportamento compartilhados pelo Design System do painel. */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

/** Fecha ao pressionar Esc. */
export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onEscape();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [active, onEscape]);
}

/** Fecha ao clicar fora do elemento. */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  active: boolean,
  onOutside: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        onOutside();
    };
    // `mousedown` evita fechar antes do clique registrar no alvo.
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, active, onOutside]);
}

/** Trava a rolagem do documento enquanto uma camada modal está aberta. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body } = document;
    const previous = body.getAttribute("data-adm-locked");
    body.setAttribute("data-adm-locked", "true");
    return () => {
      if (previous) body.setAttribute("data-adm-locked", previous);
      else body.removeAttribute("data-adm-locked");
    };
  }, [active]);
}

/**
 * Mantém o foco dentro do container e o devolve ao fechar —
 * requisito de acessibilidade para diálogos e gavetas.
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T>,
  active: boolean,
) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const first = focusables()[0];
    (first ?? container).focus({ preventScroll: true });

    const handler = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const start = list[0];
      const end = list[list.length - 1];
      if (event.shiftKey && document.activeElement === start) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && document.activeElement === end) {
        event.preventDefault();
        start.focus();
      }
    };

    container.addEventListener("keydown", handler);
    return () => {
      container.removeEventListener("keydown", handler);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [ref, active]);
}

/** Sinaliza que o componente já montou no cliente (portais, datas). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Atalhos de teclado globais. Ignora digitação em campos de texto,
 * exceto quando o atalho usa modificador.
 */
export function useHotkey(
  combo: string,
  handler: (event: KeyboardEvent) => void,
  enabled = true,
) {
  const saved = useRef(handler);
  saved.current = handler;

  useEffect(() => {
    if (!enabled) return;
    const parts = combo.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const needsMeta = parts.includes("mod");
    const needsShift = parts.includes("shift");

    const listener = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      const mod = event.metaKey || event.ctrlKey;

      if (needsMeta !== mod) return;
      if (needsShift !== event.shiftKey) return;
      if (typing && !needsMeta) return;
      if (event.key.toLowerCase() !== key) return;

      event.preventDefault();
      saved.current(event);
    };

    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [combo, enabled]);
}

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

/** Ordenação de tabela: mesmo clique inverte a direção. */
export function useSort<K extends string>(initial: SortState<K>) {
  const [sort, setSort] = useState<SortState<K>>(initial);
  const toggle = useCallback((key: K) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  }, []);
  return { sort, toggle, setSort };
}

/** Paginação client-side: fatia a lista e normaliza a página atual. */
export function usePagination<T>(items: T[], perPage = 12) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(page, pageCount);

  const slice = useMemo(
    () => items.slice((current - 1) * perPage, current * perPage),
    [items, current, perPage],
  );

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  return {
    page: current,
    pageCount,
    setPage,
    items: slice,
    from: items.length ? (current - 1) * perPage + 1 : 0,
    to: Math.min(current * perPage, items.length),
    total: items.length,
  };
}

/** Normaliza texto para busca: sem acento, sem caixa. */
export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .toLowerCase()
    .replace(/[^a-z0-9\s@.#-]/g, "");

/** `true` quando todos os termos da busca aparecem no conteúdo. */
export const matchesQuery = (query: string, ...fields: (string | undefined)[]) => {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalize(fields.filter(Boolean).join(" "));
  return terms.every((term) => haystack.includes(term));
};
