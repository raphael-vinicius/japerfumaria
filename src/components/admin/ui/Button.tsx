"use client";

import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

/**
 * Botão do painel — caixa alta e serifa ficam na vitrine. Aqui é
 * sans, densidade de interface e hierarquia clara: um primário por
 * tela, o resto secundário ou fantasma.
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "subtle";

export type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-1.5 rounded-adm font-medium " +
  "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-adm-nav text-white hover:bg-adm-ink active:bg-adm-nav shadow-adm",
  secondary:
    "border border-adm-line bg-adm-surface text-adm-ink shadow-adm hover:bg-adm-raised hover:border-adm-line-strong",
  ghost: "text-adm-ink-2 hover:bg-adm-sunken hover:text-adm-ink",
  danger:
    "border border-adm-bad/25 bg-adm-bad-bg text-adm-bad hover:bg-adm-bad hover:text-white hover:border-adm-bad",
  subtle: "bg-adm-accent-bg text-adm-accent hover:bg-adm-accent hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-[12.5px]",
  md: "h-9 px-3.5 text-[13px]",
  lg: "h-11 px-5 text-sm",
};

const iconSizes: Record<ButtonSize, number> = { sm: 14, md: 15, lg: 17 };

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentType<{ size?: number | string; className?: string }>;
  iconRight?: ComponentType<{ size?: number | string; className?: string }>;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export interface ButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "secondary",
      size = "md",
      icon: Icon,
      iconRight: IconRight,
      loading = false,
      fullWidth,
      className,
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={clsx(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : (
          Icon && <Icon size={iconSizes[size]} />
        )}
        {children}
        {IconRight && !loading && <IconRight size={iconSizes[size]} />}
      </button>
    );
  },
);

export interface ButtonLinkProps extends CommonProps {
  href: string;
  className?: string;
  title?: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
}

export function ButtonLink({
  href,
  variant = "secondary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={iconSizes[size]} />}
      {children}
      {IconRight && <IconRight size={iconSizes[size]} />}
    </Link>
  );
}

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: ComponentType<{ size?: number | string; className?: string }>;
  /** Obrigatório: botão só de ícone precisa de nome acessível. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const iconOnlySizes: Record<ButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon: Icon, label, variant = "ghost", size = "md", className, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={clsx(
          base,
          variants[variant],
          iconOnlySizes[size],
          "shrink-0",
          className,
        )}
        {...rest}
      >
        <Icon size={iconSizes[size] + 2} />
      </button>
    );
  },
);
