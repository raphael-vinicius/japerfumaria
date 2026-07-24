"use client";

import {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { CalendarDays, Check, Search, SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import {
  NOW,
  addDays,
  dayKey,
  endOfDay,
  formatDate,
  startOfDay,
  startOfMonth,
} from "@/lib/admin/datetime";
import { Button } from "./Button";
import { useClickOutside, useEscape } from "./hooks";

/* ————————————————————————— Busca ————————————————————————— */

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** Texto do atalho exibido à direita (ex.: "/"). */
  shortcut?: string;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  shortcut,
  containerClassName,
  className,
  // Placeholder não é nome acessível: sem rótulo explícito, o
  // leitor de tela anuncia só "campo de edição".
  "aria-label": ariaLabel,
  ...rest
}: SearchInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  // "/" foca a busca da tela — atalho universal de painel.
  useEffect(() => {
    if (!shortcut) return;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (event.key === shortcut && !typing) {
        event.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [shortcut]);

  return (
    <div className={clsx("relative flex-1", containerClassName)}>
      <Search
        size={15}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-adm-ink-3"
      />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={clsx(
          "h-9 w-full rounded-adm border border-adm-line bg-adm-surface pl-9 pr-16 text-[13px] text-adm-ink",
          "placeholder:text-adm-ink-3 transition-colors hover:border-adm-line-strong focus:border-adm-accent",
          "[&::-webkit-search-cancel-button]:appearance-none",
          className,
        )}
        {...rest}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-adm text-adm-ink-3 transition-colors hover:bg-adm-sunken hover:text-adm-ink"
        >
          <X size={13} />
        </button>
      ) : (
        shortcut && (
          <kbd
            aria-hidden="true"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-adm-line bg-adm-raised px-1.5 py-0.5 text-micro text-adm-ink-3"
          >
            {shortcut}
          </kbd>
        )
      )}
    </div>
  );
}

/* ————————————————————————— Barra de filtros ————————————————————————— */

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-2 border-b border-adm-line px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Resumo dos filtros ativos, com remoção individual. */
export function ActiveFilters({
  filters,
  onClearAll,
}: {
  filters: { label: string; value: string; onRemove: () => void }[];
  onClearAll?: () => void;
}) {
  if (!filters.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-adm-line bg-adm-raised px-4 py-2">
      <span className="text-micro text-adm-ink-3">Filtros:</span>
      {filters.map((filter) => (
        <span
          key={`${filter.label}-${filter.value}`}
          className="inline-flex items-center gap-1 rounded-full border border-adm-line bg-adm-surface py-0.5 pl-2 pr-1 text-micro text-adm-ink-2"
        >
          <span className="text-adm-ink-3">{filter.label}:</span>
          {filter.value}
          <button
            type="button"
            onClick={filter.onRemove}
            aria-label={`Remover filtro ${filter.label}`}
            className="grid h-4 w-4 place-items-center rounded-full text-adm-ink-3 transition-colors hover:bg-adm-sunken hover:text-adm-ink"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-1 rounded-[3px] text-micro font-medium text-adm-accent hover:underline"
        >
          Limpar tudo
        </button>
      )}
    </div>
  );
}

/* ————————————————————————— Período ————————————————————————— */

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
  preset: string;
}

type PresetId =
  | "tudo"
  | "hoje"
  | "ontem"
  | "7d"
  | "30d"
  | "mes"
  | "mes_passado"
  | "90d"
  | "custom";

export function buildRange(preset: PresetId): DateRange {
  const today = startOfDay(NOW);

  switch (preset) {
    case "tudo":
      return {
        from: new Date("2000-01-01T00:00:00-03:00"),
        to: endOfDay(NOW),
        label: "Todo o período",
        preset,
      };
    case "hoje":
      return { from: today, to: endOfDay(NOW), label: "Hoje", preset };
    case "ontem": {
      const yesterday = addDays(NOW, -1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
        label: "Ontem",
        preset,
      };
    }
    case "7d":
      return {
        from: startOfDay(addDays(NOW, -6)),
        to: endOfDay(NOW),
        label: "Últimos 7 dias",
        preset,
      };
    case "mes":
      return {
        from: startOfMonth(NOW),
        to: endOfDay(NOW),
        label: "Este mês",
        preset,
      };
    case "mes_passado": {
      const lastMonthEnd = addDays(startOfMonth(NOW), -1);
      return {
        from: startOfMonth(lastMonthEnd),
        to: endOfDay(lastMonthEnd),
        label: "Mês passado",
        preset,
      };
    }
    case "90d":
      return {
        from: startOfDay(addDays(NOW, -89)),
        to: endOfDay(NOW),
        label: "Últimos 90 dias",
        preset,
      };
    case "30d":
    default:
      return {
        from: startOfDay(addDays(NOW, -29)),
        to: endOfDay(NOW),
        label: "Últimos 30 dias",
        preset: "30d",
      };
  }
}

const PRESETS: { id: PresetId; label: string }[] = [
  { id: "tudo", label: "Todo o período" },
  { id: "hoje", label: "Hoje" },
  { id: "ontem", label: "Ontem" },
  { id: "7d", label: "Últimos 7 dias" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "mes", label: "Este mês" },
  { id: "mes_passado", label: "Mês passado" },
  { id: "90d", label: "Últimos 90 dias" },
];

/**
 * Seletor de período: atalhos para o que se consulta todo dia e
 * intervalo manual para o resto. Sem calendário decorativo — os
 * campos nativos já resolvem, inclusive no celular.
 */
export function DateRangePicker({
  value,
  onChange,
  align = "right",
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(dayKey(value.from));
  const [customTo, setCustomTo] = useState(dayKey(value.to));
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, open, () => setOpen(false));
  useEscape(open, () => setOpen(false));

  const applyCustom = () => {
    const from = startOfDay(new Date(`${customFrom}T12:00:00-03:00`));
    const to = endOfDay(new Date(`${customTo}T12:00:00-03:00`));
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;
    if (from > to) return;
    onChange({
      from,
      to,
      label: `${formatDate(from)} – ${formatDate(to)}`,
      preset: "custom",
    });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <Button
        icon={CalendarDays}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {value.label}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Selecionar período"
          className={clsx(
            "absolute z-50 mt-1 w-64 rounded-adm-lg border border-adm-line bg-adm-surface p-1 shadow-adm-pop animate-adm-menu",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onChange(buildRange(preset.id));
                setOpen(false);
              }}
              className={clsx(
                "flex w-full items-center justify-between rounded-adm px-2.5 py-1.5 text-left text-[13px] transition-colors",
                value.preset === preset.id
                  ? "bg-adm-raised font-medium text-adm-ink"
                  : "text-adm-ink-2 hover:bg-adm-raised",
              )}
            >
              {preset.label}
              {value.preset === preset.id && <Check size={14} />}
            </button>
          ))}

          <div className="mt-1 border-t border-adm-line p-2.5">
            <p className="mb-2 text-micro font-medium text-adm-ink-2">
              Período personalizado
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(event) => setCustomFrom(event.target.value)}
                aria-label="Data inicial"
                className="h-8 w-full rounded-adm border border-adm-line bg-adm-surface px-2 text-[12px] text-adm-ink"
              />
              <span className="text-adm-ink-3">–</span>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={dayKey(NOW)}
                onChange={(event) => setCustomTo(event.target.value)}
                aria-label="Data final"
                className="h-8 w-full rounded-adm border border-adm-line bg-adm-surface px-2 text-[12px] text-adm-ink"
              />
            </div>
            <Button
              size="sm"
              variant="primary"
              fullWidth
              className="mt-2"
              onClick={applyCustom}
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Botão de filtros avançados com contador de filtros ativos. */
export function FilterButton({
  count,
  onClick,
  expanded,
}: {
  count: number;
  onClick: () => void;
  expanded: boolean;
}) {
  return (
    <Button
      icon={SlidersHorizontal}
      onClick={onClick}
      aria-expanded={expanded}
      className={clsx(count > 0 && "border-adm-accent/50 bg-adm-accent-bg")}
    >
      Filtros
      {count > 0 && (
        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-adm-accent px-1 text-micro font-medium text-white">
          {count}
        </span>
      )}
    </Button>
  );
}
