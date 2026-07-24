"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

/**
 * Campos de formulário. Todo controle nasce com <label> ligado por
 * id, mensagem de erro anunciada por aria-describedby e estados de
 * erro visíveis por cor E por texto — nunca só por cor.
 */

const controlBase =
  "w-full rounded-adm border bg-adm-surface text-[13px] text-adm-ink placeholder:text-adm-ink-3 " +
  "transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-adm-sunken disabled:text-adm-ink-3";

const controlTone = (invalid?: boolean) =>
  invalid
    ? "border-adm-bad/60 focus:border-adm-bad"
    : "border-adm-line hover:border-adm-line-strong focus:border-adm-accent";

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Texto à direita do rótulo (ex.: contador de caracteres). */
  aside?: ReactNode;
  className?: string;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => ReactNode;
}

/** Envelope de rótulo, dica e erro — usado pelos controles abaixo. */
export function Field({
  label,
  hint,
  error,
  required,
  aside,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {(label || aside) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label
              htmlFor={id}
              className="text-[12.5px] font-medium text-adm-ink-2"
            >
              {label}
              {required && (
                <span className="ml-0.5 text-adm-bad" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {aside && <span className="text-micro text-adm-ink-3">{aside}</span>}
        </div>
      )}

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {error ? (
        <p id={`${id}-error`} className="text-micro text-adm-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-micro text-adm-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  aside?: ReactNode;
  /** Prefixo fixo dentro do campo (ex.: "R$", "%"). */
  prefix?: string;
  suffix?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, aside, prefix, suffix, containerClassName, className, required, ...rest },
  ref,
) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      aside={aside}
      required={required}
      className={containerClassName}
    >
      {(fieldProps) => (
        <div className="relative flex items-center">
          {prefix && (
            <span className="pointer-events-none absolute left-3 text-[13px] text-adm-ink-3">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            required={required}
            className={clsx(
              controlBase,
              controlTone(Boolean(error)),
              "h-9",
              prefix ? "pl-9" : "pl-3",
              suffix ? "pr-9" : "pr-3",
              className,
            )}
            {...fieldProps}
            {...rest}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-3 text-[13px] text-adm-ink-3">
              {suffix}
            </span>
          )}
        </div>
      )}
    </Field>
  );
});

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  aside?: ReactNode;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, error, aside, containerClassName, className, required, rows = 4, ...rest },
    ref,
  ) {
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        aside={aside}
        required={required}
        className={containerClassName}
      >
        {(fieldProps) => (
          <textarea
            ref={ref}
            rows={rows}
            required={required}
            className={clsx(
              controlBase,
              controlTone(Boolean(error)),
              "resize-y px-3 py-2 leading-relaxed",
              className,
            )}
            {...fieldProps}
            {...rest}
          />
        )}
      </Field>
    );
  },
);

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, containerClassName, className, required, ...rest },
  ref,
) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {(fieldProps) => (
        <div className="relative">
          <select
            ref={ref}
            required={required}
            className={clsx(
              controlBase,
              controlTone(Boolean(error)),
              "h-9 cursor-pointer appearance-none pl-3 pr-8",
              className,
            )}
            {...fieldProps}
            {...rest}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-adm-ink-3"
          />
        </div>
      )}
    </Field>
  );
});

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Interruptor para preferências que valem imediatamente. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: ToggleProps) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-start justify-between gap-4",
        disabled && "cursor-not-allowed opacity-55",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-adm-ink">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-micro leading-relaxed text-adm-ink-3">
            {description}
          </span>
        )}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={clsx(
            "block h-5 w-9 rounded-full transition-colors duration-200",
            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-adm-accent",
            checked ? "bg-adm-ok" : "bg-adm-line-strong",
          )}
        />
        <span
          aria-hidden="true"
          className={clsx(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-adm transition-transform duration-200",
            checked && "translate-x-4",
          )}
        />
      </span>
    </label>
  );
}

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, className, ...rest }, ref) {
    return (
      <label
        className={clsx(
          "flex cursor-pointer items-center gap-2 text-[13px] text-adm-ink",
          className,
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="h-3.5 w-3.5 cursor-pointer rounded-[3px] border-adm-line-strong text-adm-nav accent-adm-nav"
          {...rest}
        />
        {label}
      </label>
    );
  },
);

/** Bloco de formulário com título e descrição — usado nas configurações. */
export function FieldSet({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={clsx("min-w-0", className)}>
      <legend className="text-[13px] font-medium text-adm-ink">{title}</legend>
      {description && (
        <p className="mt-1 max-w-prose2 text-micro leading-relaxed text-adm-ink-3">
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}
