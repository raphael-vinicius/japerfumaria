import { Plus, Pencil, Package } from "lucide-react";
import { products } from "@/lib/products";
import { getCategory } from "@/lib/categories";
import { formatBRL } from "@/lib/format";
import Image from "next/image";
import { PageTitle, Card, StatusBadge } from "@/components/admin/AdminUI";
import { ProductBottle } from "@/components/product/ProductBottle";

function stockBadge(stock: number) {
  if (stock === 0)
    return { label: "Esgotado", className: "bg-wine/10 text-wine" };
  if (stock <= 8)
    return { label: "Estoque baixo", className: "bg-champagne-soft text-champagne-deep" };
  return { label: "Em estoque", className: "bg-mint-soft text-mint-dark" };
}

export default function AdminProductsPage() {
  const lowStock = products.filter((p) => p.stock <= 8).length;

  return (
    <>
      <PageTitle
        title="Produtos"
        subtitle={`${products.length} produtos · ${lowStock} com estoque baixo`}
        action={
          <button className="btn-primary text-sm">
            <Plus size={15} /> Adicionar produto
          </button>
        }
      />

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide3 text-ink-500">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {products.map((p) => {
                const badge = stockBadge(p.stock);
                return (
                  <tr key={p.id} className="hover:bg-ivory-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-10 shrink-0 place-items-center rounded-xs border border-ink/10 bg-ivory-50">
                          <span className="relative h-9 w-8">
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-contain"
                              />
                            ) : (
                              <ProductBottle
                                accent={p.accent}
                                accent2={p.accent2}
                                shape={p.bottle}
                                backdrop={false}
                                monogram={p.brand.slice(0, 2).toUpperCase()}
                              />
                            )}
                          </span>
                        </span>
                        <div>
                          <p className="font-medium text-ink">{p.name}</p>
                          <p className="text-xs text-ink-500">
                            {p.brand} · {p.sizeMl}ml
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {getCategory(p.categorySlug)?.name}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {formatBRL(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-ink-700">
                        <Package size={14} className="text-ink-400" />
                        {p.stock} un.
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={badge.label}
                        className={badge.className}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-ink-400 hover:text-ink">
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
