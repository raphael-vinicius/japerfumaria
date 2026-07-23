"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight, Instagram, MessageCircle } from "lucide-react";
import { categories } from "@/lib/categories";
import { brand, waLink } from "@/lib/brand";
import { Logo } from "@/components/ui/Logo";

const institutional = [
  { href: "/institucional/quem-somos", label: "Nossa história" },
  { href: "/institucional/contato", label: "Contato" },
  { href: "/institucional/faq", label: "Perguntas frequentes" },
  { href: "/institucional/trocas", label: "Política de trocas" },
];

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Fecha com Escape enquanto o menu estiver aberto
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[70] lg:hidden ${
        open ? "visible" : "invisible"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-ivory shadow-lift transition-transform duration-400 ease-luxe ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <Logo />
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5"
            aria-label="Fechar menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <p className="eyebrow mb-3">Categorias</p>
          <nav className="grid gap-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                onClick={onClose}
                className="flex items-center justify-between rounded-xs px-3 py-3 text-[15px] font-medium text-ink hover:bg-ivory-50"
              >
                {c.name}
                <ChevronRight size={17} className="text-ink-500" />
              </Link>
            ))}
          </nav>

          <p className="eyebrow mb-3 mt-7">Institucional</p>
          <nav className="grid gap-1">
            {institutional.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={onClose}
                className="rounded-xs px-3 py-2.5 text-sm text-ink-700 hover:bg-ivory-50"
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-ink/10 p-5">
          <a
            href={waLink("Olá! Vim pelo site da JA Store e gostaria de atendimento.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold w-full"
          >
            <MessageCircle size={17} /> Falar no WhatsApp
          </a>
          <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
            <span>{brand.phoneDisplay}</span>
            <a
              href={brand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-ink"
            >
              <Instagram size={14} /> @{brand.instagram}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
