"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { brand } from "@/lib/brand";
import { PageTitle, Card } from "@/components/admin/AdminUI";
import { Field } from "@/components/ui/Field";

function Toggle({
  label,
  desc,
  defaultOn = false,
}: {
  label: string;
  desc: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={clsx(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          on ? "bg-champagne" : "bg-ink/15",
        )}
        aria-pressed={on}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-ivory-50 shadow transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [store, setStore] = useState<{
    name: string;
    phone: string;
    email: string;
    address: string;
    threshold: string;
  }>({
    name: brand.name,
    phone: brand.phoneDisplay,
    email: brand.email,
    address: brand.address.full,
    threshold: "299",
  });

  return (
    <>
      <PageTitle
        title="Configurações"
        subtitle="Ajustes gerais da loja"
        action={
          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            className="btn-primary text-sm"
          >
            {saved ? (
              <>
                <Check size={15} /> Salvo
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg text-ink">Dados da loja</h2>
          <div className="grid gap-4">
            <Field
              label="Nome da loja"
              value={store.name}
              onChange={(v) => setStore((s) => ({ ...s, name: v }))}
            />
            <Field
              label="Telefone / WhatsApp"
              value={store.phone}
              onChange={(v) => setStore((s) => ({ ...s, phone: v }))}
            />
            <Field
              label="E-mail"
              value={store.email}
              onChange={(v) => setStore((s) => ({ ...s, email: v }))}
            />
            <Field
              label="Endereço"
              value={store.address}
              onChange={(v) => setStore((s) => ({ ...s, address: v }))}
            />
          </div>
        </Card>

        <div className="grid gap-4">
          <Card>
            <h2 className="mb-2 font-display text-lg text-ink">
              Frete e entrega
            </h2>
            <Field
              label="Frete grátis a partir de (R$)"
              value={store.threshold}
              onChange={(v) => setStore((s) => ({ ...s, threshold: v }))}
              inputMode="numeric"
            />
            <div className="mt-2 divide-y divide-ink/[0.06]">
              <Toggle
                label="Entrega local no mesmo dia"
                desc="Para Cabreúva e região, pedidos até 14h"
                defaultOn
              />
              <Toggle
                label="Retirada na loja"
                desc="Cliente pode retirar presencialmente"
                defaultOn
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-2 font-display text-lg text-ink">Pagamentos</h2>
            <div className="divide-y divide-ink/[0.06]">
              <Toggle label="Pix" desc="Com 5% de desconto à vista" defaultOn />
              <Toggle
                label="Cartão de crédito"
                desc="Parcelamento em até 10x sem juros"
                defaultOn
              />
              <Toggle
                label="Cartão de débito"
                desc="Disponível na retirada em loja"
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-2 font-display text-lg text-ink">Notificações</h2>
            <div className="divide-y divide-ink/[0.06]">
              <Toggle
                label="Novos pedidos por WhatsApp"
                desc="Aviso instantâneo a cada venda"
                defaultOn
              />
              <Toggle
                label="Alerta de estoque baixo"
                desc="Quando restarem 8 unidades ou menos"
                defaultOn
              />
              <Toggle label="Resumo diário por e-mail" desc="Todo dia às 20h" />
            </div>
          </Card>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-400">
        Painel demonstrativo — as alterações não são persistidas.
      </p>
    </>
  );
}
