import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "Ver tudo",
  align = "left",
  className,
}: Props) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={clsx(align === "center" && "mx-auto max-w-2xl")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-600">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="link-underline inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink"
        >
          {hrefLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
