import type { ReactNode } from "react";
import clsx from "clsx";
import { Breadcrumb, type Crumb } from "./Navigation";

/**
 * Cabeçalho de tela. Sempre na mesma posição, com a mesma métrica:
 * trilha, título, contexto de uma linha e as ações da tela à
 * direita. Repetição é o que faz o painel parecer um só produto.
 */
export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  meta,
  className,
}: {
  title: string;
  description?: ReactNode;
  breadcrumb?: Crumb[];
  actions?: ReactNode;
  /** Etiquetas ao lado do título (status, contagem). */
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <header className={clsx("mb-5", className)}>
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div
        className={clsx(
          "flex flex-col justify-between gap-3 sm:flex-row sm:items-start",
          breadcrumb && "mt-1.5",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[21px] font-medium tracking-[-0.015em] text-adm-ink">
              {title}
            </h1>
            {meta}
          </div>
          {description && (
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-adm-ink-3">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

/** Título de seção dentro de uma tela. */
export function SectionTitle({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "mb-3 flex items-end justify-between gap-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-[14px] font-medium text-adm-ink">{title}</h2>
        {description && (
          <p className="mt-0.5 text-micro text-adm-ink-3">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
