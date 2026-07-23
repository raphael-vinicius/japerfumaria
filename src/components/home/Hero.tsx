import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { brand } from "@/lib/brand";
import { getProduct } from "@/lib/products";
import { ProductBottle } from "@/components/product/ProductBottle";

export function Hero() {
  const hero = getProduct("lattafa-asad");
  const side1 = getProduct("lattafa-yara");
  const side2 = getProduct("dior-sauvage-eau-de-parfum");

  return (
    <section className="relative overflow-hidden bg-ivory">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 78% 12%, rgba(199,168,120,0.28), transparent 60%), radial-gradient(60% 60% at 10% 90%, rgba(110,26,43,0.10), transparent 60%)",
        }}
      />
      <div className="container-wrap relative grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-2 lg:gap-6 lg:py-24">
        <div className="animate-fade-up">
          <p className="eyebrow flex items-center gap-2">
            <span className="h-px w-8 bg-champagne-dark" />
            Perfumaria em Cabreúva · desde {brand.founded}
          </p>
          <h1 className="mt-5 font-display text-[2.7rem] leading-[1.05] text-ink sm:text-6xl lg:text-[4.2rem]">
            A fragrância que
            <br />
            fica na <em className="not-italic text-champagne-dark">memória</em>.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-600">
            Importados originais e uma curadoria de árabes intensos, escolhidos
            um a um. Encontre o perfume que combina com a sua assinatura — com
            atendimento de quem entende do assunto.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/categoria/arabes" className="btn-primary">
              Explorar árabes <ArrowRight size={17} />
            </Link>
            <Link href="/busca?sort=mais-vendidos" className="btn-outline">
              Mais vendidos
            </Link>
          </div>

          <div className="mt-9 flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="fill-champagne text-champagne"
                />
              ))}
            </div>
            <p className="text-sm text-ink-600">
              <strong className="text-ink">
                {brand.rating.toFixed(1).replace(".", ",")}
              </strong>{" "}
              · avaliação máxima no Google
            </p>
          </div>
        </div>

        {/* Composição editorial — PNGs reais flutuando sobre o blush */}
        <div className="relative mx-auto h-[360px] w-full max-w-md sm:h-[460px] lg:h-[540px]">
          {/* halo dourado atrás do frasco principal */}
          <span
            aria-hidden
            className="absolute left-1/2 top-[44%] h-[70%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(216,190,134,0.4), rgba(231,195,192,0.22) 55%, transparent 75%)",
            }}
          />
          {hero && (
            <figure className="absolute left-1/2 top-1/2 aspect-[4/5] w-[62%] -translate-x-1/2 -translate-y-1/2 animate-fade-up">
              {hero.image ? (
                <Image
                  src={hero.image}
                  alt={`${hero.brand} ${hero.name}`}
                  fill
                  priority
                  sizes="(max-width: 640px) 62vw, 350px"
                  className="object-contain drop-shadow-[0_34px_36px_rgba(62,45,51,0.3)]"
                />
              ) : (
                <ProductBottle
                  accent={hero.accent}
                  accent2={hero.accent2}
                  shape={hero.bottle}
                  monogram="LA"
                />
              )}
              <figcaption className="absolute inset-x-0 -bottom-9 text-center">
                <span className="text-[9px] font-semibold uppercase tracking-wide2 text-champagne-dark">
                  Nº 1 da loja
                </span>
                <span className="block font-display text-base font-medium text-ink">
                  {hero.brand} {hero.name}
                </span>
              </figcaption>
            </figure>
          )}
          {side1 && (
            <figure
              className="absolute bottom-2 left-0 aspect-square w-[36%] -rotate-3 animate-fade-up"
              style={{ animationDelay: "140ms" }}
            >
              {side1.image ? (
                <Image
                  src={side1.image}
                  alt={`${side1.brand} ${side1.name}`}
                  fill
                  sizes="180px"
                  className="object-contain drop-shadow-[0_20px_22px_rgba(62,45,51,0.24)]"
                />
              ) : (
                <ProductBottle
                  accent={side1.accent}
                  accent2={side1.accent2}
                  shape={side1.bottle}
                  monogram="LA"
                />
              )}
            </figure>
          )}
          {side2 && (
            <figure
              className="absolute right-0 top-3 aspect-square w-[32%] rotate-2 animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              {side2.image ? (
                <Image
                  src={side2.image}
                  alt={`${side2.brand} ${side2.name}`}
                  fill
                  sizes="170px"
                  className="object-contain drop-shadow-[0_20px_22px_rgba(62,45,51,0.24)]"
                />
              ) : (
                <ProductBottle
                  accent={side2.accent}
                  accent2={side2.accent2}
                  shape={side2.bottle}
                  monogram="DI"
                />
              )}
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
