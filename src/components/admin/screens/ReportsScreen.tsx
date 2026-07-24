"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { formatDate } from "@/lib/admin/datetime";
import { csvNumber, downloadCsv } from "@/lib/admin/export";
import {
  averageTicket,
  categorySales,
  channelBreakdown,
  customerRows,
  inRange,
  isRevenue,
  paymentBreakdown,
  productSales,
  revenueByDay,
  revenueByMonth,
  sumRevenue,
  sumUnits,
} from "@/lib/admin/metrics";
import { useAdmin } from "@/lib/admin/store";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DataRow,
  DateRangePicker,
  PageHeader,
  RankBars,
  ShareBar,
  StatsCard,
  Table,
  TableWrap,
  TBody,
  Tabs,
  Td,
  TdLink,
  Th,
  THead,
  Tr,
  TrendChart,
  buildRange,
  useToast,
  type DateRange,
} from "@/components/admin/ui";

/**
 * Relatórios.
 *
 * Um período escolhido no topo governa a tela inteira — nada de
 * cada bloco com o próprio filtro, que é como se produz números
 * que não fecham entre si. Séries longas passam a agrupar por mês
 * automaticamente: 90 barras diárias não se leem.
 */

type ReportTab = "vendas" | "produtos" | "clientes";

const CATEGORY_COLORS = [
  "#836329",
  "#57496F",
  "#3F5D75",
  "#35624A",
  "#93384F",
  "#8A6320",
];

export function ReportsScreen() {
  const { orders, products, customers } = useAdmin();
  const toast = useToast();

  const [range, setRange] = useState<DateRange>(() => buildRange("30d"));
  const [tab, setTab] = useState<ReportTab>("vendas");

  const scoped = useMemo(
    () => inRange(orders, range.from, range.to),
    [orders, range],
  );

  /** Período imediatamente anterior, do mesmo tamanho. */
  const previous = useMemo(() => {
    const span = range.to.getTime() - range.from.getTime();
    return inRange(
      orders,
      new Date(range.from.getTime() - span),
      new Date(range.from.getTime() - 1),
    );
  }, [orders, range]);

  const revenue = sumRevenue(scoped);
  const previousRevenue = sumRevenue(previous);
  const validOrders = scoped.filter(isRevenue);
  const cancelled = scoped.filter((order) => order.status === "cancelado");

  const days = Math.round(
    (range.to.getTime() - range.from.getTime()) / 86_400_000,
  );
  const useMonthly = days > 62;

  const series = useMemo(() => {
    if (useMonthly) {
      return revenueByMonth(orders, range.from, range.to).map((point) => ({
        label: point.label,
        value: point.revenue,
        secondary: point.orders,
      }));
    }
    return revenueByDay(scoped, range.from, range.to).map((point) => ({
      label: point.label,
      value: point.revenue,
      secondary: point.orders,
    }));
  }, [useMonthly, orders, scoped, range]);

  const byCategory = useMemo(
    () => categorySales(scoped, products),
    [scoped, products],
  );
  const byProduct = useMemo(
    () => productSales(scoped, products).filter((item) => item.units > 0),
    [scoped, products],
  );
  const byPayment = useMemo(() => paymentBreakdown(scoped), [scoped]);
  const byChannel = useMemo(() => channelBreakdown(scoped), [scoped]);

  const topCustomers = useMemo(() => {
    const ids = new Set(validOrders.map((order) => order.customerId));
    return customerRows(
      customers.filter((customer) => ids.has(customer.id)),
      scoped,
      products,
    ).slice(0, 10);
  }, [customers, scoped, products, validOrders]);

  const newCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        const at = new Date(customer.createdAt).getTime();
        return at >= range.from.getTime() && at <= range.to.getTime();
      }).length,
    [customers, range],
  );

  const delta =
    previousRevenue > 0
      ? ((revenue - previousRevenue) / previousRevenue) * 100
      : null;

  const exportCurrent = () => {
    if (tab === "produtos") {
      downloadCsv(
        `relatorio-produtos-${range.preset}`,
        ["SKU", "Produto", "Marca", "Categoria", "Unidades", "Receita"],
        byProduct.map((item) => [
          item.product.sku,
          item.product.name,
          item.product.brand,
          item.product.categorySlug,
          item.units,
          csvNumber(item.revenue),
        ]),
      );
    } else if (tab === "clientes") {
      downloadCsv(
        `relatorio-clientes-${range.preset}`,
        ["Cliente", "Cidade", "Pedidos", "Total", "Ticket médio"],
        topCustomers.map((row) => [
          row.customer.name,
          row.customer.addresses[0]?.city,
          row.stats.orderCount,
          csvNumber(row.stats.totalSpent),
          csvNumber(row.stats.averageTicket),
        ]),
      );
    } else {
      downloadCsv(
        `relatorio-vendas-${range.preset}`,
        ["Período", "Faturamento", "Pedidos"],
        series.map((point) => [
          point.label,
          csvNumber(point.value),
          point.secondary ?? 0,
        ]),
      );
    }
    toast.success("Relatório exportado");
  };

  return (
    <>
      <PageHeader
        title="Relatórios"
        description={`${formatDate(range.from)} a ${formatDate(range.to)} · ${validOrders.length} pedidos válidos`}
        actions={
          <>
            <DateRangePicker value={range} onChange={setRange} />
            <Button icon={Download} onClick={exportCurrent}>
              Exportar
            </Button>
          </>
        }
      />

      <div className="mb-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Faturamento"
          value={formatBRL(revenue)}
          delta={delta}
          deltaLabel="vs. período anterior"
        />
        <StatsCard
          label="Pedidos"
          value={String(validOrders.length)}
          hint={`${cancelled.length} cancelados no período`}
        />
        <StatsCard
          label="Ticket médio"
          value={formatBRL(averageTicket(scoped))}
          hint={`${sumUnits(scoped)} unidades vendidas`}
        />
        <StatsCard
          label="Novos clientes"
          value={String(newCustomers)}
          hint="Cadastros no período"
        />
      </div>

      <Card className="mb-3">
        <CardHeader
          title={useMonthly ? "Faturamento por mês" : "Faturamento por dia"}
          description={
            useMonthly
              ? "Períodos acima de dois meses são agrupados por mês"
              : "Passe o mouse para ver o valor exato de cada dia"
          }
        />
        <CardBody className="pt-4">
          {series.length ? (
            <TrendChart
              data={series}
              height={220}
              secondaryLabel="pedidos"
              ariaLabel="Faturamento ao longo do período selecionado"
            />
          ) : (
            <p className="py-10 text-center text-[13px] text-adm-ink-3">
              Nenhuma venda no período selecionado.
            </p>
          )}
        </CardBody>
      </Card>

      <div className="mb-3">
        <Tabs
          ariaLabel="Recorte do relatório"
          value={tab}
          onChange={setTab}
          items={[
            { value: "vendas" as ReportTab, label: "Vendas" },
            { value: "produtos" as ReportTab, label: "Produtos" },
            { value: "clientes" as ReportTab, label: "Clientes" },
          ]}
        />
      </div>

      {tab === "vendas" && (
        <div className="grid gap-3 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Formas de pagamento"
              description="Participação na receita do período"
            />
            <CardBody>
              <ShareBar
                segments={byPayment.map((item, index) => ({
                  label: item.label,
                  value: item.revenue,
                  color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                }))}
              />
              <dl className="mt-4 border-t border-adm-line pt-2">
                {byPayment.map((item) => (
                  <DataRow
                    key={item.method}
                    label={`${item.label} · ${item.orders} pedidos`}
                    value={formatBRL(item.revenue)}
                    mono
                  />
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Canais de venda"
              description="De onde vieram os pedidos"
            />
            <CardBody>
              <ShareBar
                segments={byChannel.map((item, index) => ({
                  label: item.label,
                  value: item.revenue,
                  color: CATEGORY_COLORS[(index + 2) % CATEGORY_COLORS.length],
                }))}
              />
              <dl className="mt-4 border-t border-adm-line pt-2">
                {byChannel.map((item) => (
                  <DataRow
                    key={item.channel}
                    label={`${item.label} · ${item.orders} pedidos`}
                    value={formatBRL(item.revenue)}
                    mono
                  />
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader
              title="Vendas por categoria"
              description="Receita e volume em cada linha do catálogo"
            />
            <TableWrap>
              <Table minWidth="34rem">
                <THead sticky={false}>
                  <tr>
                    <Th>Categoria</Th>
                    <Th align="right" width="7rem">
                      Unidades
                    </Th>
                    <Th align="right" width="9rem">
                      Receita
                    </Th>
                    <Th align="right" width="7rem">
                      Participação
                    </Th>
                  </tr>
                </THead>
                <TBody>
                  {byCategory.map((item) => (
                    <Tr key={item.slug}>
                      <Td strong>{item.name}</Td>
                      <Td numeric>{item.units}</Td>
                      <Td numeric strong>
                        {formatBRL(item.revenue)}
                      </Td>
                      <Td numeric muted>
                        {item.share.toFixed(1)}%
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableWrap>
          </Card>
        </div>
      )}

      {tab === "produtos" && (
        <div className="grid gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Produtos mais vendidos"
              description={`${byProduct.length} produtos com venda no período`}
            />
            <TableWrap>
              <Table minWidth="38rem">
                <THead sticky={false}>
                  <tr>
                    <Th>Produto</Th>
                    <Th width="8rem">SKU</Th>
                    <Th align="right" width="6.5rem">
                      Unidades
                    </Th>
                    <Th align="right" width="9rem">
                      Receita
                    </Th>
                  </tr>
                </THead>
                <TBody>
                  {byProduct.slice(0, 15).map((item) => (
                    <Tr key={item.product.id}>
                      <TdLink href={`/admin/produtos/${item.product.id}`}>
                        <span className="block max-w-[16rem] truncate">
                          {item.product.name}
                        </span>
                        <span className="block text-micro font-normal text-adm-ink-3">
                          {item.product.brand}
                        </span>
                      </TdLink>
                      <Td muted className="text-micro tabular-nums">
                        {item.product.sku}
                      </Td>
                      <Td numeric>{item.units}</Td>
                      <Td numeric strong>
                        {formatBRL(item.revenue)}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableWrap>
          </Card>

          <div className="flex flex-col gap-3">
            <Card>
              <CardHeader title="Receita por produto" />
              <CardBody>
                <RankBars
                  items={byProduct.slice(0, 8).map((item) => ({
                    label: item.product.name,
                    value: item.revenue,
                    meta: `${item.units} un.`,
                  }))}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Sem vendas no período"
                description="Candidatos a revisão de preço ou vitrine"
              />
              <CardBody>
                {(() => {
                  const sold = new Set(byProduct.map((item) => item.product.id));
                  const idle = products.filter(
                    (product) =>
                      product.status === "ativo" && !sold.has(product.id),
                  );
                  if (!idle.length)
                    return (
                      <p className="text-[12.5px] text-adm-ink-3">
                        Todo o catálogo ativo vendeu no período.
                      </p>
                    );
                  return (
                    <ul className="flex flex-col gap-1.5">
                      {idle.slice(0, 8).map((product) => (
                        <li
                          key={product.id}
                          className="flex items-baseline justify-between gap-3 text-[12.5px]"
                        >
                          <span className="truncate text-adm-ink-2">
                            {product.name}
                          </span>
                          <span className="shrink-0 tabular-nums text-adm-ink-3">
                            {formatBRL(product.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {tab === "clientes" && (
        <Card>
          <CardHeader
            title="Clientes que mais compraram"
            description="Top 10 por valor no período selecionado"
          />
          <TableWrap>
            <Table minWidth="40rem">
              <THead sticky={false}>
                <tr>
                  <Th>Cliente</Th>
                  <Th width="11rem">Cidade</Th>
                  <Th align="right" width="6.5rem">
                    Pedidos
                  </Th>
                  <Th align="right" width="9rem">
                    Total
                  </Th>
                  <Th align="right" width="9rem">
                    Ticket médio
                  </Th>
                </tr>
              </THead>
              <TBody>
                {topCustomers.map((row) => (
                  <Tr key={row.customer.id}>
                    <TdLink href={`/admin/clientes/${row.customer.id}`}>
                      {row.customer.name}
                    </TdLink>
                    <Td muted>
                      {row.customer.addresses[0]?.city} -{" "}
                      {row.customer.addresses[0]?.state}
                    </Td>
                    <Td numeric>{row.stats.orderCount}</Td>
                    <Td numeric strong>
                      {formatBRL(row.stats.totalSpent)}
                    </Td>
                    <Td numeric muted>
                      {formatBRL(row.stats.averageTicket)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        </Card>
      )}
    </>
  );
}
