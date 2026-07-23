import type { ReactNode } from "react";

export interface Section {
  title: string;
  body: ReactNode;
}

export function LegalDocument({
  sections,
  updated,
}: {
  sections: Section[];
  updated: string;
}) {
  return (
    <div className="container-wrap py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs text-ink-500">Última atualização: {updated}</p>
        <div className="mt-8 grid gap-10">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="font-display text-2xl text-ink">
                <span className="text-champagne-dark">{i + 1}.</span> {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-700">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
