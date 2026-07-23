"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import clsx from "clsx";
import {
  orders,
  statusStyles,
  type OrderStatus,
} from "@/lib/admin-data";
import { formatBRL } from "@/lib/format";
import { PageTitle, Card, StatusBadge } from "@/components/admin/AdminUI";

const tabs: (OrderStatus | "Todos")[] = [
  "Todos",
  "Pendente",
  "Pago",
  "Enviado",
  "Entregue",
  "Cancelado",
];

export default function OrdersPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Todos");
  const [query, setQuery] = useState("");

  const filtered = orders.filter(
    (o) =>
      (tab === "Todos" || o.status === tab) &&
      (o.customer.toLowerCase().includes(query.toLowerCase()) ||
        o.id.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <>
      <PageTitle
        title="Pedidos"
        subtitle={`${orders.length} pedidos no total`}
      />

      <Card className="!p-0">
        <div className="flex flex-col gap-3 border-b border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition",
                  tab === t
                    ? "bg-ink text-ivory"
                    : "text-ink-600 hover:bg-ink/5",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5">
              <Search size={15} className="text-ink-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pedido…"
                className="w-36 bg-transparent text-sm focus:outline-none"
              />
            </div>
            <button className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink-600 hover:bg-ink/5">
              <Filter size={15} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide3 text-ink-500">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Itens</th>
                <th className="px-4 py-3 font-medium">Pgto</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-ivory-50">
                  <td className="px-4 py-3 font-semibold text-ink">{o.id}</td>
                  <td className="px-4 py-3 text-ink-700">{o.customer}</td>
                  <td className="px-4 py-3 text-ink-500">{o.city}</td>
                  <td className="px-4 py-3 text-ink-500">{o.date}</td>
                  <td className="px-4 py-3 text-ink-700">{o.items}</td>
                  <td className="px-4 py-3 text-ink-700">{o.payment}</td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {formatBRL(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={o.status}
                      className={statusStyles[o.status]}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-ink-400 hover:text-ink">
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-ink-500">
              Nenhum pedido encontrado.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
