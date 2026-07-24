"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  CornerDownLeft,
  Package,
  Search,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import clsx from "clsx";
import { formatBRL } from "@/lib/format";
import { formatRelative } from "@/lib/admin/datetime";
import { ORDER_STATUS } from "@/lib/admin/labels";
import { useAdmin } from "@/lib/admin/store";
import { matchesQuery, useEscape, useMounted, useScrollLock } from "../ui/hooks";
import { allNavItems } from "./nav";

/**
 * Busca global (⌘K).
 *
 * O operador quase nunca quer "navegar até pedidos": quer o pedido
 * #1187. A paleta procura direto nos registros — número, cliente,
 * SKU, e-mail — e só depois oferece as telas. Por isso ela é a
 * busca principal do painel, e não um campo preso ao topo.
 */

interface Result {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  meta?: string;
  href: string;
  icon: typeof Search;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { orders, products, customers } = useAdmin();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const mounted = useMounted();

  useEscape(open, onClose);
  useScrollLock(open);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      // Espera o portal pintar antes de focar.
      const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const term = query.trim();
    const out: Result[] = [];

    if (term) {
      for (const order of orders) {
        if (out.filter((r) => r.group === "Pedidos").length >= 5) break;
        const customer = customers.find((c) => c.id === order.customerId);
        if (
          !matchesQuery(
            term,
            `#${order.number}`,
            String(order.number),
            customer?.name,
            customer?.email,
            order.shipping.trackingCode,
          )
        )
          continue;
        out.push({
          id: order.id,
          group: "Pedidos",
          title: `#${order.number} · ${customer?.name ?? "Cliente"}`,
          subtitle: `${ORDER_STATUS[order.status].label} · ${formatRelative(order.createdAt)}`,
          meta: formatBRL(order.total),
          href: `/admin/pedidos/${order.number}`,
          icon: ShoppingBag,
        });
      }

      for (const product of products) {
        if (out.filter((r) => r.group === "Produtos").length >= 4) break;
        if (!matchesQuery(term, product.name, product.brand, product.sku))
          continue;
        out.push({
          id: product.id,
          group: "Produtos",
          title: product.name,
          subtitle: `${product.brand} · ${product.sku}`,
          meta: `${product.stock} un.`,
          href: `/admin/produtos/${product.id}`,
          icon: Package,
        });
      }

      for (const customer of customers) {
        if (out.filter((r) => r.group === "Clientes").length >= 4) break;
        if (
          !matchesQuery(term, customer.name, customer.email, customer.phone)
        )
          continue;
        out.push({
          id: customer.id,
          group: "Clientes",
          title: customer.name,
          subtitle: customer.email,
          meta: customer.addresses[0]?.city,
          href: `/admin/clientes/${customer.id}`,
          icon: Users,
        });
      }
    }

    for (const item of allNavItems) {
      if (term && !matchesQuery(term, item.label, item.description)) continue;
      out.push({
        id: item.href,
        group: "Ir para",
        title: item.label,
        subtitle: item.description,
        href: item.href,
        icon: item.icon,
      });
    }

    if (!term || matchesQuery(term, "loja vitrine site")) {
      out.push({
        id: "store",
        group: "Ir para",
        title: "Ver a loja",
        subtitle: "Abrir a vitrine pública",
        href: "/",
        icon: Store,
      });
    }

    return out;
  }, [query, orders, products, customers]);

  useEffect(() => setCursor(0), [query]);

  // Mantém a opção destacada visível ao navegar pelo teclado.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open || !mounted) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const groups = results.reduce<Record<string, Result[]>>((acc, result) => {
    (acc[result.group] ??= []).push(result);
    return acc;
  }, {});

  let index = -1;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[10vh]">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-adm-nav/50 animate-fade-in"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca global"
        className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-adm-lg border border-adm-line bg-adm-surface shadow-adm-pop animate-adm-pop"
      >
        <div className="flex items-center gap-2.5 border-b border-adm-line px-4">
          <Search size={16} className="shrink-0 text-adm-ink-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setCursor((c) => Math.min(c + 1, results.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              } else if (event.key === "Enter" && results[cursor]) {
                event.preventDefault();
                go(results[cursor].href);
              }
            }}
            placeholder="Buscar pedido, produto, cliente…"
            aria-label="Buscar no painel"
            className="h-12 w-full bg-transparent text-[14px] text-adm-ink outline-none placeholder:text-adm-ink-3"
          />
          <kbd className="hidden shrink-0 rounded border border-adm-line bg-adm-raised px-1.5 py-0.5 text-micro text-adm-ink-3 sm:block">
            Esc
          </kbd>
        </div>

        <ul ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {results.length === 0 && (
            <li className="px-3 py-10 text-center text-[13px] text-adm-ink-3">
              Nada encontrado para{" "}
              <span className="text-adm-ink-2">“{query}”</span>.
            </li>
          )}

          {Object.entries(groups).map(([group, items]) => (
            <li key={group}>
              <p className="px-2.5 pb-1 pt-2 text-micro-caps font-medium uppercase text-adm-ink-3">
                {group}
              </p>
              <ul>
                {items.map((result) => {
                  index += 1;
                  const active = index === cursor;
                  const position = index;
                  return (
                    <li key={result.id}>
                      <button
                        type="button"
                        data-active={active}
                        onMouseMove={() => setCursor(position)}
                        onClick={() => go(result.href)}
                        className={clsx(
                          "flex w-full items-center gap-3 rounded-adm px-2.5 py-2 text-left transition-colors",
                          active ? "bg-adm-raised" : "hover:bg-adm-raised/60",
                        )}
                      >
                        <result.icon
                          size={15}
                          className="shrink-0 text-adm-ink-3"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-adm-ink">
                            {result.title}
                          </span>
                          {result.subtitle && (
                            <span className="block truncate text-micro text-adm-ink-3">
                              {result.subtitle}
                            </span>
                          )}
                        </span>
                        {result.meta && (
                          <span className="shrink-0 text-micro tabular-nums text-adm-ink-3">
                            {result.meta}
                          </span>
                        )}
                        {active && (
                          <CornerDownLeft
                            size={13}
                            aria-hidden="true"
                            className="shrink-0 text-adm-ink-3"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 border-t border-adm-line bg-adm-raised px-4 py-2 text-micro text-adm-ink-3">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-adm-line bg-adm-surface px-1">↑</kbd>
            <kbd className="rounded border border-adm-line bg-adm-surface px-1">↓</kbd>
            navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-adm-line bg-adm-surface px-1">
              ⏎
            </kbd>
            abrir
          </span>
          <span className="ml-auto flex items-center gap-1">
            {results.length} resultado{results.length === 1 ? "" : "s"}
            <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
