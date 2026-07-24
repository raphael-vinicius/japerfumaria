"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Download,
  History,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { formatDateTime } from "@/lib/admin/datetime";
import { csvNumber, downloadCsv } from "@/lib/admin/export";
import { STOCK_HEALTH } from "@/lib/admin/labels";
import { lowStockRows, stockRows, stockValue } from "@/lib/admin/metrics";
import { useAdmin } from "@/lib/admin/store";
import type { AdminProduct, StockHealth, StockMovementType } from "@/lib/admin/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterBar,
  Input,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  StatsCard,
  StatusBadge,
  Table,
  TableMessage,
  TableWrap,
  TBody,
  Tabs,
  Td,
  TdLink,
  Textarea,
  Th,
  THead,
  Tr,
  matchesQuery,
  usePagination,
  useSort,
  useToast,
} from "@/components/admin/ui";

/**
 * Estoque.
 *
 * Tela própria porque estoque é rotina diária, e não um campo do
 * cadastro de produto. Três números convivem aqui: saldo físico,
 * reservado (pedidos pagos ainda não enviados) e disponível — o
 * único que responde "posso vender?". Toda alteração vira
 * movimento com motivo e autor: saldo sem história não se audita.
 */

type ViewTab = "posicao" | "movimentacoes";
type SortKey = "name" | "onHand" | "available" | "min";

export function StockScreen() {
  const params = useSearchParams();
  const { products, orders, movements, dispatch } = useAdmin();
  const toast = useToast();

  const [tab, setTab] = useState<ViewTab>("posicao");
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState<StockHealth | "todos">("todos");
  const { sort, toggle } = useSort<SortKey>({
    key: "available",
    direction: "asc",
  });

  const [target, setTarget] = useState<AdminProduct | null>(null);
  const [movementType, setMovementType] = useState<StockMovementType>("entrada");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");

  const rows = useMemo(() => stockRows(products, orders), [products, orders]);

  // Abre direto a movimentação quando o link vem da ficha do produto.
  const requested = params.get("produto");
  useEffect(() => {
    if (!requested) return;
    const product = products.find((item) => item.id === requested);
    if (product) openMovement(product, "entrada");
    // Intencional: só reage ao parâmetro da URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested]);

  const filtered = useMemo(() => {
    const list = rows.filter((row) => {
      if (health !== "todos" && row.health !== health) return false;
      return matchesQuery(
        query,
        row.product.name,
        row.product.brand,
        row.product.sku,
      );
    });

    const direction = sort.direction === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sort.key) {
        case "onHand":
          return (a.onHand - b.onHand) * direction;
        case "min":
          return (a.min - b.min) * direction;
        case "name":
          return a.product.name.localeCompare(b.product.name) * direction;
        default:
          return (a.available - b.available) * direction;
      }
    });
  }, [rows, query, health, sort]);

  const history = useMemo(() => {
    const list = movements.filter((movement) => {
      const product = products.find((item) => item.id === movement.productId);
      return matchesQuery(
        query,
        product?.name,
        product?.sku,
        movement.reason,
        movement.author,
      );
    });
    return list;
  }, [movements, products, query]);

  const positionPage = usePagination(filtered, 14);
  const historyPage = usePagination(history, 14);

  const summary = useMemo(() => {
    // Só produtos publicados geram alerta: um rascunho ainda sem
    // estoque não é ruptura, é lançamento em preparação. Mesma
    // regra do dashboard — os dois números têm de bater.
    const alerts = lowStockRows(rows);
    return {
      critical: alerts.filter(
        (row) => row.health === "sem_estoque" || row.health === "critico",
      ).length,
      low: alerts.filter((row) => row.health === "baixo").length,
      reserved: rows.reduce((sum, row) => sum + row.reserved, 0),
      value: stockValue(rows),
    };
  }, [rows]);

  const productName = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  function openMovement(product: AdminProduct, type: StockMovementType) {
    setTarget(product);
    setMovementType(type);
    setQuantity("1");
    setReason("");
  }

  const currentBalance = target
    ? (rows.find((row) => row.product.id === target.id)?.onHand ?? target.stock)
    : 0;

  const parsedQuantity = Number(quantity) || 0;
  const resultingBalance =
    movementType === "entrada"
      ? currentBalance + Math.abs(parsedQuantity)
      : movementType === "saida"
        ? currentBalance - Math.abs(parsedQuantity)
        : currentBalance + parsedQuantity;

  const submitMovement = () => {
    if (!target) return;
    if (!parsedQuantity) {
      toast.error("Informe uma quantidade diferente de zero");
      return;
    }
    if (!reason.trim()) {
      toast.error("Descreva o motivo do movimento");
      return;
    }
    if (resultingBalance < 0) {
      toast.error("Saldo não pode ficar negativo", {
        description: `Disponível em estoque: ${currentBalance} unidades.`,
      });
      return;
    }

    dispatch({
      type: "stock/movement",
      productId: target.id,
      movementType,
      quantity: parsedQuantity,
      reason: reason.trim(),
    });
    toast.success(
      `${movementType === "entrada" ? "Entrada" : movementType === "saida" ? "Saída" : "Ajuste"} registrada`,
      { description: `${target.name} · saldo agora ${resultingBalance} un.` },
    );
    setTarget(null);
  };

  const exportCsv = () => {
    downloadCsv(
      "estoque",
      ["SKU", "Produto", "Saldo", "Reservado", "Disponível", "Mínimo", "Situação", "Custo unitário", "Valor em estoque"],
      filtered.map((row) => [
        row.product.sku,
        row.product.name,
        row.onHand,
        row.reserved,
        row.available,
        row.min,
        STOCK_HEALTH[row.health].label,
        csvNumber(row.product.cost),
        csvNumber(row.onHand * row.product.cost),
      ]),
    );
    toast.success("Exportação concluída");
  };

  return (
    <>
      <PageHeader
        title="Estoque"
        description={`${rows.length} itens controlados · ${summary.reserved} unidades reservadas em pedidos abertos`}
        actions={
          <Button icon={Download} onClick={exportCsv}>
            Exportar
          </Button>
        }
      />

      <div className="mb-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Valor em estoque"
          value={formatBRL(summary.value)}
          hint="Pelo custo de aquisição"
        />
        <StatsCard
          label="Sem estoque ou crítico"
          value={String(summary.critical)}
          hint="Precisa de reposição imediata"
          attention={summary.critical > 0}
        />
        <StatsCard
          label="Abaixo do mínimo"
          value={String(summary.low)}
          hint="Programar próxima compra"
          attention={summary.low > 0}
        />
        <StatsCard
          label="Reservado"
          value={String(summary.reserved)}
          hint="Pedidos pagos e em separação"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-adm-line px-2">
          <Tabs
            ariaLabel="Visão do estoque"
            value={tab}
            onChange={setTab}
            items={[
              { value: "posicao" as ViewTab, label: "Posição", icon: Boxes },
              {
                value: "movimentacoes" as ViewTab,
                label: "Movimentações",
                icon: History,
                count: movements.length,
              },
            ]}
          />
        </div>

        <FilterBar>
          <SearchInput
            value={query}
            onChange={setQuery}
            shortcut="/"
            placeholder={
              tab === "posicao"
                ? "Produto, marca ou SKU…"
                : "Produto, motivo ou responsável…"
            }
            containerClassName="min-w-[13rem] sm:max-w-md"
          />
          {tab === "posicao" && (
            <Select
              aria-label="Filtrar por situação"
              value={health}
              onChange={(event) =>
                setHealth(event.target.value as StockHealth | "todos")
              }
              containerClassName="w-auto min-w-[10rem]"
              options={[
                { value: "todos", label: "Todas as situações" },
                { value: "sem_estoque", label: "Sem estoque" },
                { value: "critico", label: "Crítico" },
                { value: "baixo", label: "Baixo" },
                { value: "saudavel", label: "Saudável" },
                { value: "nao_publicado", label: "Não publicado" },
              ]}
            />
          )}
        </FilterBar>

        {tab === "posicao" ? (
          <>
            <TableWrap>
              <Table minWidth="56rem">
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
                      align="right"
                      width="6rem"
                      sortKey="onHand"
                      activeSort={sort}
                      onSort={(key) => toggle(key as SortKey)}
                    >
                      Saldo
                    </Th>
                    <Th align="right" width="6.5rem">
                      Reservado
                    </Th>
                    <Th
                      align="right"
                      width="7rem"
                      sortKey="available"
                      activeSort={sort}
                      onSort={(key) => toggle(key as SortKey)}
                    >
                      Disponível
                    </Th>
                    <Th
                      align="right"
                      width="5.5rem"
                      sortKey="min"
                      activeSort={sort}
                      onSort={(key) => toggle(key as SortKey)}
                    >
                      Mínimo
                    </Th>
                    <Th width="8rem">Situação</Th>
                    <Th align="right" width="12rem">
                      Movimentar
                    </Th>
                  </tr>
                </THead>

                <TBody>
                  {positionPage.items.length === 0 ? (
                    <TableMessage colSpan={7}>
                      <EmptyState
                        icon={Search}
                        title="Nenhum item encontrado"
                        description="Ajuste a busca ou o filtro de situação."
                      />
                    </TableMessage>
                  ) : (
                    positionPage.items.map((row) => (
                      <Tr key={row.product.id}>
                        <TdLink href={`/admin/produtos/${row.product.id}`}>
                          <span className="block max-w-[16rem] truncate">
                            {row.product.name}
                          </span>
                          <span className="block text-micro font-normal tabular-nums text-adm-ink-3">
                            {row.product.sku}
                          </span>
                        </TdLink>

                        <Td numeric>{row.onHand}</Td>
                        <Td numeric muted>
                          {row.reserved || "—"}
                        </Td>
                        <Td numeric strong>
                          {row.available}
                        </Td>
                        <Td numeric muted>
                          {row.min}
                        </Td>
                        <Td>
                          <StatusBadge
                            size="sm"
                            status={STOCK_HEALTH[row.health]}
                          />
                        </Td>

                        <Td align="right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              icon={ArrowDownToLine}
                              onClick={() => openMovement(row.product, "entrada")}
                            >
                              Entrada
                            </Button>
                            <Button
                              size="sm"
                              icon={ArrowUpFromLine}
                              onClick={() => openMovement(row.product, "saida")}
                            >
                              Saída
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={SlidersHorizontal}
                              aria-label={`Ajustar estoque de ${row.product.name}`}
                              onClick={() => openMovement(row.product, "ajuste")}
                            />
                          </div>
                        </Td>
                      </Tr>
                    ))
                  )}
                </TBody>
              </Table>
            </TableWrap>

            <div className="border-t border-adm-line">
              <Pagination
                page={positionPage.page}
                pageCount={positionPage.pageCount}
                from={positionPage.from}
                to={positionPage.to}
                total={positionPage.total}
                onChange={positionPage.setPage}
                unit="itens"
              />
            </div>
          </>
        ) : (
          <>
            <TableWrap>
              <Table minWidth="52rem">
                <THead>
                  <tr>
                    <Th width="11rem">Data</Th>
                    <Th>Produto</Th>
                    <Th width="6.5rem">Tipo</Th>
                    <Th>Motivo</Th>
                    <Th align="right" width="5.5rem">
                      Qtd.
                    </Th>
                    <Th align="right" width="6rem">
                      Saldo
                    </Th>
                    <Th width="9rem">Responsável</Th>
                  </tr>
                </THead>
                <TBody>
                  {historyPage.items.length === 0 ? (
                    <TableMessage colSpan={7}>
                      <EmptyState
                        icon={History}
                        title="Nenhuma movimentação"
                        description="Entradas, saídas e ajustes aparecem aqui com autor e motivo."
                      />
                    </TableMessage>
                  ) : (
                    historyPage.items.map((movement) => {
                      const product = productName.get(movement.productId);
                      return (
                        <Tr key={movement.id}>
                          <Td muted>{formatDateTime(movement.at)}</Td>
                          <Td>
                            <span className="block max-w-[14rem] truncate text-adm-ink">
                              {product?.name ?? "Produto removido"}
                            </span>
                            <span className="block text-micro tabular-nums text-adm-ink-3">
                              {product?.sku}
                            </span>
                          </Td>
                          <Td>
                            <Badge
                              size="sm"
                              tone={
                                movement.type === "entrada"
                                  ? "ok"
                                  : movement.type === "saida"
                                    ? "info"
                                    : "warn"
                              }
                            >
                              {movement.type}
                            </Badge>
                          </Td>
                          <Td className="max-w-[18rem] truncate">
                            {movement.reason}
                          </Td>
                          <Td numeric strong>
                            {movement.type === "saida"
                              ? `−${movement.quantity}`
                              : movement.quantity > 0
                                ? `+${movement.quantity}`
                                : movement.quantity}
                          </Td>
                          <Td numeric muted>
                            {movement.balanceAfter}
                          </Td>
                          <Td muted>{movement.author}</Td>
                        </Tr>
                      );
                    })
                  )}
                </TBody>
              </Table>
            </TableWrap>

            <div className="border-t border-adm-line">
              <Pagination
                page={historyPage.page}
                pageCount={historyPage.pageCount}
                from={historyPage.from}
                to={historyPage.to}
                total={historyPage.total}
                onChange={historyPage.setPage}
                unit="movimentações"
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={
          movementType === "entrada"
            ? "Registrar entrada"
            : movementType === "saida"
              ? "Registrar saída"
              : "Ajustar estoque"
        }
        description={target?.name}
        size="sm"
        persistent
        footer={
          <>
            <Button variant="ghost" onClick={() => setTarget(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={submitMovement}>
              Registrar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Tipo de movimento"
            value={movementType}
            onChange={(event) =>
              setMovementType(event.target.value as StockMovementType)
            }
            options={[
              { value: "entrada", label: "Entrada — recebimento de mercadoria" },
              { value: "saida", label: "Saída — venda, brinde ou perda" },
              { value: "ajuste", label: "Ajuste — correção de inventário" },
            ]}
          />

          <Input
            label={
              movementType === "ajuste"
                ? "Diferença (use negativo para reduzir)"
                : "Quantidade"
            }
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            suffix="un."
          />

          <Textarea
            label="Motivo"
            rows={2}
            value={reason}
            placeholder={
              movementType === "entrada"
                ? "Ex.: recebimento do pedido de importação nº 482"
                : movementType === "saida"
                  ? "Ex.: unidade cedida para degustação no balcão"
                  : "Ex.: contagem de inventário do dia"
            }
            onChange={(event) => setReason(event.target.value)}
          />

          <div className="rounded-adm border border-adm-line bg-adm-raised px-3 py-2.5">
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-adm-ink-3">Saldo atual</span>
              <span className="tabular-nums text-adm-ink-2">
                {currentBalance} un.
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-[13px]">
              <span className="text-adm-ink-3">Saldo após o movimento</span>
              <span
                className={
                  resultingBalance < 0
                    ? "font-medium tabular-nums text-adm-bad"
                    : "font-medium tabular-nums text-adm-ink"
                }
              >
                {resultingBalance} un.
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
