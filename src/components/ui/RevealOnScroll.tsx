"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { useReveal } from "@/hooks/useReveal";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={clsx("reveal", visible && "reveal-in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
