import { Download, TrendingUp } from "lucide-react";
import { revenueSeries, channelSplit } from "@/lib/admin-data";
import { bestSellers } from "@/lib/products";
import {
  PageTitle,
  Card,
  BarChart,
  DonutChart,
} from "@/components/admin/AdminUI";

const familySplit = [
  { label: "Amadeirado", value: 34, color: "#7A4A24" },
  { label: "Gourmand", value: 26, color: "#B08D57" },
  { label: "Âmbar", value: 22, color: "#6E1A2B" },
  { label: "Floral", value: 18, color: "#7A2340" },
];

const weekly = [
  { label: "Seg", value: 6 },
  { label: "Ter", value: 8 },
  { label: "Qua", value: 7 },
  { label: "Qui", value: 11 },
  { label: "Sex", value: 14 },
  { label: "Sáb", value: 17 },
  { label: "Dom", value: 5 },
];

export default function AdminReportsPage() {
  const top = bestSellers().slice(0, 6);

  return (
    <>
      <PageTitle
        title="Relatórios"
        subtitle="Desempenho de vendas e comportamento de compra"
        action={
          <button className="btn-outline text-sm">
            <Download size={15} /> Baixar PDF
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-5 font-display text-lg text-ink">
            Faturamento (mil R$)
          </h2>
          <BarChart data={revenueSeries} />
        </Card>
        <Card>
          <h2 className="mb-5 font-display text-lg text-ink">
            Pedidos por dia da semana
          </h2>
          <BarChart data={weekly} suffix="" />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-5 font-display text-lg text-ink">Vendas por canal</h2>
          <DonutChart data={channelSplit} />
        </Card>
        <Card>
          <h2 className="mb-5 font-display text-lg text-ink">
            Famílias olfativas mais vendidas
          </h2>
          <DonutChart data={familySplit} />
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">
            Ranking de produtos
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-mint-dark">
            <TrendingUp size={13} /> últimos 30 dias
          </span>
        </div>
        <div className="grid gap-3">
          {top.map((p, i) => {
            const pct = 100 - i * 12;
            return (
              <div key={p.id} className="flex items-center gap-4">
                <span className="w-6 text-sm font-semibold text-ink-500">
                  {i + 1}
                </span>
                <span className="w-40 truncate text-sm font-medium text-ink">
                  {p.name}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-champagne-dark to-champagne"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm text-ink-600">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
