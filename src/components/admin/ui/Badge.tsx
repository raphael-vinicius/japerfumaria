import type { ReactNode } from "react";
import clsx from "clsx";
import type { Tone } from "@/lib/admin/labels";

/**
 * Etiqueta de estado. O tom vem sempre de `lib/admin/labels`, então
 * um mesmo estado nunca aparece com duas cores em telas diferentes.
 * O ponto colorido dá leitura periférica sem depender só da cor.
 */

const tones: Record<Tone, { chip: string; dot: string }> = {
  neutral: { chip: "bg-adm-sunken text-adm-ink-2", dot: "bg-adm-ink-3" },
  accent: { chip: "bg-adm-accent-bg text-adm-accent", dot: "bg-adm-accent" },
  ok: { chip: "bg-adm-ok-bg text-adm-ok", dot: "bg-adm-ok" },
  warn: { chip: "bg-adm-warn-bg text-adm-warn", dot: "bg-adm-warn" },
  bad: { chip: "bg-adm-bad-bg text-adm-bad", dot: "bg-adm-bad" },
  info: { chip: "bg-adm-info-bg text-adm-info", dot: "bg-adm-info" },
  ship: { chip: "bg-adm-ship-bg text-adm-ship", dot: "bg-adm-ship" },
};

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  /** Ponto colorido à esquerda — para status operacionais. */
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-micro" : "px-2.5 py-1 text-[12px]",
        tones[tone].chip,
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", tones[tone].dot)}
        />
      )}
      {children}
    </span>
  );
}

export interface StatusBadgeProps {
  status: { label: string; tone: Tone };
  size?: "sm" | "md";
  className?: string;
}

/** Atalho para os mapas de `labels.ts` — evita repetir label + tone. */
export function StatusBadge({ status, size, className }: StatusBadgeProps) {
  return (
    <Badge tone={status.tone} dot size={size} className={className}>
      {status.label}
    </Badge>
  );
}

/** Contador discreto ao lado de títulos e abas. */
export function Count({
  value,
  active,
}: {
  value: number;
  active?: boolean;
}) {
  return (
    <span
      className={clsx(
        "ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-px text-micro font-medium tabular-nums",
        active ? "bg-adm-nav text-white" : "bg-adm-sunken text-adm-ink-2",
      )}
    >
      {value}
    </span>
  );
}
