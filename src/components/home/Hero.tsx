import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { brand } from "@/lib/brand";
import { getProduct } from "@/lib/products";
import { ProductBottle } from "@/components/product/ProductBottle";

/**
 * ————————————————————————————————————————————————————————————
 *  HERO — direção de arte "still-life iluminado"
 * ————————————————————————————————————————————————————————————
 *  A primeira dobra é tratada como uma CENA fotografada, não como
 *  três PNGs posicionados. Princípios:
 *
 *  · Uma única fonte de luz (key light no alto à direita) com
 *    falloff no canto oposto — o dourado é iluminação, não papel
 *    de parede.
 *  · Um chão comum: as bases dos frascos são alinhadas numa mesma
 *    linha (cada PNG tem um respiro inferior diferente, então cada
 *    figura é empurrada para baixo pelo seu próprio padding) e uma
 *    poça de sombra compartilhada os apoia na superfície.
 *  · Hierarquia de still-life: herói dominante ao centro/frente,
 *    secundário atrás à direita (na luz), terciário recuado à
 *    esquerda (na sombra, levemente desfocado — profundidade).
 *  · Sombras direcionais coerentes: todas caem para baixo-esquerda.
 *
 *  Padrões medidos de cada PNG (conteúdo dentro do canvas quadrado):
 *    asad  — base a 11.8% do fundo · largura útil 82%
 *    dior  — base a  5.8% do fundo · largura útil 78%
 *    yara  — base a  9.5% do fundo · largura útil 38% (frasco estreito)
 *  Como cada figura é quadrada e a imagem usa object-contain, um
 *  translateY igual ao padding inferior traz a base do produto
 *  exatamente até a linha do chão.
 * ————————————————————————————————————————————————————————————
 */
export function Hero() {
  const hero = getProduct("lattafa-asad");
  const side1 = getProduct("lattafa-yara"); // terciário — recuado à esquerda
  const side2 = getProduct("dior-sauvage-eau-de-parfum"); // secundário — à direita

  return (
    <section className="relative overflow-hidden bg-ivory">
      {/* ————————————————————————————————————————————————————————————
          LUZ DE CENÁRIO — uma única iluminação para o Hero inteiro
          ————————————————————————————————————————————————————————————
          A luz NÃO pertence ao cluster: é o fotógrafo iluminando o set
          todo. Fonte FORA do quadro (alto à direita), atravessando toda a
          largura do Hero — texto e produtos recebem a mesma luz. Sem núcleo
          atrás dos perfumes, sem auréola, sem caixa. Dourado + blush da
          marca dão atmosfera e vida (o blush aquece sem o ouro competir);
          cai suave para a página no canto oposto. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 130% at 84% -6%, rgba(214,186,128,0.27), rgba(214,186,128,0.13) 30%, rgba(214,186,128,0.05) 52%, transparent 74%), radial-gradient(110% 120% at 72% 26%, rgba(231,195,192,0.20), rgba(231,195,192,0.07) 44%, transparent 70%), linear-gradient(180deg, rgba(226,199,143,0.05) 0%, transparent 46%)",
        }}
      />
      {/* Grão fino de campanha impressa — tira o aspecto "digital chapado"
          e dá textura premium. Ruído fractal em soft-light, discreto; fica
          atrás de texto e produtos (não afeta a nitidez deles). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "150px 150px",
        }}
      />
      <div className="container-wrap relative grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-2 lg:gap-6 lg:py-24">
        {/* ————————————————————— Coluna de texto (inalterada) ————————————————————— */}
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

        {/* ———————————————————————————————————————————————————————————
            Área de posicionamento dos produtos — SEM footprint visual.
            Não é palco: nenhuma cor, borda, luz ou sombra própria. Só
            reserva a proporção vertical e ancora os frascos, que vivem
            diretamente sobre a página, sob a mesma luz de cenário. O
            aterramento é apenas a sombra projetada de cada frasco, que é
            translúcida e se dissolve no fundo — não há piso. */}
        <div className="relative mx-auto h-[350px] w-full max-w-[23rem] animate-fade-in sm:h-[450px] sm:max-w-[26rem] lg:h-[570px] lg:max-w-none">
          {/* ——— Terciário: Yara — atrás à esquerda, recuado e desfocado ——— */}
          {side1 && (
            <figure
              className="absolute bottom-[12%] left-[1%] z-10 aspect-square w-[34%] sm:left-[6%] sm:w-[28%] lg:left-[-3%] lg:w-[28%]"
              style={{ transform: "translateY(9.5%)" }}
            >
              {side1.image ? (
                <Image
                  src={side1.image}
                  alt={`${side1.brand} ${side1.name}`}
                  fill
                  loading="eager"
                  sizes="(max-width: 640px) 24vw, 135px"
                  className="object-contain drop-shadow-[-7px_12px_14px_rgba(52,37,42,0.24)]"
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

          {/* ——— Secundário: Dior — atrás à direita, na luz, sobrepondo o herói ——— */}
          {side2 && (
            <figure
              className="absolute bottom-[12%] right-[1%] z-20 aspect-square w-[34%] sm:right-[5%] sm:w-[28%] lg:right-[16%] lg:w-[27%]"
              style={{ transform: "translateY(5.8%)" }}
            >
              {side2.image ? (
                <Image
                  src={side2.image}
                  alt={`${side2.brand} ${side2.name}`}
                  fill
                  loading="eager"
                  sizes="(max-width: 640px) 34vw, 175px"
                  className="object-contain drop-shadow-[-10px_16px_17px_rgba(52,37,42,0.22)]"
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

          {/* ——— Herói: Asad — frente e centro, protagonista da cena ——— */}
          {hero && (
            <figure
              className="absolute bottom-[12%] left-1/2 z-30 aspect-square w-[76%] sm:w-[62%] lg:left-[42%] lg:w-[60%]"
              style={{ transform: "translate(-50%, 11.8%)" }}
            >
              {hero.image ? (
                <Image
                  src={hero.image}
                  alt={`${hero.brand} ${hero.name}`}
                  fill
                  priority
                  sizes="(max-width: 640px) 76vw, (max-width: 1024px) 63vw, 360px"
                  className="object-contain drop-shadow-[-14px_22px_22px_rgba(52,37,42,0.3)]"
                />
              ) : (
                <ProductBottle
                  accent={hero.accent}
                  accent2={hero.accent2}
                  shape={hero.bottle}
                  monogram="LA"
                />
              )}
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
