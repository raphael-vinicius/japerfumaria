"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download,
  Eye,
  MapPin,
  MoreHorizontal,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { formatDate, formatTime } from "@/lib/admin/datetime";
import { copyToClipboard, csvNumber, downloadCsv } from "@/lib/admin/export";
import {
  CHANNEL,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "@/lib/admin/labels";
import { useAdmin } from "@/lib/admin/store";
import type { Order, OrderStatus } from "@/lib/admin/types";
import {
  ActiveFilters,
  Badge,
  Button,
  Card,
  DateRangePicker,
  Dropdown,
  EmptyState,
  FilterBar,
  IconButton,
  PageHeader,
  Pagination,
  SearchInput,
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
  buildRange,
  matchesQuery,
  useConfirm,
  usePagination,
  useSort,
  useToast,
  type DateRange,
} from "@/components/admin/ui";

/**
 * Fila de pedidos — a tela mais usada do painel.
 *
 * Prioridades de projeto, nesta ordem: (1) achar um pedido em
 * segundos, por número, nome ou rastreio; (2) enxergar o estado de
 * cada um sem abrir; (3) avançar o status sem sair da lista. Por
 * isso os filtros de status carregam contagem, e cada linha tem
 * ações rápidas no menu — abrir o pedido só é necessário quando o
 * caso foge do comum.
 */

type StatusFilter = OrderStatus | "todos";
type SortKey = "number" | "customer" | "total" | "createdAt" | "status";

export function OrdersScreen() {
  const params = useSearchParams();
  const { orders, customers, dispatch } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();

  const initialStatus = (params.get("status") ?? "todos") as StatusFilter;
  const initialPeriod = params.get("periodo") === "hoje" ? "hoje" : "tudo";

  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRange>(() =>
    buildRange(initialPeriod as "hoje" | "tudo"),
  );
  const { sort, toggle } = useSort<SortKey>({
    key: "createdAt",
    direction: "desc",
  });

  const customerById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );

  /** Recorte por período e busca — a contagem das abas respeita ambos. */
  const scoped = useMemo(() => {
    const from = range.from.getTime();
    const to = range.to.getTime();
    return orders.filter((order) => {
      const at = new Date(order.createdAt).getTime();
      if (at < from || at > to) return false;
      if (!query.trim()) return true;
      const customer = customerById.get(order.customerId);
      return matchesQuery(
        query,
        `#${order.number}`,
        String(order.number),
        customer?.name,
        customer?.email,
        customer?.phone,
        order.shipping.trackingCode,
        order.shipping.address.city,
      );
    });
  }, [orders, range, query, customerById]);

  const counts = useMemo(() => {
    const map = new Map<StatusFilter, number>([["todos", scoped.length]]);
    for (const order of scoped)
      map.set(order.status, (map.get(order.status) ?? 0) + 1);
    return map;
  }, [scoped]);

  const filtered = useMemo(() => {
    const list =
      status === "todos"
        ? scoped
        : scoped.filter((order) => order.status === status);

    const direction = sort.direction === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sort.key) {
        case "number":
          return (a.number - b.number) * direction;
        case "customer":
          return (
            (customerById.get(a.customerId)?.name ?? "").localeCompare(
              customerById.get(b.customerId)?.name ?? "",
            ) * direction
          );
        case "total":
          return (a.total - b.total) * direction;
        case "status":
          return a.status.localeCompare(b.status) * direction;
        default:
          return a.createdAt.localeCompare(b.createdAt) * direction;
      }
    });
  }, [scoped, status, sort, customerById]);

  const page = usePagination(filtered, 12);

  const advance = async (order: Order, next: OrderStatus) => {
    if (next === "cancelado") {
      const ok = await confirm({
        title: `Cancelar o pedido #${order.number}?`,
        description:
          "O pagamento será marcado como estornado e as unidades já separadas voltam para o estoque.",
        confirmLabel: "Cancelar pedido",
      });
      if (!ok) return;
    }
    const previous = order.status;
    dispatch({ type: "order/status", orderId: order.id, status: next });
    toast.success(`Pedido #${order.number} · ${ORDER_STATUS[next].label}`, {
      action: {
        label: "Desfazer",
        onClick: () =>
          dispatch({
            type: "order/status",
            orderId: order.id,
            status: previous,
            detail: "Status revertido pelo operador",
          }),
      },
    });
  };

  const exportCsv = () => {
    downloadCsv(
      `pedidos-${new Date().toISOString().slice(0, 10)}`,
      [
        "Pedido",
        "Data",
        "Cliente",
        "Cidade",
        "Canal",
        "Pagamento",
        "Entrega",
        "Status",
        "Subtotal",
        "Desconto",
        "Frete",
        "Total",
      ],
      filtered.map((order) => {
        const customer = customerById.get(order.customerId);
        return [
          `#${order.number}`,
          formatDate(order.createdAt),
          customer?.name,
          `${order.shipping.address.city} - ${order.shipping.address.state}`,
          CHANNEL[order.channel],
          PAYMENT_METHOD[order.payment.method],
          order.shipping.label,
          ORDER_STATUS[order.status].label,
          csvNumber(order.subtotal),
          csvNumber(order.discount),
          csvNumber(order.shipping.fee),
          csvNumber(order.total),
        ];
      }),
    );
    toast.success("Exportação concluída", {
      description: `${filtered.length} pedidos no arquivo.`,
    });
  };

  const activeFilters = [
    status !== "todos" && {
      label: "Status",
      value: ORDER_STATUS[status].label,
      onRemove: () => setStatus("todos"),
    },
    range.preset !== "tudo" && {
      label: "Período",
      value: range.label,
      onRemove: () => setRange(buildRange("tudo")),
    },
    query.trim() && {
      label: "Busca",
      value: query,
      onRemove: () => setQuery(""),
    },
  ].filter(Boolean) as { label: string; value: string; onRemove: () => void }[];

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "aguardando_pagamento", label: "Aguardando pagamento" },
    { value: "pago", label: "Pago" },
    { value: "separando", label: "Separando" },
    { value: "enviado", label: "Enviado" },
    { value: "entregue", label: "Entregue" },
    { value: "cancelado", label: "Cancelado" },
  ];

  return (
    <>
      <PageHeader
        title="Pedidos"
        description={`${orders.length} pedidos no histórico · ${counts.get("pago") ?? 0} aguardando separação`}
        actions={
          <Button icon={Download} onClick={exportCsv} disabled={!filtered.length}>
            Exportar CSV
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <FilterBar>
          <SearchInput
            value={query}
            onChange={setQuery}
            shortcut="/"
            placeholder="Número, cliente, e-mail, rastreio ou cidade…"
            containerClassName="min-w-[13rem] sm:max-w-md"
          />
          <DateRangePicker value={range} onChange={setRange} />
        </FilterBar>

        <div className="border-b border-adm-line px-2 py-2">
          <Tabs
            ariaLabel="Filtrar por status"
            variant="pill"
            value={status}
            onChange={setStatus}
            items={statusTabs.map((tab) => ({
              value: tab.value,
              label: tab.label,
              count: counts.get(tab.value) ?? 0,
            }))}
          />
        </div>

        {activeFilters.length > 0 && (
          <ActiveFilters
            filters={activeFilters}
            onClearAll={() => {
              setStatus("todos");
              setQuery("");
              setRange(buildRange("tudo"));
            }}
          />
        )}

        <TableWrap>
          <Table minWidth="62rem">
            <THead>
              <tr>
                <Th
                  width="6.5rem"
                  sortKey="number"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Número
                </Th>
                <Th
                  sortKey="customer"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Cliente
                </Th>
                <Th width="9rem">Pagamento</Th>
                <Th width="11rem">Entrega</Th>
                <Th
                  width="9.5rem"
                  sortKey="status"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Status
                </Th>
                <Th
                  align="right"
                  width="7rem"
                  sortKey="total"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Valor
                </Th>
                <Th
                  align="right"
                  width="7rem"
                  sortKey="createdAt"
                  activeSort={sort}
                  onSort={(key) => toggle(key as SortKey)}
                >
                  Data
                </Th>
                <Th width="3rem">
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </THead>

            <TBody>
              {page.items.length === 0 ? (
                <TableMessage colSpan={8}>
                  <EmptyState
                    icon={Search}
                    title="Nenhum pedido encontrado"
                    description={
                      activeFilters.length
                        ? "Nenhum pedido corresponde aos filtros aplicados. Ajuste o período ou limpe a busca."
                        : "Assim que a loja receber pedidos, eles aparecem aqui."
                    }
                    action={
                      activeFilters.length > 0 && (
                        <Button
                          onClick={() => {
                            setStatus("todos");
                            setQuery("");
                            setRange(buildRange("tudo"));
                          }}
                        >
                          Limpar filtros
                        </Button>
                      )
                    }
                  />
                </TableMessage>
              ) : (
                page.items.map((order) => {
                  const customer = customerById.get(order.customerId);
                  const payment = PAYMENT_STATUS[order.payment.status];

                  return (
                    <Tr key={order.id} href={`/admin/pedidos/${order.number}`}>
                      <TdLink href={`/admin/pedidos/${order.number}`}>
                        #{order.number}
                      </TdLink>

                      <Td>
                        <span className="block max-w-[14rem] truncate text-adm-ink">
                          {customer?.name ?? "—"}
                        </span>
                        <span className="block text-micro text-adm-ink-3">
                          {order.shipping.address.city} ·{" "}
                          {CHANNEL[order.channel]}
                        </span>
                      </Td>

                      <Td>
                        <span className="block text-adm-ink">
                          {PAYMENT_METHOD[order.payment.method]}
                          {order.payment.installments > 1 &&
                            ` ${order.payment.installments}x`}
                        </span>
                        <span
                          className={
                            order.payment.status === "aprovado"
                              ? "block text-micro text-adm-ink-3"
                              : "block text-micro font-medium text-adm-warn"
                          }
                        >
                          {payment.label}
                        </span>
                      </Td>

                      <Td>
                        <span className="block truncate text-adm-ink">
                          {order.shipping.label}
                        </span>
                        <span className="block truncate text-micro text-adm-ink-3">
                          {order.shipping.trackingCode ??
                            (order.shipping.fee === 0
                              ? "Frete grátis"
                              : formatBRL(order.shipping.fee))}
                        </span>
                      </Td>

                      <Td>
                        <StatusBadge status={ORDER_STATUS[order.status]} />
                      </Td>

                      <Td numeric strong>
                        {formatBRL(order.total)}
                        {order.discount > 0 && (
                          <span className="block text-micro font-normal text-adm-ok">
                            −{formatBRL(order.discount)}
                          </span>
                        )}
                      </Td>

                      <Td numeric>
                        <span className="block text-adm-ink-2">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="block text-micro text-adm-ink-3">
                          {formatTime(order.createdAt)}
                        </span>
                      </Td>

                      <Td>
                        <Dropdown
                          label={`Ações do pedido ${order.number}`}
                          items={[
                            {
                              label: "Abrir pedido",
                              href: `/admin/pedidos/${order.number}`,
                              icon: Eye,
                            },
                            ...(order.status === "pago"
                              ? [
                                  {
                                    label: "Iniciar separação",
                                    icon: PackageCheck,
                                    onSelect: () => advance(order, "separando"),
                                  },
                                ]
                              : []),
                            ...(order.status === "separando"
                              ? [
                                  {
                                    label: "Marcar como enviado",
                                    icon: Truck,
                                    onSelect: () => advance(order, "enviado"),
                                  },
                                ]
                              : []),
                            ...(order.status === "enviado"
                              ? [
                                  {
                                    label: "Marcar como entregue",
                                    icon: PackageCheck,
                                    onSelect: () => advance(order, "entregue"),
                                  },
                                ]
                              : []),
                            {
                              label: "Copiar endereço",
                              icon: MapPin,
                              separated: true,
                              onSelect: async () => {
                                const address = order.shipping.address;
                                const ok = await copyToClipboard(
                                  `${customer?.name}\n${address.street}, ${address.number}${address.complement ? ` — ${address.complement}` : ""}\n${address.district} · ${address.city} - ${address.state}\nCEP ${address.zip}`,
                                );
                                if (ok) toast.success("Endereço copiado");
                                else toast.error("Não foi possível copiar");
                              },
                            },
                          ]}
                          trigger={({ open, toggle: toggleMenu }) => (
                            <IconButton
                              icon={MoreHorizontal}
                              label={`Ações do pedido ${order.number}`}
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
            unit="pedidos"
          />
        </div>
      </Card>

      <p className="mt-3 flex items-center gap-1.5 text-micro text-adm-ink-3">
        <Badge tone="neutral" size="sm">
          Dica
        </Badge>
        Pressione <kbd className="rounded border border-adm-line bg-adm-surface px-1">/</kbd>{" "}
        para buscar nesta tela ou{" "}
        <kbd className="rounded border border-adm-line bg-adm-surface px-1">⌘K</kbd>{" "}
        para buscar em todo o painel.
      </p>
    </>
  );
}
