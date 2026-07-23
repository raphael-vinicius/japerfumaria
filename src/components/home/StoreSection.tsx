import Image from "next/image";
import { MapPin, Clock, MessageCircle, ArrowUpRight } from "lucide-react";
import { brand, waLink } from "@/lib/brand";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

/**
 * "Nossa loja" — usa a FOTO REAL da fachada (extraída do Google).
 * Traz o endereço, horários e CTAs reais (rota + WhatsApp), reforçando
 * a confiança de uma loja física de verdade em Cabreúva.
 */
export function StoreSection() {
  return (
    <section className="bg-ivory-200/60">
      <div className="container-wrap grid items-center gap-10 py-section lg:grid-cols-2 lg:gap-16">
        {/* Foto real da fachada */}
        <RevealOnScroll>
          <figure className="relative">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xs sm:aspect-[4/5]">
              <Image
                src="/marca/fachada.jpg"
                alt={`Fachada da ${brand.name} — ${brand.address.street}, ${brand.address.city}`}
                fill
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/10" />
            </div>
            <figcaption className="absolute -bottom-3 left-4 bg-ink px-4 py-2 font-sans text-2xs font-medium uppercase tracking-wide2 text-ivory sm:left-6">
              A loja · Cabreúva – SP
            </figcaption>
          </figure>
        </RevealOnScroll>

        {/* Conteúdo */}
        <div>
          <p className="eyebrow">Nossa loja</p>
          <h2 className="mt-3 font-display text-hero font-light leading-[1.02] text-ink">
            Onde tudo <em className="not-italic text-champagne-dark">começa</em>
            <br className="hidden sm:block" /> é no balcão.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-600">
            Desde {brand.founded}, a JA atende pessoalmente na Rua Fernando Nunes.
            É lá que a gente borrifa, conversa e ajuda cada cliente a encontrar a
            fragrância certa — o mesmo cuidado que trouxemos para este site.
          </p>

          <dl className="mt-8 space-y-4 border-t border-ink/10 pt-8">
            <div className="flex items-start gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-champagne-dark" />
              <div>
                <dt className="sr-only">Endereço</dt>
                <dd className="text-sm text-ink">
                  {brand.address.street}
                  <span className="text-ink-500">
                    {" "}
                    — {brand.address.city}/{brand.address.state}, {brand.address.zip}
                  </span>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={17} className="mt-0.5 shrink-0 text-champagne-dark" />
              <div>
                <dt className="sr-only">Horário</dt>
                <dd className="text-sm text-ink-600">
                  {brand.hours.map((h) => (
                    <span key={h.day} className="mr-4 inline-block">
                      <span className="text-ink">{h.day}:</span> {h.time}
                    </span>
                  ))}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={brand.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Como chegar <ArrowUpRight size={16} />
            </a>
            <a
              href={waLink(
                "Olá, JA! Encontrei a loja pelo site e queria falar com um atendente.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <MessageCircle size={15} /> Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
