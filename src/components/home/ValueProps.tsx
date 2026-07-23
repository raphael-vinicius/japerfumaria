import { Sparkles, BadgeCheck, MessagesSquare, Truck } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const items = [
  {
    icon: Sparkles,
    title: "Curadoria de verdade",
    text: "Cada fragrância é testada e selecionada pela nossa equipe. Nada de catálogo aleatório.",
  },
  {
    icon: BadgeCheck,
    title: "Originalidade garantida",
    text: "Importados lacrados com nota fiscal e árabes direto das casas produtoras.",
  },
  {
    icon: MessagesSquare,
    title: "Atendimento consultivo",
    text: "Ajudamos você a escolher pelo WhatsApp, com recomendações personalizadas.",
  },
  {
    icon: Truck,
    title: "Entrega para todo o Brasil",
    text: "Envio expresso em Cabreúva e região, e frete grátis acima de R$ 299 em SP.",
  },
];

export function ValueProps() {
  return (
    <section className="border-y border-ink/10 bg-ivory-50">
      <div className="container-wrap grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <RevealOnScroll key={item.title} delay={i * 70}>
            <div className="flex flex-col gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-champagne-light">
                <item.icon size={20} />
              </span>
              <h3 className="font-display text-lg text-ink">{item.title}</h3>
              <p className="text-sm leading-relaxed text-ink-600">
                {item.text}
              </p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
