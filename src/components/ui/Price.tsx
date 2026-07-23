import clsx from "clsx";
import { formatBRL, formatInstallments } from "@/lib/format";

interface Props {
  price: number;
  compareAt?: number;
  installments?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-3xl",
};

export function Price({
  price,
  compareAt,
  installments = true,
  size = "md",
  className,
}: Props) {
  const { count, value } = formatInstallments(price);
  return (
    <div className={clsx("flex flex-col gap-0.5", className)}>
      {compareAt && compareAt > price && (
        <span className="text-xs text-ink-500 line-through">
          {formatBRL(compareAt)}
        </span>
      )}
      <span
        className={clsx("font-display font-semibold text-ink", sizes[size])}
      >
        {formatBRL(price)}
      </span>
      {installments && (
        <span className="text-xs text-ink-500">
          ou {count}x de {formatBRL(value)} sem juros
        </span>
      )}
    </div>
  );
}
