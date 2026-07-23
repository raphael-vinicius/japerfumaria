import { Plus, Pencil, Eye } from "lucide-react";
import { categories } from "@/lib/categories";
import { byCategory } from "@/lib/products";
import { PageTitle, Card } from "@/components/admin/AdminUI";

export default function AdminCategoriesPage() {
  return (
    <>
      <PageTitle
        title="Categorias"
        subtitle={`${categories.length} categorias ativas`}
        action={
          <button className="btn-primary text-sm">
            <Plus size={15} /> Nova categoria
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Card key={c.slug} className="!p-0 overflow-hidden">
            <div
              className="flex h-28 items-end p-4 text-ivory-50"
              style={{
                background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})`,
              }}
            >
              <span className="font-display text-xl">{c.name}</span>
            </div>
            <div className="p-5">
              <p className="text-sm text-ink-600">{c.tagline}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-ink-500">
                  {byCategory(c.slug).length} produtos
                </span>
                <div className="flex gap-2">
                  <button className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 text-ink-600 hover:bg-ink/5">
                    <Eye size={14} />
                  </button>
                  <button className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 text-ink-600 hover:bg-ink/5">
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
