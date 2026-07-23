"use client";

import clsx from "clsx";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  inputMode?: "text" | "numeric" | "email" | "tel";
  autoComplete?: string;
  maxLength?: number;
  className?: string;
  as?: "input" | "textarea";
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
  inputMode,
  autoComplete,
  maxLength,
  className,
  as = "input",
}: Props) {
  const base =
    "w-full rounded-xs border bg-ivory-50 px-4 py-3 text-sm text-ink placeholder:text-ink-400 transition focus:outline-none focus:ring-1";
  const state = error
    ? "border-wine focus:border-wine focus:ring-wine"
    : "border-ink/15 focus:border-ink focus:ring-ink";

  return (
    <label className={clsx("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-ink-700">
        {label} {required && <span className="text-wine">*</span>}
      </span>
      {as === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={clsx(base, state, "resize-none")}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={clsx(base, state)}
        />
      )}
      {error && <span className="text-xs text-wine">{error}</span>}
    </label>
  );
}
