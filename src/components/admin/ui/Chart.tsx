"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { formatBRL } from "@/lib/format";

/**
 * Gráficos do painel.
 *
 * Regra da casa: só existe gráfico que responde a uma pergunta de
 * operação. Nada de pizza com sete fatias nem gradiente decorativo.
 * Uma cor por série, eixo enxuto e o número exato disponível no
 * hover — o valor exato importa mais que a estética da curva.
 */

/** Largura real do container — evita SVG esticado por viewBox. */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(element);
    setWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

export interface TrendPoint {
  label: string;
  value: number;
  /** Segunda métrica exibida apenas no tooltip (ex.: nº de pedidos). */
  secondary?: number;
}

export function TrendChart({
  data,
  height = 180,
  formatValue = formatBRL,
  secondaryLabel,
  ariaLabel,
}: {
  data: TrendPoint[];
  height?: number;
  formatValue?: (value: number) => string;
  secondaryLabel?: string;
  ariaLabel: string;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const padding = { top: 12, right: 4, bottom: 22, left: 4 };
  const chartWidth = Math.max(0, width - padding.left - padding.right);
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((point) => point.value), 1);

  const points = useMemo(
    () =>
      data.map((point, index) => ({
        ...point,
        x:
          padding.left +
          (data.length === 1
            ? chartWidth / 2
            : (index / (data.length - 1)) * chartWidth),
        y: padding.top + chartHeight - (point.value / max) * chartHeight,
      })),
    [data, chartWidth, chartHeight, max, padding.left, padding.top],
  );

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const areaPath = points.length
    ? `${linePath} L${points[points.length - 1].x},${padding.top + chartHeight} L${points[0].x},${padding.top + chartHeight} Z`
    : "";

  // Rótulos do eixo X: primeiro, último e alguns no meio.
  const tickEvery = Math.max(1, Math.ceil(data.length / 6));
  const current = active != null ? points[active] : null;

  return (
    <div ref={ref} className="relative w-full">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          className="block overflow-visible"
          onMouseLeave={() => setActive(null)}
          onMouseMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            let nearest = 0;
            let distance = Infinity;
            points.forEach((point, index) => {
              const delta = Math.abs(point.x - x);
              if (delta < distance) {
                distance = delta;
                nearest = index;
              }
            });
            setActive(nearest);
          }}
        >
          <defs>
            <linearGradient id="adm-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#836329" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#836329" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Linha de base — única régua do gráfico. */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            stroke="#E7E2DC"
            strokeWidth={1}
          />

          <path d={areaPath} fill="url(#adm-trend-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#836329"
            strokeWidth={1.75}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {current && (
            <>
              <line
                x1={current.x}
                y1={padding.top}
                x2={current.x}
                y2={padding.top + chartHeight}
                stroke="#D5CCC4"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={current.x}
                cy={current.y}
                r={4}
                fill="#FFFFFF"
                stroke="#836329"
                strokeWidth={2}
              />
            </>
          )}

          {points.map((point, index) =>
            index % tickEvery === 0 || index === points.length - 1 ? (
              <text
                key={point.label + index}
                x={point.x}
                y={height - 6}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === points.length - 1
                      ? "end"
                      : "middle"
                }
                className="fill-adm-ink-3 text-[10px]"
              >
                {point.label}
              </text>
            ) : null,
          )}
        </svg>
      )}

      {current && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-adm border border-adm-line bg-adm-surface px-2.5 py-1.5 text-[12px] shadow-adm-pop"
          style={{
            left: Math.min(Math.max(current.x, 64), Math.max(width - 64, 64)),
          }}
        >
          <p className="font-medium tabular-nums text-adm-ink">
            {formatValue(current.value)}
          </p>
          <p className="text-micro text-adm-ink-3">
            {current.label}
            {current.secondary != null &&
              ` · ${current.secondary} ${secondaryLabel ?? ""}`}
          </p>
        </div>
      )}
    </div>
  );
}

export interface RankItem {
  label: string;
  value: number;
  /** Texto à direita (ex.: "32 un."). */
  meta?: string;
  href?: string;
}

/**
 * Barras horizontais para ranking e participação. Substituem o
 * gráfico de pizza: comparar comprimentos é mais preciso que
 * comparar ângulos, e o rótulo cabe ao lado do dado.
 */
export function RankBars({
  items,
  formatValue = formatBRL,
  emptyLabel = "Sem dados no período.",
}: {
  items: RankItem[];
  formatValue?: (value: number) => string;
  emptyLabel?: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  if (!items.length)
    return <p className="py-6 text-center text-[12.5px] text-adm-ink-3">{emptyLabel}</p>;

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
            <span className="truncate text-adm-ink">{item.label}</span>
            <span className="shrink-0 tabular-nums text-adm-ink-2">
              {formatValue(item.value)}
              {item.meta && (
                <span className="ml-1.5 text-adm-ink-3">{item.meta}</span>
              )}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-adm-sunken">
            <div
              className="h-full rounded-full bg-adm-accent/70"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Mini-tendência para dentro de células e cartões. */
export function Sparkline({
  data,
  width = 72,
  height = 22,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;

  const path = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const rising = data[data.length - 1] >= data[0];

  return (
    <svg
      width={width}
      height={height}
      aria-hidden="true"
      className={clsx("overflow-visible", className)}
    >
      <path
        d={path}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={rising ? "stroke-adm-ok" : "stroke-adm-bad"}
      />
    </svg>
  );
}

/** Barra de proporção segmentada — participação por categoria. */
export function ShareBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-adm-sunken">
        {segments.map((segment) => (
          <div
            key={segment.label}
            title={`${segment.label}: ${Math.round((segment.value / total) * 100)}%`}
            style={{
              width: `${(segment.value / total) * 100}%`,
              background: segment.color,
            }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <li
            key={segment.label}
            className="flex items-center gap-1.5 text-micro text-adm-ink-2"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ background: segment.color }}
            />
            {segment.label}
            <span className="tabular-nums text-adm-ink-3">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
