"use client";

import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/brand";

export function FloatingWhatsApp() {
  return (
    <a
      href={waLink(
        "Olá! Vim pelo site da JA Store Perfumaria e gostaria de tirar uma dúvida.",
      )}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-0 overflow-hidden rounded-full bg-[#25D366] py-3.5 pl-4 pr-4 text-ivory-50 shadow-lift transition-all duration-300 hover:pr-5"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={22} className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:ml-2 group-hover:max-w-[140px]">
        Fale conosco
      </span>
    </a>
  );
}
