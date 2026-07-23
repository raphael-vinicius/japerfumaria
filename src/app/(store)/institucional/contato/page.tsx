import type { Metadata } from "next";
import {
  MapPin,
  MessageCircle,
  Mail,
  Clock,
  Instagram,
  Navigation,
} from "lucide-react";
import { brand, waLink } from "@/lib/brand";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com a ${brand.name}. Atendimento por WhatsApp, telefone e na loja em Cabreúva.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Estamos por perto"
        title="Fale com a gente"
        description="Tire dúvidas, peça uma recomendação ou acompanhe seu pedido. Respondemos rápido — de verdade."
        crumbs={[{ label: "Contato" }]}
      />

      <section className="container-wrap grid gap-10 py-16 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid content-start gap-4">
          <a
            href={waLink("Olá! Vim pelo site e gostaria de atendimento.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xs border border-ink/10 bg-ivory-50 p-5 shadow-soft transition duration-300 hover:shadow-card"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#25D366]/10 text-[#25D366]">
              <MessageCircle size={22} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">
                WhatsApp
              </span>
              <span className="block text-sm text-ink-600">
                {brand.phoneDisplay} · resposta na hora
              </span>
            </span>
          </a>

          <div className="flex items-center gap-4 rounded-xs border border-ink/10 bg-ivory-50 p-5 shadow-soft">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-champagne-soft/40 text-champagne-dark">
              <MapPin size={22} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">Loja física</span>
              <span className="block text-sm text-ink-600">
                {brand.address.full}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4 rounded-xs border border-ink/10 bg-ivory-50 p-5 shadow-soft">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-champagne-soft/40 text-champagne-dark">
              <Mail size={22} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">E-mail</span>
              <span className="block text-sm text-ink-600">{brand.email}</span>
            </span>
          </div>

          <a
            href={brand.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xs border border-ink/10 bg-ivory-50 p-5 shadow-soft transition duration-300 hover:shadow-card"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-champagne-soft/40 text-champagne-dark">
              <Instagram size={22} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">Instagram</span>
              <span className="block text-sm text-ink-600">
                @{brand.instagram}
              </span>
            </span>
          </a>

          <div className="rounded-xs border border-ink/10 bg-ivory-50 p-5 shadow-soft">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Clock size={17} className="text-champagne-dark" /> Horário de
              atendimento
            </p>
            <ul className="mt-3 grid gap-1.5 text-sm text-ink-600">
              {brand.hours.map((h) => (
                <li key={h.day} className="flex justify-between">
                  <span>{h.day}</span>
                  <span className="font-medium text-ink">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mapa estilizado */}
          <div className="relative overflow-hidden rounded-xs border border-ink/10">
            <div
              className="h-44 w-full"
              style={{
                background:
                  "linear-gradient(135deg, #E9DFCE 0%, #F3EDE2 100%)",
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(23,19,16,0.05) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgba(23,19,16,0.05) 0 1px, transparent 1px 28px)",
              }}
            />
            <span className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-wine text-ivory-50 shadow-lift">
                <Navigation size={18} />
              </span>
            </span>
            <div className="absolute bottom-3 left-3 rounded-xs bg-ivory-50/90 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur">
              {brand.address.city} - {brand.address.state}
            </div>
          </div>
        </div>

        <ContactForm />
      </section>
    </>
  );
}
