import Link from "next/link";
import {
  Instagram,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Lock,
  CreditCard,
  BadgeCheck,
} from "lucide-react";
import { brand, waLink } from "@/lib/brand";
import { categories } from "@/lib/categories";
import { Logo } from "@/components/ui/Logo";

const institutional = [
  { href: "/institucional/quem-somos", label: "Quem somos" },
  { href: "/institucional/contato", label: "Contato" },
  { href: "/institucional/faq", label: "Perguntas frequentes" },
  { href: "/institucional/trocas", label: "Política de trocas" },
  { href: "/institucional/privacidade", label: "Política de privacidade" },
];

const trustSeals = [
  { icon: ShieldCheck, label: "Compra 100% segura" },
  { icon: BadgeCheck, label: "Produtos originais" },
  { icon: Lock, label: "Dados protegidos (SSL)" },
  { icon: CreditCard, label: "Pix e cartão em 10x" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ivory">
      {/* Selos */}
      <div className="border-b border-ink/10">
        <div className="container-wrap grid grid-cols-2 gap-4 py-8 sm:grid-cols-4">
          {trustSeals.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <s.icon size={22} className="shrink-0 text-champagne-dark" />
              <span className="text-xs font-medium text-ink-700">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="container-wrap grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-600">
            {brand.descriptionShort} Atendimento consultivo e curadoria de
            fragrâncias que marcam presença.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={brand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink-700 transition duration-300 hover:border-ink hover:bg-ink hover:text-ivory"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href={waLink("Olá! Vim pelo site da JA Store.")}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink-700 transition duration-300 hover:border-ink hover:bg-ink hover:text-ivory"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-2xs font-semibold uppercase tracking-luxe text-ink-500">
            Comprar
          </h3>
          <ul className="mt-4 grid gap-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categoria/${c.slug}`}
                  className="text-sm text-ink-700 hover:text-ink"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-2xs font-semibold uppercase tracking-luxe text-ink-500">
            Institucional
          </h3>
          <ul className="mt-4 grid gap-2.5">
            {institutional.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  className="text-sm text-ink-700 hover:text-ink"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-2xs font-semibold uppercase tracking-luxe text-ink-500">
            Atendimento
          </h3>
          <ul className="mt-4 grid gap-3 text-sm text-ink-700">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-champagne-dark" />
              <span>{brand.address.full}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MessageCircle
                size={16}
                className="mt-0.5 shrink-0 text-champagne-dark"
              />
              <a href={waLink("Olá!")} className="hover:text-ink">
                {brand.phoneDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock size={16} className="mt-0.5 shrink-0 text-champagne-dark" />
              <span>
                {brand.hours.map((h) => (
                  <span key={h.day} className="block">
                    {h.day}: {h.time}
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="container-wrap flex flex-col items-center justify-between gap-3 py-6 text-xs text-ink-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.name} · CNPJ 00.000.000/0001-00
            · Todos os direitos reservados.
          </p>
          <p className="text-center sm:text-right">
            Protótipo demonstrativo — sem transações reais.
          </p>
        </div>
      </div>
    </footer>
  );
}
