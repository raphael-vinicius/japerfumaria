import { Truck, ShieldCheck, Sparkles } from "lucide-react";

const messages = [
  { icon: Truck, text: "Frete grátis acima de R$ 299 em todo o estado de SP" },
  { icon: ShieldCheck, text: "100% originais · Nota fiscal em todas as compras" },
  { icon: Sparkles, text: "Árabes selecionados direto das casas produtoras" },
  { icon: Truck, text: "Entrega expressa em Cabreúva e região" },
];

export function AnnouncementBar() {
  return (
    <div className="overflow-hidden bg-ink text-ivory">
      <div className="flex whitespace-nowrap py-2.5 animate-marquee">
        {[...messages, ...messages].map((m, i) => (
          <span
            key={i}
            className="mx-8 inline-flex items-center gap-2 text-2xs font-medium uppercase tracking-wide2"
          >
            <m.icon size={13} className="text-champagne-light" />
            {m.text}
          </span>
        ))}
      </div>
    </div>
  );
}
