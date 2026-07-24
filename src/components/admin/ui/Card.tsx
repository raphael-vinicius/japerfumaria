import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import clsx from "clsx";
import { formatBRL } from "@/lib/format";

/** Superfície padrão do painel: fio de 1px, sombra curta, sem gradiente. */
export function Card({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      className={clsx(
        "min-w-0 rounded-adm-lg border border-adm-line bg-adm-surface shadow-adm",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-wrap items-center justify-between gap-3 border-b border-adm-line px-5 py-3.5",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-[13.5px] font-medium text-adm-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 truncate text-micro text-adm-ink-3">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={clsx("p-5", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-3 border-t border-adm-line px-5 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Rodapé "ver tudo" de um bloco do dashboard. */
export function CardLinkFooter({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 border-t border-adm-line px-5 py-2.5 text-[12.5px] font-medium text-adm-ink-2 transition-colors hover:bg-adm-raised hover:text-adm-ink"
    >
      {label}
      <ArrowRight size={14} />
    </Link>
  );
}

export interface StatsCardProps {
  label: string;
  value: string;
  /** Variação percentual contra o período anterior. */
  delta?: number | null;
  deltaLabel?: string;
  /** Quando true, subir é ruim (ex.: cancelamentos). */
  invertDelta?: boolean;
  hint?: string;
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  href?: string;
  /** Destaque discreto para os cartões que exigem ação. */
  attention?: boolean;
}

export function StatsCard({
  label,
  value,
  delta,
  deltaLabel = "vs. período anterior",
  invertDelta = false,
  hint,
  icon: Icon,
  href,
  attention,
}: StatsCardProps) {
  const positive = delta != null && delta > 0;
  const negative = delta != null && delta < 0;
  const good = invertDelta ? negative : positive;
  const bad = invertDelta ? positive : negative;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-medium text-adm-ink-2">{label}</p>
        {Icon && (
          <Icon
            size={15}
            className={clsx(
              "shrink-0",
              attention ? "text-adm-warn" : "text-adm-ink-3",
            )}
          />
        )}
      </div>

      <p className="mt-2 text-[26px] font-medium leading-none tracking-[-0.02em] text-adm-ink">
        {value}
      </p>

      <div className="mt-2.5 flex min-h-[1.05rem] items-center gap-1.5 text-micro">
        {delta != null ? (
          <>
            <span
              className={clsx(
                "inline-flex items-center gap-0.5 font-medium",
                good && "text-adm-ok",
                bad && "text-adm-bad",
                !good && !bad && "text-adm-ink-3",
              )}
            >
              {delta === 0 ? (
                <Minus size={12} />
              ) : positive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {delta > 0 ? "+" : ""}
              {delta.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
            </span>
            <span className="text-adm-ink-3">{deltaLabel}</span>
          </>
        ) : (
          <span className="text-adm-ink-3">{hint ?? "—"}</span>
        )}
      </div>
    </>
  );

  const shell =
    "block min-w-0 rounded-adm-lg border bg-adm-surface p-4 shadow-adm transition-colors";

  if (href) {
    return (
      <Link
        href={href}
        className={clsx(
          shell,
          "group relative hover:border-adm-line-strong hover:bg-adm-raised",
          attention ? "border-adm-warn/40" : "border-adm-line",
        )}
      >
        {content}
        <ArrowUpRight
          size={14}
          aria-hidden="true"
          className="absolute right-3.5 top-11 text-adm-ink-3 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </Link>
    );
  }

  return (
    <div className={clsx(shell, attention ? "border-adm-warn/40" : "border-adm-line")}>
      {content}
    </div>
  );
}

/** Par rótulo/valor — a unidade de leitura das fichas de detalhe. */
export function DataRow({
  label,
  value,
  className,
  mono,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex items-baseline justify-between gap-4 py-1.5 text-[13px]",
        className,
      )}
    >
      <dt className="shrink-0 text-adm-ink-3">{label}</dt>
      <dd
        className={clsx(
          "min-w-0 text-right text-adm-ink",
          mono && "tabular-nums",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** Linha de totais — a última recebe ênfase. */
export function MoneyRow({
  label,
  value,
  emphasis,
  tone,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
  tone?: "default" | "discount";
}) {
  return (
    <div
      className={clsx(
        "flex items-baseline justify-between gap-4 py-1.5",
        emphasis
          ? "mt-1 border-t border-adm-line pt-3 text-[15px] font-medium text-adm-ink"
          : "text-[13px] text-adm-ink-2",
      )}
    >
      <span>{label}</span>
      <span
        className={clsx(
          "tabular-nums",
          tone === "discount" ? "text-adm-ok" : "text-adm-ink",
          emphasis && "text-[17px]",
        )}
      >
        {tone === "discount" && value > 0 ? "− " : ""}
        {formatBRL(value)}
      </span>
    </div>
  );
}
