"use client";

import { useRouter } from "next/navigation";
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import clsx from "clsx";
import type { SortDirection } from "./hooks";

/**
 * Tabela de dados do painel.
 *
 * Decisões que sustentam a leitura de listas longas:
 * — cabeçalho fixo ao rolar, para não perder o contexto da coluna;
 * — números sempre alinhados à direita e tabulares;
 * — a linha inteira é clicável, mas a primeira célula tem um link
 *   real, então teclado e leitor de tela navegam normalmente.
 */

export function TableWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("w-full overflow-x-auto", className)}>{children}</div>
  );
}

export function Table({
  children,
  className,
  /** Largura mínima antes de rolar na horizontal. */
  minWidth = "44rem",
}: {
  children: ReactNode;
  className?: string;
  minWidth?: string;
}) {
  return (
    <table
      className={clsx("w-full border-collapse text-[13px]", className)}
      style={{ minWidth }}
    >
      {children}
    </table>
  );
}

export function THead({
  children,
  sticky = true,
}: {
  children: ReactNode;
  sticky?: boolean;
}) {
  return (
    <thead
      className={clsx(
        "bg-adm-raised",
        sticky && "sticky top-0 z-10",
      )}
    >
      {children}
    </thead>
  );
}

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "right" | "center";
  /** Chave de ordenação — presente torna o cabeçalho clicável. */
  sortKey?: string;
  activeSort?: { key: string; direction: SortDirection };
  onSort?: (key: string) => void;
  width?: string;
}

export function Th({
  children,
  align = "left",
  sortKey,
  activeSort,
  onSort,
  width,
  className,
  ...rest
}: ThProps) {
  const active = sortKey && activeSort?.key === sortKey;
  const direction = active ? activeSort?.direction : undefined;

  const content = (
    <span
      className={clsx(
        "inline-flex items-center gap-1",
        align === "right" && "flex-row-reverse",
      )}
    >
      {children}
      {sortKey && (
        <span aria-hidden="true" className={active ? "text-adm-ink" : "text-adm-ink-3/60"}>
          {!active ? (
            <ChevronsUpDown size={12} />
          ) : direction === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )}
        </span>
      )}
    </span>
  );

  return (
    <th
      scope="col"
      style={width ? { width } : undefined}
      aria-sort={
        active
          ? direction === "asc"
            ? "ascending"
            : "descending"
          : sortKey
            ? "none"
            : undefined
      }
      className={clsx(
        "whitespace-nowrap border-b border-adm-line px-4 py-2.5 text-micro-caps font-medium uppercase text-adm-ink-3",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...rest}
    >
      {sortKey && onSort ? (
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className="inline-flex items-center rounded-[3px] transition-colors hover:text-adm-ink"
        >
          {content}
        </button>
      ) : (
        content
      )}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export interface TrProps {
  children: ReactNode;
  /** Navega ao clicar em qualquer ponto da linha. */
  href?: string;
  className?: string;
  muted?: boolean;
}

export function Tr({ children, href, className, muted }: TrProps) {
  const router = useRouter();

  return (
    <tr
      onClick={
        href
          ? (event) => {
              // Não sequestra cliques em links, botões ou seleção de texto.
              const target = event.target as HTMLElement;
              if (target.closest("a,button,input,label")) return;
              if (window.getSelection()?.toString()) return;
              router.push(href);
            }
          : undefined
      }
      className={clsx(
        "border-b border-adm-line/70 transition-colors last:border-b-0",
        href && "cursor-pointer hover:bg-adm-raised",
        muted && "text-adm-ink-3",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "right" | "center";
  /** Números: alinhamento tabular para as colunas baterem. */
  numeric?: boolean;
  strong?: boolean;
  muted?: boolean;
}

export function Td({
  children,
  align,
  numeric,
  strong,
  muted,
  className,
  ...rest
}: TdProps) {
  const resolved = align ?? (numeric ? "right" : "left");
  return (
    <td
      className={clsx(
        "px-4 py-2.5 align-middle",
        resolved === "right" && "text-right",
        resolved === "center" && "text-center",
        numeric && "tabular-nums",
        strong && "font-medium text-adm-ink",
        muted && "text-adm-ink-3",
        !strong && !muted && "text-adm-ink-2",
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

/** Célula-âncora: dá à linha clicável um alvo real de teclado. */
export function TdLink({
  href,
  children,
  className,
  ...rest
}: TdProps & { href: string }) {
  return (
    <Td strong className={className} {...rest}>
      <a
        href={href}
        onClick={(event) => event.stopPropagation()}
        className="rounded-[3px] outline-offset-2 hover:text-adm-accent"
      >
        {children}
      </a>
    </Td>
  );
}

/** Linha única ocupando a tabela toda — vazio, erro ou carregamento. */
export function TableMessage({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16">
        {children}
      </td>
    </tr>
  );
}
