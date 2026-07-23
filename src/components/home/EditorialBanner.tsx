import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getProduct } from "@/lib/products";

export function EditorialBanner() {
  const p1 = getProduct("lattafa-khamrah");
  const p2 = getProduct("al-haramain-amber-oud-gold-edition");

  return (
    <section className="container-wrap py-8">
      <div className="relative grid overflow-hidden rounded-xs bg-ink text-ivory md:grid-cols-2">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 85% 30%, rgba(199,154,91,0.35), transparent 60%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <p className="eyebrow text-champagne-light">Coleção em destaque</p>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">
            O universo dos
            <br />
            perfumes árabes
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/70">
            Densos, doces e de fixação impressionante. Descubra por que Lattafa,
            Armaf e Al Haramain conquistaram o Brasil — e por que a JA é
            referência em curadoria árabe na região.
          </p>
          <div className="mt-8">
            <Link href="/categoria/arabes" className="btn-gold">
              Ver coleção árabe <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {/* Fotos reais flutuando sobre o fundo escuro */}
        <div className="relative min-h-[280px] md:min-h-[420px]">
          {p1?.image && (
            <div className="absolute bottom-4 left-6 h-[72%] w-[44%] sm:left-14">
              <Image
                src={p1.image}
                alt={`${p1.brand} ${p1.name}`}
                fill
                sizes="(max-width: 768px) 44vw, 300px"
                className="object-contain drop-shadow-[0_26px_28px_rgba(0,0,0,0.45)]"
              />
            </div>
          )}
          {p2?.image && (
            <div className="absolute right-6 top-10 h-[54%] w-[38%] sm:right-16">
              <Image
                src={p2.image}
                alt={`${p2.brand} ${p2.name}`}
                fill
                sizes="(max-width: 768px) 38vw, 260px"
                className="object-contain drop-shadow-[0_22px_24px_rgba(0,0,0,0.45)]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
