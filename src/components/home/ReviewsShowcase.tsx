import { Star, Quote } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const testimonials = [
  {
    name: "Camila R.",
    city: "Itu - SP",
    text: "Melhor perfumaria da região, sem dúvida. O atendimento me ajudou a achar o árabe perfeito para o meu tipo de pele. Virei cliente fiel.",
  },
  {
    name: "Rodrigo A.",
    city: "Jundiaí - SP",
    text: "Comprei o Sauvage e veio original, lacrado e com nota. Chegou super rápido. Confiança total na JA Store.",
  },
  {
    name: "Patrícia G.",
    city: "Cabreúva - SP",
    text: "A embalagem de presente é um capricho à parte. Dei para minha mãe e ela amou. Recomendo de olhos fechados.",
  },
];

export function ReviewsShowcase() {
  return (
    <section className="container-wrap py-16 sm:py-20">
      <div className="mb-10 text-center">
        <p className="eyebrow">Quem compra, recomenda</p>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Nota 5,0 de quem já sentiu
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <RevealOnScroll key={t.name} delay={i * 70}>
            <figure className="flex h-full flex-col rounded-xs border border-ink/10 bg-ivory-50 p-7 shadow-card">
              <Quote size={26} className="text-champagne/50" />
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={14}
                    className="fill-champagne text-champagne"
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-5 border-t border-ink/10 pt-4">
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-ink-500">{t.city}</p>
              </figcaption>
            </figure>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
