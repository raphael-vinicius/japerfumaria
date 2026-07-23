import { Mail, Plus } from "lucide-react";
import { customers } from "@/lib/admin-data";
import { formatBRL } from "@/lib/format";
import { PageTitle, Card, StatusBadge } from "@/components/admin/AdminUI";

const tierStyles: Record<string, string> = {
  Novo: "bg-ink/5 text-ink-700",
  Recorrente: "bg-violet-100 text-violet-800",
  VIP: "bg-champagne-soft/60 text-champagne-dark",
};

export default function CustomersPage() {
  return (
    <>
      <PageTitle
        title="Clientes"
        subtitle={`${customers.length} clientes cadastrados`}
        action={
          <button className="btn-primary text-sm">
            <Plus size={15} /> Novo cliente
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-ink-500">Base total</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            1.284
          </p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Recompra (LTV)</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            R$ 1.870
          </p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Taxa de recorrência</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            43%
          </p>
        </Card>
      </div>

      <Card className="mt-6 !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide3 text-ink-500">
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Pedidos</th>
                <th className="px-4 py-3 font-medium">Total gasto</th>
                <th className="px-4 py-3 font-medium">Desde</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {customers.map((c) => (
                <tr key={c.email} className="hover:bg-ivory-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-semibold text-ivory">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div>
                        <p className="font-medium text-ink">{c.name}</p>
                        <p className="text-xs text-ink-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{c.city}</td>
                  <td className="px-4 py-3 text-ink-700">{c.orders}</td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {formatBRL(c.spent)}
                  </td>
                  <td className="px-4 py-3 text-ink-500">{c.since}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={c.tier} className={tierStyles[c.tier]} />
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-ink-400 hover:text-ink">
                      <Mail size={16} />
                    </button>
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
