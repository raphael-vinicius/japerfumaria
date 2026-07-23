import Link from "next/link";
import clsx from "clsx";
import { brand } from "@/lib/brand";

interface Props {
  className?: string;
  variant?: "dark" | "light";
  compact?: boolean;
}

/**
 * Marca JA Store Perfumaria — recriação fiel do logo real da loja:
 * monograma "JA" dourado em serifa alta, com "STORE PERFUMARIA" e a
 * assinatura "Árabes & Importados". Construído em tipografia (nítido
 * em qualquer tela); pronto para receber o arquivo oficial se enviado.
 */
export function Logo({ className, variant = "dark", compact = false }: Props) {
  const text = variant === "light" ? "text-ivory" : "text-ink";
  const sub = variant === "light" ? "text-ivory/55" : "text-ink-500";

  return (
    <Link
      href="/"
      className={clsx("group inline-flex items-center gap-2.5", className)}
      aria-label={`${brand.name} — página inicial`}
    >
      {/* Monograma dourado */}
      <span
        className="font-display text-[2rem] font-medium leading-none tracking-[-0.03em] text-champagne transition-colors duration-500 group-hover:text-champagne-dark"
        aria-hidden
      >
        JA
      </span>

      {!compact && (
        <span className="flex flex-col justify-center gap-1 border-l border-champagne/35 pl-2.5 leading-none">
          <span
            className={clsx(
              "font-sans text-[10.5px] font-medium uppercase tracking-[0.34em]",
              text,
            )}
          >
            Store Perfumaria
          </span>
          <span
            className={clsx(
              "font-sans text-[7.5px] font-normal uppercase tracking-[0.28em]",
              sub,
            )}
          >
            {brand.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
