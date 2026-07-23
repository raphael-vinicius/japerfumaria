import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { faq } from "@/lib/faq";
import { waLink } from "@/lib/brand";
import { PageHeader } from "@/components/ui/PageHeader";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description: "Tire suas dúvidas sobre originalidade, entrega, pagamento e trocas.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Central de ajuda"
        title="Perguntas frequentes"
        description="As dúvidas mais comuns de quem compra na JA Store. Não achou o que procura? Chame a gente."
        crumbs={[{ label: "Perguntas frequentes" }]}
      />

      <section className="container-wrap py-16">
        <div className="mx-auto max-w-3xl">
          <Accordion
            items={faq.map((f) => ({ title: f.question, content: f.answer }))}
            defaultOpen={0}
          />

          <div className="mt-12 flex flex-col items-center gap-4 rounded-xs bg-ink p-10 text-center text-ivory">
            <p className="font-display text-2xl">Ainda com dúvidas?</p>
            <p className="max-w-md text-sm text-ivory/70">
              Nossa equipe adora ajudar a escolher a fragrância perfeita.
              Responde no WhatsApp em minutos.
            </p>
            <a
              href={waLink("Olá! Tenho uma dúvida que não achei no FAQ.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <MessageCircle size={16} /> Falar com um especialista
            </a>
            <Link
              href="/institucional/contato"
              className="text-sm text-ivory/60 underline hover:text-ivory"
            >
              Ou envie uma mensagem
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
