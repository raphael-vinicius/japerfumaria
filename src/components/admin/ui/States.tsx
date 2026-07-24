import type { ComponentType, ReactNode } from "react";
import { AlertTriangle, Inbox, WifiOff } from "lucide-react";
import clsx from "clsx";

/**
 * Estados da interface: vazio, erro, offline e carregamento.
 *
 * Um estado vazio sempre responde três coisas: o que deveria estar
 * aqui, por que não está e qual é o próximo passo. Nada de "nenhum
 * dado encontrado" sem saída.
 */

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact,
  className,
}: {
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-8" : "gap-3 py-14",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-10 w-10 place-items-center rounded-full bg-adm-sunken text-adm-ink-3"
      >
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[13.5px] font-medium text-adm-ink">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-adm-ink-3">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar",
  description = "Algo saiu do esperado ao buscar estes dados. Tente novamente em instantes.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span
        aria-hidden="true"
        className="grid h-10 w-10 place-items-center rounded-full bg-adm-bad-bg text-adm-bad"
      >
        <AlertTriangle size={18} />
      </span>
      <div>
        <p className="text-[13.5px] font-medium text-adm-ink">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-adm-ink-3">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

/** Faixa de conexão perdida — some sozinha quando a rede volta. */
export function OfflineBanner({ online }: { online: boolean }) {
  if (online) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-adm-warn-bg px-4 py-2 text-[12.5px] font-medium text-adm-warn"
    >
      <WifiOff size={14} />
      Sem conexão — as alterações não estão sendo salvas.
    </div>
  );
}

export function Skeleton({
  className,
  rounded = "rounded-adm",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx("adm-skeleton block", rounded, className)}
    />
  );
}

/** Esqueleto de tabela — mesma métrica das linhas reais, sem “pulo”. */
export function TableSkeleton({
  rows = 8,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div role="status" aria-label="Carregando dados" className="w-full">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-adm-line/70 px-4 py-3 last:border-b-0"
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={clsx(
                "h-3.5",
                columnIndex === 0 ? "w-24" : "flex-1",
                columnIndex === columns - 1 && "max-w-[4rem]",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Esqueleto de cartão de indicador. */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Carregando indicadores"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-adm-lg border border-adm-line bg-adm-surface p-4"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-6 w-28" />
          <Skeleton className="mt-3 h-2.5 w-32" />
        </div>
      ))}
    </div>
  );
}

/** Carregamento de página inteira, centralizado. */
export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 py-20"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-adm-line border-t-adm-accent"
      />
      <p className="text-[12.5px] text-adm-ink-3">{label}</p>
    </div>
  );
}
