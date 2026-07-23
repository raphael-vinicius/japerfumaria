import { Plus, Ticket } from "lucide-react";
import { adminCoupons } from "@/lib/admin-data";
import { PageTitle, Card, StatusBadge } from "@/components/admin/AdminUI";

const statusStyles: Record<string, string> = {
  Ativo: "bg-mint-soft text-mint-dark",
  Pausado: "bg-champagne-soft text-champagne-deep",
  Expirado: "bg-wine/10 text-wine",
};

export default function AdminCouponsPage() {
  return (
    <>
      <PageTitle
        title="Cupons"
        subtitle="Gerencie descontos e campanhas"
        action={
          <button className="btn-primary text-sm">
            <Plus size={15} /> Criar cupom
          </button>
        }
      />

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide3 text-ink-500">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Usos</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {adminCoupons.map((c) => (
                <tr key={c.code} className="hover:bg-ivory-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-ink">
                      <Ticket size={15} className="text-champagne-dark" />
                      {c.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{c.type}</td>
                  <td className="px-4 py-3 font-medium text-ink">{c.value}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ivory-200">
                        <div
                          className="h-full rounded-full bg-champagne"
                          style={{ width: `${(c.uses / c.limit) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink-500">
                        {c.uses}/{c.limit}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={c.status}
                      className={statusStyles[c.status]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
