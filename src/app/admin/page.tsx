import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import {
  kpis,
  revenueSeries,
  channelSplit,
  orders,
  statusStyles,
} from "@/lib/admin-data";
import { bestSellers } from "@/lib/products";
import { formatBRL } from "@/lib/format";
import {
  PageTitle,
  Card,
  StatCard,
  BarChart,
  DonutChart,
  StatusBadge,
} from "@/components/admin/AdminUI";

export default function AdminDashboard() {
  const top = bestSellers().slice(0, 5);

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="Visão geral da loja — julho de 2026"
        action={
          <button className="btn-outline text-sm">
            <Download size={15} /> Exportar
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-ink">
                Faturamento mensal
              </h2>
              <p className="text-xs text-ink-500">em milhares de reais (R$)</p>
            </div>
            <span className="rounded-full bg-mint-soft/60 px-3 py-1 text-xs font-semibold text-mint-dark">
              +18,4% no ano
            </span>
          </div>
          <BarChart data={revenueSeries} />
        </Card>

        <Card>
          <h2 className="mb-5 font-display text-lg text-ink">
            Vendas por canal
          </h2>
          <DonutChart data={channelSplit} />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Pedidos recentes</h2>
            <Link
              href="/admin/pedidos"
              className="inline-flex items-center gap-1 text-sm font-medium text-champagne-dark hover:underline"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide3 text-ink-500">
                  <th className="pb-3 font-medium">Pedido</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.06]">
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-medium text-ink">{o.id}</td>
                    <td className="py-3 text-ink-700">{o.customer}</td>
                    <td className="py-3 font-medium text-ink">
                      {formatBRL(o.total)}
                    </td>
                    <td className="py-3">
                      <StatusBadge
                        label={o.status}
                        className={statusStyles[o.status]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg text-ink">
            Produtos mais vendidos
          </h2>
          <ul className="grid gap-3">
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ivory-100 text-xs font-semibold text-ink-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {p.name}
                  </p>
                  <p className="text-xs text-ink-500">{p.brand}</p>
                </div>
                <span className="text-sm font-semibold text-ink">
                  {p.reviewCount}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
