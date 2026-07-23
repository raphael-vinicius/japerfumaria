"use client";

import { useState, type ReactNode } from "react";
import { Plus, Minus } from "lucide-react";

export interface AccordionItem {
  title: string;
  content: ReactNode;
}

export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg text-ink">
                {item.title}
              </span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/15 text-ink-700">
                {isOpen ? <Minus size={14} /> : <Plus size={14} />}
              </span>
            </button>
            <div
              className="grid transition-all duration-400 ease-luxe"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
              }}
            >
              <div className="overflow-hidden">
                <div className="pb-6 text-sm leading-relaxed text-ink-600">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
