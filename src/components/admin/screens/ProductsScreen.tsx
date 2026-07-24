"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Copy,
  Download,
  ExternalLink,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { csvNumber, downloadCsv } from "@/lib/admin/export";
import { PRODUCT_STATUS } from "@/lib/admin/labels";
import { stockRows } from "@/lib/admin/metrics";
import { useAdmin } from "@/lib/admin/store";
import type { AdminProduct, ProductStatus } from "@/lib/admin/types";
import {
  ActiveFilters,
  Badge,
  Button,
  ButtonLink,
  Card,
  Dropdown,
  EmptyState,
  FilterBar,
  IconButton,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  StatusBadge,
  Table,
  TableMessage,
  TableWrap,
  TBody,
  Tabs,
  Td,
  TdLink,
  Th,
  THead,
  Tr,
  matchesQuery,
  useConfirm,
  usePagination,
  useSort,
  useToast,
} from "@/components/admin/ui";

/**
 * Catálogo.
 *
 * A coluna de estoque mostra disponível (saldo − reservado), não o
 * saldo bruto: é o número que decide se dá para vender. Quando ele
 * cruza o mínimo, o valor muda de cor e ganha rótulo — a lista
 * avisa antes de faltar.
 */

type StatusFilter = ProductStatus | "todos";
type SortKey = "name" | "price" | "stock" | "category";

export function ProductsScreen() {
  const { products, categories, orders, dispatch } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [category, setCategory] = useState("todas");
  const { sort, toggle } = useSort<SortKey>({ key: "name", direction: "asc" });

  const stockByProduct = useMemo(() => {
    const rows = stockRows(products, orders);
    return new Map(rows.map((row) => [row.product.id, row]));
  }, [products, orders]);

  const categoryName = useMemo(
    () => new Map(categories.map((item) => [item.slug, item.name])),
    [categories],
  );

  const scoped = useMemo(
    () =>
      products.filter((product) => {
        if (category !== "todas" && product.categorySlug !== category)
          return false;
        return matchesQuery(
          query,
          product.name,
          product.brand,
          product.sku,
          product.barcode,
          categoryName.get(product.categorySlug),
        );
      }),
    [products, query, category, categoryName],
  );

  const counts = useMemo(() => {
    const map = new Map<StatusFilter, number>([["todos", scoped.length]]);
    for (const product of scoped)
      map.set(product.status, (map.get(product.status) ?? 0) + 1);
    return map;
  }, [scoped]);

  const filtered = useMemo(() => {
    const list =
      status === "todos"
        ? scoped
        : scoped.filter((product) => product.status === status);
    const direction = sort.direction === "asc" ? 1 : -1;

    return [...list].sort((a, b) => {
      switch (sort.key) {
        case "price":
          return (a.price - b.price) * direction;
        case "stock":
          return (
            ((stockByProduct.get(a.id)?.available ?? 0) -
              (stockByProduct.get(b.id)?.available ?? 0)) *
            direction
          );
        case "category":
          return (
            (categoryName.get(a.categorySlug) ?? "").localeCompare(
              categoryName.get(b.categorySlug) ?? "",
            ) * direction
          );
        default:
          return a.name.localeCompare(b.name) * direction;
      }
    });
  }, [scoped, status, sort, stockByProduct, categoryName]);

  const page = usePagination(filtered, 12);

  const duplicate = (product: AdminProduct) => {
    const copy: AdminProduct = {
      ...product,
      id: `${product.id}-copia-${Date.now()}`,
      slug: `${product.slug}-copia`,
      name: `${product.name} (cópia)`,
      sku: `${product.sku}-C`,
      status: "rascunho",
      stock: 0,
      rating: 0,
      reviewCount: 0,
      bestSeller: false,
      featured: false,
      isNew: false,
    };
    dispatch({ type: "product/save", product: copy });
    toast.success("Produto duplicado como rascunho", {
      description: copy.name,
    });
  };

  const toggleStatus = (product: AdminProduct) => {
    const next: ProductStatus =
      product.status === "ativo" ? "arquivado" : "ativo";
    dispatch({ type: "product/save", product: { ...product, status: next } });
    toast.success(
      next === "ativo" ? "Produto publicado na loja" : "Produto arquivado",
      { description: product.name },
    );
  };

  const remove = async (product: AdminProduct) => {
    const ok = await confirm({
      title: `Excluir “${product.name}”?`,
      description:
        "O produto sai do catálogo e do painel. Pedidos já feitos mantêm o histórico. Prefira arquivar se quiser apenas tirá-lo da vitrine.",
      confirmLabel: "Excluir produto",
    });
    if (!ok) return;
    dispatch({ type: "product/delete", productId: product.id });
    toast.success("Produto excluído");
  };

  const exportCsv = () => {
    downloadCsv(
      "produtos",
      ["SKU", "Produto", "Marca", "Categoria", "Status", "Preço", "Custo", "Estoque", "Reservado", "Mínimo"],
      filtered.map((product) => {
        const row = stockByProduct.get(product.id);
        return [
          product.sku,
          product.name,
          product.brand,
          categoryName.get(product.categorySlug),
          PRODUCT_STATUS[product.status].label,
          csvNumber(product.price),
          csvNumber(product.cost),
          row?.onHand ?? product.stock,
          row?.reserved ?? 0,
          product.stockMin,
        ];
      }),
    );
    toast.success("Exportação concluída");
  };

  const activeFilters = [
    status !== "todos" && {
      label: "Status",
      value: PRODUCT_STATUS[status].label,
      onRemove: () => setStatus("todos"),
    },
    category !== "todas" && {
      label: "Categoria",
      value: categoryName.get(category) ?? category,
      onRemove: () => setCategory("todas"),
    },
    query.trim() && {
      label: "Busca",
      value: query,
      onRemove: () => setQuery(""),
    },
  ].filter(Boolean) as { label: string; value: string; onRemove: () => void }[];

  return (
    <>
      <PageHeader
        title="Produtos"
        description={`${products.length} produtos no catálogo · ${counts.get("ativo") ?? 0} publicados na loja`}
        actions={
          <>
            <Button icon={Download} onClick={exportCsv} disabled={!filtered.length}>
              Exportar
            </Button>
            <ButtonLink
              href="/admin/produtos/novo"
              variant="primary"
              icon={Plus}
            >
              Novo produto
            </ButtonLink>
          </>
        }
      />

      <Card className="overflow-hidden">
        <FilterBar>
          <SearchInput
            value={query}
            onChange={setQuery}
            shortcut="/"
            placeholder="Nome, marca, SKU ou código de barras…"
            containerClassName="min-w-[13rem] sm:max-w-md"
          />
          <Select
            aria-label="Filtrar por categoria"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            containerClassName="w-auto min-w-[11rem]"
            options={[
              { value: "todas", label: "Todas as categorias" },
              ...categories.map((item) => ({
                value: item.slug,
                label: item.name,
              })),
            ]}
          />
        </FilterBar>

        <div className="border-b border-adm-line px-2 py-2">
          <Tabs
            ariaLabel="Filtrar por status"
            variant="pill"
            value={status}
            onChange={setStatus}
            items={[
              { value: "todos" as StatusFilter, label: "Todos" },
              { value: "ativo" as StatusFilter, label: "Ativos" },
              { value: "rascunho" as StatusFilter, label: "Rascunhos" },
              { value: "arquivado" as StatusFilter, label: "Arquivados" },
            ].map((tab) => ({
              ...tab,
              count: counts.get(tab.value) ?? 0,
            }))}
          />
        </div>

        {activeFilters.length > 0 && (
          <ActiveFilters
            filters={activeFilters}
            onClearAll={() => {
              setStatus("todos");
              setCategory("todas");
              setQuery("");
            }}
          />
        )}

        <TableWrap>
          <Table minWidth="58rem">
            <THead>
              <tr>
                <Th
                  sortKey="name"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Produto
                </Th>
                <Th
                  width="10rem"
                  sortKey="category"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Categoria
                </Th>
                <Th width="9rem">SKU</Th>
                <Th
                  align="right"
                  width="8rem"
                  sortKey="stock"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Estoque
                </Th>
                <Th
                  align="right"
                  width="8rem"
                  sortKey="price"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Preço
                </Th>
                <Th width="7rem">Status</Th>
                <Th width="3rem">
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </THead>

            <TBody>
              {page.items.length === 0 ? (
                <TableMessage colSpan={7}>
                  <EmptyState
                    icon={Search}
                    title="Nenhum produto encontrado"
                    description="Ajuste os filtros ou cadastre um novo produto para começar."
                    action={
                      <ButtonLink href="/admin/produtos/novo" icon={Plus}>
                        Novo produto
                      </ButtonLink>
                    }
                  />
                </TableMessage>
              ) : (
                page.items.map((product) => {
                  const row = stockByProduct.get(product.id);
                  const available = row?.available ?? product.stock;
                  const low = available <= product.stockMin;

                  return (
                    <Tr key={product.id} href={`/admin/produtos/${product.id}`}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-adm border border-adm-line bg-adm-raised">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt=""
                                width={32}
                                height={32}
                                className="h-8 w-8 object-contain"
                              />
                            ) : (
                              <Package size={14} className="text-adm-ink-3" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <a
                              href={`/admin/produtos/${product.id}`}
                              onClick={(event) => event.stopPropagation()}
                              className="block max-w-[16rem] truncate text-[13px] font-medium text-adm-ink hover:text-adm-accent"
                            >
                              {product.name}
                            </a>
                            <span className="block text-micro text-adm-ink-3">
                              {product.brand} · {product.sizeMl}ml
                            </span>
                          </span>
                        </div>
                      </Td>

                      <Td>
                        <Badge size="sm">
                          {categoryName.get(product.categorySlug) ?? "—"}
                        </Badge>
                      </Td>

                      <Td muted className="text-micro tabular-nums">
                        {product.sku}
                      </Td>

                      <Td numeric>
                        <span
                          className={
                            low
                              ? "font-medium text-adm-warn"
                              : "font-medium text-adm-ink"
                          }
                        >
                          {available}
                        </span>
                        <span className="block text-micro text-adm-ink-3">
                          {row && row.reserved > 0
                            ? `${row.reserved} reservad${row.reserved > 1 ? "as" : "a"}`
                            : `mín. ${product.stockMin}`}
                        </span>
                      </Td>

                      <Td numeric strong>
                        {formatBRL(product.price)}
                        {product.compareAtPrice && (
                          <span className="block text-micro font-normal text-adm-ink-3 line-through">
                            {formatBRL(product.compareAtPrice)}
                          </span>
                        )}
                      </Td>

                      <Td>
                        <StatusBadge
                          size="sm"
                          status={PRODUCT_STATUS[product.status]}
                        />
                      </Td>

                      <Td>
                        <Dropdown
                          label={`Ações de ${product.name}`}
                          items={[
                            {
                              label: "Editar",
                              href: `/admin/produtos/${product.id}`,
                              icon: Pencil,
                            },
                            {
                              label: "Ver na loja",
                              href: `/produto/${product.slug}`,
                              icon: ExternalLink,
                              disabled: product.status !== "ativo",
                            },
                            {
                              label: "Duplicar",
                              icon: Copy,
                              onSelect: () => duplicate(product),
                            },
                            {
                              label:
                                product.status === "ativo"
                                  ? "Arquivar"
                                  : "Publicar na loja",
                              icon: Package,
                              separated: true,
                              onSelect: () => toggleStatus(product),
                            },
                            {
                              label: "Excluir",
                              icon: Trash2,
                              tone: "danger",
                              onSelect: () => remove(product),
                            },
                          ]}
                          trigger={({ open, toggle: toggleMenu }) => (
                            <IconButton
                              icon={MoreHorizontal}
                              label={`Ações de ${product.name}`}
                              size="sm"
                              aria-expanded={open}
                              onClick={toggleMenu}
                            />
                          )}
                        />
                      </Td>
                    </Tr>
                  );
                })
              )}
            </TBody>
          </Table>
        </TableWrap>

        <div className="border-t border-adm-line">
          <Pagination
            page={page.page}
            pageCount={page.pageCount}
            from={page.from}
            to={page.to}
            total={page.total}
            onChange={page.setPage}
            unit="produtos"
          />
        </div>
      </Card>
    </>
  );
}
