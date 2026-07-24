"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Boxes,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  Receipt,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import {
  NOW,
  formatDateLong,
  formatRelative,
  formatTime,
} from "@/lib/admin/datetime";
import { ORDER_STATUS } from "@/lib/admin/labels";
import {
  activityFeed,
  dashboardMetrics,
  lowStockRows,
  productSales,
  stockRows,
} from "@/lib/admin/metrics";
import { useAdmin } from "@/lib/admin/store";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardLinkFooter,
  EmptyState,
  PageHeader,
  StatsCard,
  StatusBadge,
  Table,
  TableWrap,
  TBody,
  Td,
  TdLink,
  Th,
  THead,
  Tr,
  TrendChart,
  RankBars,
} from "@/components/admin/ui";

/**
 * Dashboard operacional.
 *
 * Divisão proposital em duas leituras: os quatro indicadores de
 * cima respondem "como vai o negócio"; a fila logo abaixo responde
 * "o que eu preciso fazer agora". Misturar as duas coisas em oito
 * cartões iguais esconderia justamente o que exige ação — por isso
 * a fila tem forma própria e cada item leva para a tela filtrada.
 */
export function DashboardScreen() {
  const { orders, products, customers, movements, reviews, currentUser } =
    useAdmin();

  const metrics = useMemo(() => dashboardMetrics(orders), [orders]);
  const stock = useMemo(() => stockRows(products, orders), [products, orders]);
  const low = useMemo(() => lowStockRows(stock).slice(0, 5), [stock]);
  const recent = useMemo(() => orders.slice(0, 7), [orders]);

  const topProducts = useMemo(() => {
    const monthOrders = orders.filter(
      (order) => new Date(order.createdAt) >= new Date(metrics.revenueSeries[0].date),
    );
    return productSales(monthOrders, products)
      .filter((entry) => entry.units > 0)
      .slice(0, 6);
  }, [orders, products, metrics.revenueSeries]);

  const activity = useMemo(
    () => activityFeed({ orders, customers, products, movements, reviews }, 8),
    [orders, customers, products, movements, reviews],
  );

  const customerName = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );

  const greeting = Number(formatTime(NOW).slice(0, 2)) < 12 ? "Bom dia" : "Boa tarde";

  const queue = [
    {
      label: "Aguardando pagamento",
      value: metrics.awaitingPayment,
      icon: Clock3,
      href: "/admin/pedidos?status=aguardando_pagamento",
      tone: "warn" as const,
    },
    {
      label: "Aguardando separação",
      value: metrics.awaitingPicking,
      icon: PackageCheck,
      href: "/admin/pedidos?status=pago",
      tone: "info" as const,
    },
    {
      label: "Enviados / em trânsito",
      value: metrics.shipped,
      icon: Truck,
      href: "/admin/pedidos?status=enviado",
      tone: "ship" as const,
    },
    {
      label: "Produtos vendidos no mês",
      value: metrics.unitsSoldMonth,
      icon: Boxes,
      href: "/admin/relatorios",
      tone: "neutral" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting}, ${currentUser.name.split(" ")[0]}`}
        description={`Resumo da operação em ${formatDateLong(NOW)} · atualizado às ${formatTime(NOW)}`}
      />

      {/* Desempenho */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Faturamento hoje"
          value={formatBRL(metrics.revenueToday)}
          delta={metrics.revenueTodayDelta}
          deltaLabel="vs. média dos últimos 7 dias"
          icon={CircleDollarSign}
        />
        <StatsCard
          label="Faturamento do mês"
          value={formatBRL(metrics.revenueMonth)}
          delta={metrics.revenueMonthDelta}
          deltaLabel="vs. mesmo período do mês anterior"
          icon={Wallet}
        />
        <StatsCard
          label="Pedidos hoje"
          value={String(metrics.ordersToday)}
          delta={metrics.ordersTodayDelta}
          deltaLabel="vs. média dos últimos 7 dias"
          icon={ShoppingBag}
          href="/admin/pedidos?periodo=hoje"
        />
        <StatsCard
          label="Ticket médio do mês"
          value={formatBRL(metrics.averageTicket)}
          delta={metrics.averageTicketDelta}
          deltaLabel="vs. mês anterior"
          icon={Receipt}
        />
      </div>

      {/* Fila de trabalho */}
      <Card className="mt-3">
        <ul className="grid divide-y divide-adm-line sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4">
          {queue.map((item, index) => (
            <li
              key={item.label}
              className={
                index > 0 ? "sm:border-l sm:border-adm-line" : undefined
              }
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-adm-raised"
              >
                <Badge tone={item.tone} className="!px-2 !py-2">
                  <item.icon size={14} />
                </Badge>
                <span className="min-w-0">
                  <span className="block text-[19px] font-medium leading-none tabular-nums text-adm-ink">
                    {item.value}
                  </span>
                  <span className="mt-1 block truncate text-micro text-adm-ink-3">
                    {item.label}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {/* Faturamento + estoque */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Faturamento — últimos 30 dias"
            description="Pedidos cancelados não entram no cálculo"
            action={
              <span className="text-[13px] font-medium tabular-nums text-adm-ink">
                {formatBRL(
                  metrics.revenueSeries.reduce((sum, day) => sum + day.value, 0),
                )}
              </span>
            }
          />
          <CardBody className="pt-4">
            <TrendChart
              data={metrics.revenueSeries.map((day) => ({
                label: day.label,
                value: day.value,
              }))}
              ariaLabel="Faturamento diário dos últimos 30 dias"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Estoque baixo"
            description="Abaixo do ponto de reposição"
          />
          {low.length === 0 ? (
            <CardBody>
              <EmptyState
                compact
                icon={Boxes}
                title="Estoque saudável"
                description="Nenhum produto abaixo do mínimo definido."
              />
            </CardBody>
          ) : (
            <ul className="divide-y divide-adm-line">
              {low.map((row) => (
                <li key={row.product.id}>
                  <Link
                    href={`/admin/produtos/${row.product.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-2.5 transition-colors hover:bg-adm-raised"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-adm-ink">
                        {row.product.name}
                      </span>
                      <span className="block text-micro text-adm-ink-3">
                        {row.product.brand} · mínimo {row.min} un.
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[13px] font-medium tabular-nums text-adm-ink">
                        {row.available}
                      </span>
                      <span className="block text-micro text-adm-ink-3">
                        disponíveis
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <CardLinkFooter href="/admin/estoque" label="Gerenciar estoque" />
        </Card>
      </div>

      {/* Pedidos + ranking + atividades */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Últimos pedidos"
            description="Os 7 pedidos mais recentes"
          />
          <TableWrap>
            <Table minWidth="34rem">
              <THead sticky={false}>
                <tr>
                  <Th width="5.5rem">Pedido</Th>
                  <Th>Cliente</Th>
                  <Th>Status</Th>
                  <Th align="right">Valor</Th>
                  <Th align="right" width="6rem">
                    Quando
                  </Th>
                </tr>
              </THead>
              <TBody>
                {recent.map((order) => (
                  <Tr key={order.id} href={`/admin/pedidos/${order.number}`}>
                    <TdLink href={`/admin/pedidos/${order.number}`}>
                      #{order.number}
                    </TdLink>
                    <Td className="max-w-[12rem] truncate">
                      {customerName.get(order.customerId)}
                    </Td>
                    <Td>
                      <StatusBadge
                        size="sm"
                        status={ORDER_STATUS[order.status]}
                      />
                    </Td>
                    <Td numeric strong>
                      {formatBRL(order.total)}
                    </Td>
                    <Td numeric muted>
                      {formatRelative(order.createdAt)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </TableWrap>
          <CardLinkFooter href="/admin/pedidos" label="Ver todos os pedidos" />
        </Card>

        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader
              title="Mais vendidos"
              description="Últimos 30 dias, por unidade"
            />
            <CardBody>
              <RankBars
                items={topProducts.map((entry) => ({
                  label: entry.product.name,
                  value: entry.units,
                  meta: formatBRL(entry.revenue),
                }))}
                formatValue={(value) => `${value} un.`}
                emptyLabel="Nenhuma venda no período."
              />
            </CardBody>
            <CardLinkFooter
              href="/admin/relatorios"
              label="Ver relatório de produtos"
            />
          </Card>

          <Card>
            <CardHeader title="Atividade recente" />
            <ul className="divide-y divide-adm-line">
              {activity.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={entry.href ?? "#"}
                    className="block px-5 py-2.5 transition-colors hover:bg-adm-raised"
                  >
                    <p className="text-[12.5px] leading-snug text-adm-ink-2">
                      {entry.message}
                    </p>
                    <p className="mt-0.5 text-micro text-adm-ink-3">
                      {entry.author} · {formatRelative(entry.at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
