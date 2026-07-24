"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import clsx from "clsx";
import { Count } from "./Badge";
import { useClickOutside, useEscape } from "./hooks";

/* ————————————————————————— Abas ————————————————————————— */

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
  icon?: ComponentType<{ size?: number | string; className?: string }>;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  /** "underline" para navegação de seção; "pill" para filtros. */
  variant = "underline",
  ariaLabel,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  variant?: "underline" | "pill";
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(
        // min-w-0: como as abas rolam na horizontal, o container
        // precisa poder encolher abaixo do próprio min-content —
        // senão ele alarga a grade que o contém no celular.
        "no-scrollbar flex min-w-0 overflow-x-auto",
        variant === "underline" ? "gap-1 border-b border-adm-line" : "gap-1.5",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={clsx(
              "inline-flex shrink-0 items-center whitespace-nowrap text-[13px] font-medium transition-colors",
              variant === "underline"
                ? clsx(
                    "-mb-px border-b-2 px-3 py-2.5",
                    active
                      ? "border-adm-nav text-adm-ink"
                      : "border-transparent text-adm-ink-3 hover:border-adm-line-strong hover:text-adm-ink-2",
                  )
                : clsx(
                    "rounded-full px-3 py-1.5",
                    active
                      ? "bg-adm-nav text-white"
                      : "text-adm-ink-2 hover:bg-adm-sunken",
                  ),
            )}
          >
            {item.icon && <item.icon size={14} className="mr-1.5" />}
            {item.label}
            {item.count != null && <Count value={item.count} active={active && variant === "pill"} />}
          </button>
        );
      })}
    </div>
  );
}

/* ————————————————————————— Trilha ————————————————————————— */

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Trilha de navegação">
      <ol className="flex flex-wrap items-center gap-1 text-micro text-adm-ink-3">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded-[3px] transition-colors hover:text-adm-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={clsx(last && "text-adm-ink-2")} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!last && (
                <ChevronRight size={12} aria-hidden="true" className="text-adm-ink-3/70" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ————————————————————————— Paginação ————————————————————————— */

export function Pagination({
  page,
  pageCount,
  from,
  to,
  total,
  onChange,
  unit = "registros",
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  onChange: (page: number) => void;
  unit?: string;
}) {
  if (total === 0) return null;

  // Janela curta em torno da página atual, com reticências nas pontas.
  const pages: (number | "gap")[] = [];
  const push = (value: number | "gap") => pages.push(value);
  const window = 1;

  for (let index = 1; index <= pageCount; index++) {
    if (
      index === 1 ||
      index === pageCount ||
      (index >= page - window && index <= page + window)
    ) {
      push(index);
    } else if (pages[pages.length - 1] !== "gap") {
      push("gap");
    }
  }

  const navButton =
    "grid h-8 w-8 place-items-center rounded-adm border border-adm-line bg-adm-surface text-adm-ink-2 transition-colors hover:bg-adm-raised disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <p className="text-micro text-adm-ink-3">
        <span className="tabular-nums text-adm-ink-2">
          {from}–{to}
        </span>{" "}
        de <span className="tabular-nums text-adm-ink-2">{total}</span> {unit}
      </p>

      {pageCount > 1 && (
        <nav aria-label="Paginação" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
            className={navButton}
          >
            <ChevronLeft size={15} />
          </button>

          {pages.map((item, index) =>
            item === "gap" ? (
              <span
                key={`gap-${index}`}
                aria-hidden="true"
                className="grid h-8 w-6 place-items-center text-adm-ink-3"
              >
                <MoreHorizontal size={13} />
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onChange(item)}
                aria-current={item === page ? "page" : undefined}
                className={clsx(
                  "h-8 min-w-8 rounded-adm px-2 text-[12.5px] font-medium tabular-nums transition-colors",
                  item === page
                    ? "bg-adm-nav text-white"
                    : "border border-adm-line bg-adm-surface text-adm-ink-2 hover:bg-adm-raised",
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Próxima página"
            className={navButton}
          >
            <ChevronRight size={15} />
          </button>
        </nav>
      )}
    </div>
  );
}

/* ————————————————————————— Menu ————————————————————————— */

export interface DropdownItem {
  label: string;
  onSelect?: () => void;
  href?: string;
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Inicia um novo grupo com separador acima. */
  separated?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  label,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, open, () => setOpen(false));
  useEscape(open, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((value) => !value) })}

      {open && (
        <div
          role="menu"
          aria-label={label}
          className={clsx(
            "absolute z-50 mt-1 min-w-[11rem] overflow-hidden rounded-adm-lg border border-adm-line bg-adm-surface p-1 shadow-adm-pop animate-adm-menu",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, index) => {
            const className = clsx(
              "flex w-full items-center gap-2 rounded-adm px-2.5 py-1.5 text-left text-[13px] transition-colors",
              item.disabled
                ? "cursor-not-allowed text-adm-ink-3"
                : item.tone === "danger"
                  ? "text-adm-bad hover:bg-adm-bad-bg"
                  : "text-adm-ink-2 hover:bg-adm-raised hover:text-adm-ink",
            );

            const content = (
              <>
                {item.icon && <item.icon size={14} />}
                {item.label}
              </>
            );

            return (
              <div key={item.label}>
                {item.separated && index > 0 && (
                  <div className="my-1 h-px bg-adm-line" role="separator" />
                )}
                {item.href && !item.disabled ? (
                  <Link
                    href={item.href}
                    role="menuitem"
                    className={className}
                    onClick={() => setOpen(false)}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    className={className}
                    onClick={() => {
                      item.onSelect?.();
                      setOpen(false);
                    }}
                  >
                    {content}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
