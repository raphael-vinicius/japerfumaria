import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Heart, ShieldCheck, MapPin } from "lucide-react";
import { brand } from "@/lib/brand";
import { PageHeader } from "@/components/ui/PageHeader";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "Quem somos",
  description: `Conheça a história da ${brand.name}, perfumaria de importados e árabes em Cabreúva.`,
};

const values = [
  {
    icon: Sparkles,
    title: "Curadoria honesta",
    text: "Só vendemos o que a gente mesmo usaria. Cada perfume é testado antes de entrar no catálogo.",
  },
  {
    icon: ShieldCheck,
    title: "Originalidade acima de tudo",
    text: "Importados lacrados com procedência e árabes direto das casas produtoras. Sempre com nota fiscal.",
  },
  {
    icon: Heart,
    title: "Atendimento de gente",
    text: "A gente conversa, entende o seu estilo e recomenda de verdade — pessoalmente ou pelo WhatsApp.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={`Desde ${brand.founded} · Cabreúva - SP`}
        title="A perfumaria que trata cada fragrância como uma história"
        description={brand.descriptionShort}
        crumbs={[{ label: "Quem somos" }]}
      />

      <section className="container-wrap grid gap-12 py-16 lg:grid-cols-2 lg:gap-16">
        <RevealOnScroll className="space-y-5 text-[15px] leading-relaxed text-ink-700">
          <p>
            A <strong className="text-ink">{brand.name}</strong> nasceu de uma
            paixão simples: a de ver o rosto de alguém se iluminar ao encontrar{" "}
            <em>aquele</em> perfume. Começamos pequenos, em Cabreúva, atendendo
            amigos e vizinhos que buscavam fragrâncias diferentes das que se
            achava em qualquer lugar.
          </p>
          <p>
            Foi assim que mergulhamos no universo dos{" "}
            <strong className="text-ink">perfumes árabes</strong> — intensos,
            marcantes e com uma fixação que impressiona — e nos tornamos
            referência na região. Ao mesmo tempo, mantivemos uma seleção
            criteriosa de{" "}
            <strong className="text-ink">importados originais</strong>, para
            quem já sabe o que quer e para quem está descobrindo.
          </p>
          <p>
            Hoje, mais do que vender perfumes, ajudamos cada cliente a encontrar
            a sua assinatura olfativa. É esse cuidado que nos rendeu uma
            avaliação{" "}
            <strong className="text-ink">
              {brand.rating.toFixed(1)} no Google
            </strong>{" "}
            e a confiança de quem volta sempre.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/busca" className="btn-primary">
              Ver catálogo
            </Link>
            <Link href="/institucional/contato" className="btn-outline">
              Fale com a gente
            </Link>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={120}>
          <div className="grid gap-4">
            {[
              { n: brand.rating.toFixed(1), l: "Nota no Google" },
              { n: "5,0", l: "Nota no Google" },
              { n: `${new Date().getFullYear() - brand.founded}+ anos`, l: "Perfumando a região" },
              { n: "100%", l: "Produtos originais" },
            ].map((stat) => (
              <div
                key={stat.l}
                className="flex items-center justify-between rounded-xs border border-ink/10 bg-ivory-50 p-6 shadow-soft"
              >
                <span className="font-display text-3xl font-semibold text-ink">
                  {stat.n}
                </span>
                <span className="text-sm text-ink-500">{stat.l}</span>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className="border-y border-ink/10 bg-ivory-50">
        <div className="container-wrap py-16">
          <h2 className="text-center font-display text-3xl text-ink sm:text-4xl">
            No que a gente acredita
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <RevealOnScroll key={v.title} delay={i * 70}>
                <div className="h-full rounded-xs border border-ink/10 bg-ivory-50 p-7 shadow-card">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-champagne-light">
                    <v.icon size={22} />
                  </span>
                  <h3 className="mt-5 font-display text-xl text-ink">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {v.text}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wrap py-16">
        <div className="flex items-center gap-3 text-ink-600">
          <MapPin size={20} className="text-champagne-dark" />
          <p className="text-sm">
            Venha nos visitar: <strong className="text-ink">{brand.address.full}</strong>
          </p>
        </div>
      </section>
    </>
  );
}
