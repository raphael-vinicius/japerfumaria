"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Mail,
  MessageCircle,
  ArrowRight,
  Truck,
} from "lucide-react";
import { brand, waLink } from "@/lib/brand";
import { formatBRL } from "@/lib/format";

interface Order {
  number: string;
  date: string;
  total: number;
  payment: "pix" | "cartao";
  shippingMethod: string;
  email: string;
  nome: string;
  items: { name: string; qty: number }[];
}

export default function SuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ja-last-order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const timeline = [
    { icon: CheckCircle2, label: "Pedido confirmado", done: true },
    { icon: Package, label: "Em separação", done: false },
    { icon: Truck, label: "A caminho", done: false },
    { icon: CheckCircle2, label: "Entregue", done: false },
  ];

  return (
    <div className="container-wrap py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sage/10 animate-fade-up">
          <CheckCircle2 size={40} className="text-sage" />
        </div>
        <p className="eyebrow mt-6">Compra realizada</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Obrigado{order ? `, ${order.nome}` : ""}! 🎉
        </h1>
        <p className="mt-4 text-base text-ink-600">
          Seu pedido foi recebido com sucesso. Enviamos a confirmação
          {order ? (
            <>
              {" "}
              para <strong className="text-ink">{order.email}</strong>
            </>
          ) : (
            " para o seu e-mail"
          )}
          .
        </p>

        {order && (
          <div className="mx-auto mt-8 max-w-md rounded-xs border border-ink/10 bg-ivory-50 p-6 text-left shadow-card">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div>
                <p className="text-xs text-ink-500">Número do pedido</p>
                <p className="font-display text-xl font-semibold text-ink">
                  {order.number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-500">Total</p>
                <p className="font-display text-xl font-semibold text-ink">
                  {formatBRL(order.total)}
                </p>
              </div>
            </div>
            <ul className="mt-4 grid gap-2">
              {order.items.map((i, idx) => (
                <li
                  key={idx}
                  className="flex justify-between text-sm text-ink-700"
                >
                  <span>
                    {i.qty}× {i.name}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 rounded-xs bg-ivory-100 p-3 text-xs text-ink-600">
              <Mail size={14} className="text-champagne-dark" />
              {order.payment === "pix"
                ? "Assim que o Pix for confirmado, iniciamos a separação."
                : "Pagamento aprovado. Já vamos separar seu pedido."}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="mx-auto mt-10 flex max-w-md items-center justify-between">
          {timeline.map((t, i) => (
            <div key={t.label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <span
                    className={`h-px flex-1 ${t.done ? "bg-sage" : "bg-ink/15"}`}
                  />
                )}
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    t.done
                      ? "bg-sage text-ivory-50"
                      : "border border-ink/15 text-ink-400"
                  }`}
                >
                  <t.icon size={16} />
                </span>
                {i < timeline.length - 1 && (
                  <span className="h-px flex-1 bg-ink/15" />
                )}
              </div>
              <span className="mt-2 text-[10px] font-medium text-ink-600">
                {t.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">
            Voltar à loja <ArrowRight size={16} />
          </Link>
          <a
            href={waLink(
              `Olá! Acabei de fazer o pedido ${order?.number ?? ""} no site e gostaria de acompanhar.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <MessageCircle size={16} /> Acompanhar no WhatsApp
          </a>
        </div>

        <p className="mt-8 text-xs text-ink-400">
          Protótipo demonstrativo — nenhuma cobrança foi realizada.
        </p>
      </div>
    </div>
  );
}
