import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-xs border border-ink/10 bg-ivory-50 p-5 shadow-soft sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: number;
  positive: boolean;
}) {
  return (
    <Card>
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">
        {value}
      </p>
      <p
        className={clsx(
          "mt-2 inline-flex items-center gap-1 text-xs font-semibold",
          positive ? "text-mint-dark" : "text-wine-light",
        )}
      >
        {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {delta > 0 ? "+" : ""}
        {delta}% vs. mês anterior
      </p>
    </Card>
  );
}

export function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function BarChart({
  data,
  suffix = "k",
}: {
  data: { label: string; value: number }[];
  suffix?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex h-52 items-end justify-between gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-ink-600">
            {d.value}
            {suffix}
          </span>
          <div className="flex w-full items-end justify-center">
            <div
              className="w-full max-w-[38px] rounded-t-lg bg-gradient-to-t from-champagne-dark to-champagne transition-all duration-700"
              style={{ height: `${(d.value / max) * 150}px` }}
            />
          </div>
          <span className="text-xs text-ink-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const radius = 42;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
      <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
        {data.map((d) => {
          const frac = d.value / total;
          const dash = frac * circ;
          const seg = (
            <circle
              key={d.label}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <ul className="grid gap-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-ink-700">{d.label}</span>
            <span className="ml-auto font-semibold text-ink">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
