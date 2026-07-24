"use client";

import { useMemo, useState } from "react";
import { Download, Search, Users } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { formatDate, formatRelative } from "@/lib/admin/datetime";
import { csvNumber, downloadCsv } from "@/lib/admin/export";
import { CUSTOMER_TAG } from "@/lib/admin/labels";
import { customerRows } from "@/lib/admin/metrics";
import { useAdmin } from "@/lib/admin/store";
import {
  ActiveFilters,
  Badge,
  Button,
  Card,
  EmptyState,
  FilterBar,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  StatsCard,
  Table,
  TableMessage,
  TableWrap,
  TBody,
  Td,
  TdLink,
  Th,
  THead,
  Tr,
  matchesQuery,
  usePagination,
  useSort,
  useToast,
} from "@/components/admin/ui";

/**
 * Clientes.
 *
 * Ordenado por valor gasto na abertura: numa base pequena, saber
 * quem sustenta o faturamento vale mais que a ordem alfabética.
 * Todas as métricas são calculadas a partir dos pedidos, então
 * nunca ficam defasadas em relação à tela de Pedidos.
 */

type SortKey = "name" | "orders" | "spent" | "last" | "city";

export function CustomersScreen() {
  const { customers, orders, products } = useAdmin();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("todos");
  const { sort, toggle } = useSort<SortKey>({
    key: "spent",
    direction: "desc",
  });

  const rows = useMemo(
    () => customerRows(customers, orders, products),
    [customers, orders, products],
  );

  const filtered = useMemo(() => {
    const list = rows.filter((row) => {
      if (tag !== "todos" && !row.customer.tags.includes(tag as never))
        return false;
      const address = row.customer.addresses[0];
      return matchesQuery(
        query,
        row.customer.name,
        row.customer.email,
        row.customer.phone,
        row.customer.cpf,
        address?.city,
      );
    });

    const direction = sort.direction === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sort.key) {
        case "name":
          return a.customer.name.localeCompare(b.customer.name) * direction;
        case "orders":
          return (a.stats.orderCount - b.stats.orderCount) * direction;
        case "city":
          return (
            (a.customer.addresses[0]?.city ?? "").localeCompare(
              b.customer.addresses[0]?.city ?? "",
            ) * direction
          );
        case "last":
          return (
            (a.stats.lastOrderAt ?? "").localeCompare(
              b.stats.lastOrderAt ?? "",
            ) * direction
          );
        default:
          return (a.stats.totalSpent - b.stats.totalSpent) * direction;
      }
    });
  }, [rows, query, tag, sort]);

  const page = usePagination(filtered, 12);

  const summary = useMemo(() => {
    const withOrders = rows.filter((row) => row.stats.orderCount > 0);
    const total = withOrders.reduce((sum, row) => sum + row.stats.totalSpent, 0);
    const repeat = withOrders.filter((row) => row.stats.orderCount > 1).length;
    return {
      total,
      average: withOrders.length ? total / withOrders.length : 0,
      repeatRate: withOrders.length
        ? (repeat / withOrders.length) * 100
        : 0,
      active: withOrders.length,
    };
  }, [rows]);

  const exportCsv = () => {
    downloadCsv(
      "clientes",
      [
        "Nome",
        "E-mail",
        "Telefone",
        "Cidade",
        "Cliente desde",
        "Pedidos",
        "Total gasto",
        "Ticket médio",
        "Última compra",
      ],
      filtered.map((row) => [
        row.customer.name,
        row.customer.email,
        row.customer.phone,
        `${row.customer.addresses[0]?.city ?? ""} - ${row.customer.addresses[0]?.state ?? ""}`,
        formatDate(row.customer.createdAt),
        row.stats.orderCount,
        csvNumber(row.stats.totalSpent),
        csvNumber(row.stats.averageTicket),
        row.stats.lastOrderAt ? formatDate(row.stats.lastOrderAt) : "—",
      ]),
    );
    toast.success("Exportação concluída");
  };

  const activeFilters = [
    tag !== "todos" && {
      label: "Perfil",
      value: CUSTOMER_TAG[tag as keyof typeof CUSTOMER_TAG].label,
      onRemove: () => setTag("todos"),
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
        title="Clientes"
        description={`${customers.length} cadastros · ${summary.active} já compraram`}
        actions={
          <Button icon={Download} onClick={exportCsv} disabled={!filtered.length}>
            Exportar
          </Button>
        }
      />

      <div className="mb-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Clientes ativos"
          value={String(summary.active)}
          hint="Com ao menos um pedido válido"
        />
        <StatsCard
          label="Receita por cliente"
          value={formatBRL(summary.average)}
          hint="Média histórica"
        />
        <StatsCard
          label="Taxa de recompra"
          value={`${summary.repeatRate.toFixed(0)}%`}
          hint="Compraram mais de uma vez"
        />
        <StatsCard
          label="Base total"
          value={formatBRL(summary.total)}
          hint="Somatório de todas as compras"
        />
      </div>

      <Card className="overflow-hidden">
        <FilterBar>
          <SearchInput
            value={query}
            onChange={setQuery}
            shortcut="/"
            placeholder="Nome, e-mail, telefone ou cidade…"
            containerClassName="min-w-[13rem] sm:max-w-md"
          />
          <Select
            aria-label="Filtrar por perfil"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            containerClassName="w-auto min-w-[10rem]"
            options={[
              { value: "todos", label: "Todos os perfis" },
              { value: "vip", label: "VIP" },
              { value: "recorrente", label: "Recorrentes" },
              { value: "novo", label: "Novos" },
              { value: "atacado", label: "Atacado" },
            ]}
          />
        </FilterBar>

        {activeFilters.length > 0 && (
          <ActiveFilters
            filters={activeFilters}
            onClearAll={() => {
              setTag("todos");
              setQuery("");
            }}
          />
        )}

        <TableWrap>
          <Table minWidth="56rem">
            <THead>
              <tr>
                <Th
                  sortKey="name"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Cliente
                </Th>
                <Th
                  width="11rem"
                  sortKey="city"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Cidade
                </Th>
                <Th width="9.5rem">Telefone</Th>
                <Th
                  width="9rem"
                  sortKey="last"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Última compra
                </Th>
                <Th
                  align="right"
                  width="6rem"
                  sortKey="orders"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Pedidos
                </Th>
                <Th
                  align="right"
                  width="8rem"
                  sortKey="spent"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Total gasto
                </Th>
              </tr>
            </THead>

            <TBody>
              {page.items.length === 0 ? (
                <TableMessage colSpan={6}>
                  <EmptyState
                    icon={query ? Search : Users}
                    title="Nenhum cliente encontrado"
                    description="Ajuste a busca ou o filtro de perfil."
                  />
                </TableMessage>
              ) : (
                page.items.map(({ customer, stats }) => {
                  const address = customer.addresses[0];
                  return (
                    <Tr
                      key={customer.id}
                      href={`/admin/clientes/${customer.id}`}
                    >
                      <TdLink href={`/admin/clientes/${customer.id}`}>
                        <span className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-adm-sunken text-micro font-medium text-adm-ink-2"
                          >
                            {customer.name
                              .split(" ")
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")}
                          </span>
                          <span className="min-w-0">
                            <span className="block max-w-[13rem] truncate">
                              {customer.name}
                            </span>
                            <span className="block truncate text-micro font-normal text-adm-ink-3">
                              {customer.email}
                            </span>
                          </span>
                        </span>
                      </TdLink>

                      <Td>
                        <span className="block">
                          {address ? `${address.city} - ${address.state}` : "—"}
                        </span>
                        {customer.tags[0] && (
                          <Badge
                            size="sm"
                            tone={CUSTOMER_TAG[customer.tags[0]].tone}
                            className="mt-0.5"
                          >
                            {CUSTOMER_TAG[customer.tags[0]].label}
                          </Badge>
                        )}
                      </Td>

                      <Td muted className="tabular-nums">
                        {customer.phone}
                      </Td>

                      <Td>
                        {stats.lastOrderAt ? (
                          <>
                            <span className="block text-adm-ink-2">
                              {formatDate(stats.lastOrderAt)}
                            </span>
                            <span className="block text-micro text-adm-ink-3">
                              {formatRelative(stats.lastOrderAt)}
                            </span>
                          </>
                        ) : (
                          <span className="text-adm-ink-3">Sem compras</span>
                        )}
                      </Td>

                      <Td numeric>{stats.orderCount}</Td>

                      <Td numeric strong>
                        {formatBRL(stats.totalSpent)}
                        {stats.orderCount > 0 && (
                          <span className="block text-micro font-normal text-adm-ink-3">
                            média {formatBRL(stats.averageTicket)}
                          </span>
                        )}
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
            unit="clientes"
          />
        </div>
      </Card>
    </>
  );
}
