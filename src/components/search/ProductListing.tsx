"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X, Check, ChevronDown } from "lucide-react";
import clsx from "clsx";
import type { Family, Gender, Origin } from "@/lib/types";
import { filterProducts, type Filters, type SortKey } from "@/lib/search";
import { allBrands } from "@/lib/products";
import { categories } from "@/lib/categories";
import { ProductCard } from "@/components/product/ProductCard";

const originOptions: { value: Origin; label: string }[] = [
  { value: "arabe", label: "Árabes" },
  { value: "importado", label: "Importados" },
];

const genderOptions: { value: Gender; label: string }[] = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "unissex", label: "Unissex" },
];

const familyOptions: { value: Family; label: string }[] = [
  { value: "amadeirado", label: "Amadeirado" },
  { value: "ambar", label: "Âmbar" },
  { value: "oriental", label: "Oriental" },
  { value: "floral", label: "Floral" },
  { value: "gourmand", label: "Gourmand" },
  { value: "citrico", label: "Cítrico" },
  { value: "aromatico", label: "Aromático" },
  { value: "fougere", label: "Fougère" },
  { value: "aquatico", label: "Aquático" },
];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "relevancia", label: "Relevância" },
  { value: "mais-vendidos", label: "Mais vendidos" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "melhor-avaliados", label: "Melhor avaliados" },
  { value: "lancamentos", label: "Lançamentos" },
];

interface Props {
  initialQuery?: string;
  fixedCategory?: string;
  initialSort?: SortKey;
}

function toggle<T>(arr: T[] | undefined, value: T): T[] {
  const list = arr ?? [];
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function CheckRow({
  label,
  checked,
  onClick,
  count,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 py-1.5 text-left text-sm text-ink-700 hover:text-ink"
    >
      <span
        className={clsx(
          "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition",
          checked
            ? "border-ink bg-ink text-ivory"
            : "border-ink/25 bg-transparent",
        )}
      >
        {checked && <Check size={12} />}
      </span>
      <span className="flex-1">{label}</span>
      {typeof count === "number" && (
        <span className="text-xs text-ink-400">{count}</span>
      )}
    </button>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-ink/10 py-5">
      <p className="mb-2 text-2xs font-semibold uppercase tracking-luxe text-ink-500">
        {title}
      </p>
      <div className="grid">{children}</div>
    </div>
  );
}

export function ProductListing({
  initialQuery,
  fixedCategory,
  initialSort = "relevancia",
}: Props) {
  const brands = useMemo(() => allBrands(), []);
  const [filters, setFilters] = useState<Filters>({
    query: initialQuery,
    categories: fixedCategory ? [fixedCategory] : [],
    sort: initialSort,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const results = useMemo(() => filterProducts(filters), [filters]);

  const activeCount =
    (filters.origins?.length ?? 0) +
    (filters.genders?.length ?? 0) +
    (filters.families?.length ?? 0) +
    (filters.brands?.length ?? 0) +
    (!fixedCategory ? filters.categories?.length ?? 0 : 0) +
    (filters.onlyPromo ? 1 : 0) +
    (filters.onlyInStock ? 1 : 0);

  const clearAll = () =>
    setFilters((f) => ({
      query: f.query,
      categories: fixedCategory ? [fixedCategory] : [],
      sort: f.sort,
    }));

  const FiltersPanel = (
    <div>
      {!fixedCategory && (
        <FilterGroup title="Categoria">
          {categories.map((c) => (
            <CheckRow
              key={c.slug}
              label={c.name}
              checked={filters.categories?.includes(c.slug) ?? false}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  categories: toggle(f.categories, c.slug),
                }))
              }
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Origem">
        {originOptions.map((o) => (
          <CheckRow
            key={o.value}
            label={o.label}
            checked={filters.origins?.includes(o.value) ?? false}
            onClick={() =>
              setFilters((f) => ({ ...f, origins: toggle(f.origins, o.value) }))
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Gênero">
        {genderOptions.map((o) => (
          <CheckRow
            key={o.value}
            label={o.label}
            checked={filters.genders?.includes(o.value) ?? false}
            onClick={() =>
              setFilters((f) => ({ ...f, genders: toggle(f.genders, o.value) }))
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Família olfativa">
        {familyOptions.map((o) => (
          <CheckRow
            key={o.value}
            label={o.label}
            checked={filters.families?.includes(o.value) ?? false}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                families: toggle(f.families, o.value),
              }))
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Marca">
        {brands.map((b) => (
          <CheckRow
            key={b}
            label={b}
            checked={filters.brands?.includes(b) ?? false}
            onClick={() =>
              setFilters((f) => ({ ...f, brands: toggle(f.brands, b) }))
            }
          />
        ))}
      </FilterGroup>

      <div className="py-5">
        <CheckRow
          label="Somente em promoção"
          checked={!!filters.onlyPromo}
          onClick={() =>
            setFilters((f) => ({ ...f, onlyPromo: !f.onlyPromo }))
          }
        />
        <CheckRow
          label="Somente em estoque"
          checked={!!filters.onlyInStock}
          onClick={() =>
            setFilters((f) => ({ ...f, onlyInStock: !f.onlyInStock }))
          }
        />
      </div>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Filtros</h2>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs font-medium text-champagne-dark hover:underline"
              >
                Limpar ({activeCount})
              </button>
            )}
          </div>
          {FiltersPanel}
        </div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-600">
            <strong className="text-ink">{results.length}</strong>{" "}
            {results.length === 1 ? "produto" : "produtos"}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal size={15} /> Filtrar
              {activeCount > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-ivory">
                  {activeCount}
                </span>
              )}
            </button>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    sort: e.target.value as SortKey,
                  }))
                }
                className="appearance-none rounded-full border border-ink/15 bg-ivory-50 py-2 pl-4 pr-9 text-sm font-medium focus:border-ink focus:outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    Ordenar: {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500"
              />
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-xs border border-dashed border-ink/20 py-20 text-center">
            <p className="font-display text-xl text-ink">
              Nenhum produto encontrado
            </p>
            <p className="mt-2 text-sm text-ink-500">
              Tente remover alguns filtros ou refinar a busca.
            </p>
            <button onClick={clearAll} className="btn-outline mt-6">
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Drawer mobile */}
      <div
        className={clsx(
          "fixed inset-0 z-[75] lg:hidden",
          mobileOpen ? "visible" : "invisible",
        )}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={clsx(
            "absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-ivory shadow-lift transition-transform duration-300 ease-luxe",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-xl">Filtros</h2>
            <button
              onClick={() => setMobileOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5"
            >
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5">{FiltersPanel}</div>
          <div className="grid grid-cols-2 gap-3 border-t border-ink/10 p-5">
            <button onClick={clearAll} className="btn-outline">
              Limpar
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="btn-primary"
            >
              Ver {results.length} produtos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
