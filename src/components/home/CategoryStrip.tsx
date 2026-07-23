import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { shoppableCategories } from "@/lib/categories";
import { byCategory, getProduct, representativeProduct } from "@/lib/products";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function CategoryStrip() {
  return (
    <section className="container-wrap py-12 sm:py-16">
      <div className="mb-9 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Navegue por categoria</p>
          <h2 className="mt-3 font-display text-title font-light text-ink">
            Escolha pela ocasião
          </h2>
        </div>
        <span aria-hidden className="hidden h-px flex-1 max-w-[9rem] rule-gold sm:block" />
      </div>

      <div className="no-scrollbar -mx-5 flex gap-3.5 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
        {shoppableCategories.map((c, i) => {
          const total = byCategory(c.slug).length;
          // Produto-símbolo da categoria (ex.: Árabes → Asad, Lattafa)
          const hero =
            (c.heroSlug ? getProduct(c.heroSlug) : undefined) ??
            representativeProduct(c.slug);
          return (
            <RevealOnScroll
              key={c.slug}
              delay={i * 70}
              className="w-[43%] shrink-0 sm:w-auto"
            >
              <Link
                href={`/categoria/${c.slug}`}
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-xs p-4 text-ivory-50 shadow-card ring-1 ring-inset ring-white/10 transition-all duration-500 ease-luxe hover:-translate-y-1 hover:shadow-lift"
                style={{
                  background: `linear-gradient(158deg, ${c.accent} 8%, ${c.accent2} 128%)`,
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light grain"
                />

                {/* Produto-símbolo flutuando */}
                {hero?.image && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-4 top-4 h-[58%]"
                  >
                    <Image
                      src={hero.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 43vw, 220px"
                      className="object-contain object-center drop-shadow-[0_16px_18px_rgba(0,0,0,0.28)] transition-transform duration-700 ease-luxe group-hover:scale-[1.07]"
                    />
                  </div>
                )}

                <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-ivory-50/15 backdrop-blur transition-transform duration-500 ease-luxe group-hover:rotate-45">
                  <ArrowUpRight size={15} />
                </span>

                <span className="relative font-display text-xl font-medium leading-tight">
                  {c.name}
                </span>
                <span className="relative mt-1 line-clamp-2 min-h-[2rem] text-2xs font-medium uppercase leading-[1.35] tracking-wide2 text-ivory-50/80">
                  {hero ? `${hero.name} · ${hero.brand}` : `${total} itens`}
                </span>
              </Link>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}
