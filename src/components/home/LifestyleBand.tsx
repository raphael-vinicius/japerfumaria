import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { lifestyleCategories } from "@/lib/categories";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

/**
 * "Além dos perfumes" — as linhas reais da fachada da JA
 * (Cosméticos · Semi Joias · Bolsas), conduzidas por atendimento.
 * Tratamento distinto do strip de fragrâncias: cards largos e editoriais.
 */
export function LifestyleBand() {
  return (
    <section className="container-wrap py-12 sm:py-16">
      <div className="mb-9 max-w-2xl">
        <p className="eyebrow">Além dos perfumes</p>
        <h2 className="mt-3 font-display text-title font-light text-ink">
          A loja também é sobre presentear-se
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-600">
          Como na loja de Cabreúva, a JA reúne cosméticos, semi joias folheadas
          e bolsas para completar o seu ritual. Essas linhas giram por curadoria —
          apresentamos as peças pelo atendimento.
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        {lifestyleCategories.map((c, i) => (
          <RevealOnScroll key={c.slug} delay={i * 70}>
            <Link
              href={`/categoria/${c.slug}`}
              className="group relative flex aspect-[5/6] flex-col justify-between overflow-hidden rounded-xs p-6 text-ivory-50 shadow-card ring-1 ring-inset ring-white/10 transition-all duration-500 ease-luxe hover:-translate-y-1 hover:shadow-lift sm:aspect-[4/5]"
              style={{
                background: `linear-gradient(158deg, ${c.accent} 6%, ${c.accent2} 130%)`,
              }}
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light grain" />
              <div className="relative flex items-start justify-between">
                <span className="text-[9.5px] font-medium uppercase tracking-wide2 text-ivory-50/75">
                  Na loja
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ivory-50/15 backdrop-blur transition-transform duration-500 ease-luxe group-hover:rotate-45">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <div className="relative">
                <h3 className="font-display text-2xl font-medium leading-none">
                  {c.name}
                </h3>
                <p className="mt-2 max-w-[15rem] text-sm leading-snug text-ivory-50/80">
                  {c.tagline}
                </p>
              </div>
            </Link>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
