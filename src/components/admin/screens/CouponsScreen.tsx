"use client";

import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Ticket,
  Trash2,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { NOW, dayKey, formatDate } from "@/lib/admin/datetime";
import {
  COUPON_STATUS,
  COUPON_TYPE,
  couponStatus,
  couponValueLabel,
} from "@/lib/admin/labels";
import { useAdmin } from "@/lib/admin/store";
import type { AdminCoupon, CouponType } from "@/lib/admin/types";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  EmptyState,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Select,
  StatsCard,
  StatusBadge,
  Table,
  TableWrap,
  TBody,
  Tabs,
  Td,
  Textarea,
  Th,
  THead,
  Toggle,
  Tr,
  useConfirm,
  useToast,
} from "@/components/admin/ui";

/**
 * Cupons.
 *
 * O status não é um campo: é calculado a partir das datas, do
 * limite de uso e da chave ativo/pausado. Assim um cupom nunca
 * aparece como "ativo" depois de vencido — erro clássico de painel
 * que guarda status como texto.
 */
export function CouponsScreen() {
  const { coupons, orders, dispatch } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();

  const [tab, setTab] = useState<"todos" | "ativos" | "encerrados">("todos");
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Uso e receita recontados nos pedidos — nunca um contador solto. */
  const usage = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number; discount: number }>();
    for (const order of orders) {
      if (!order.couponCode || order.status === "cancelado") continue;
      const current = map.get(order.couponCode) ?? {
        count: 0,
        revenue: 0,
        discount: 0,
      };
      current.count += 1;
      current.revenue += order.total;
      current.discount += order.discount;
      map.set(order.couponCode, current);
    }
    return map;
  }, [orders]);

  const withStatus = useMemo(
    () =>
      coupons.map((coupon) => ({
        coupon,
        status: couponStatus(
          { ...coupon, used: usage.get(coupon.code)?.count ?? coupon.used },
          NOW,
        ),
        stats: usage.get(coupon.code) ?? { count: 0, revenue: 0, discount: 0 },
      })),
    [coupons, usage],
  );

  const filtered = useMemo(() => {
    if (tab === "ativos")
      return withStatus.filter(
        (item) => item.status === "ativo" || item.status === "agendado",
      );
    if (tab === "encerrados")
      return withStatus.filter(
        (item) =>
          item.status === "expirado" ||
          item.status === "esgotado" ||
          item.status === "pausado",
      );
    return withStatus;
  }, [withStatus, tab]);

  const summary = useMemo(() => {
    const active = withStatus.filter((item) => item.status === "ativo").length;
    const totalUses = withStatus.reduce((sum, item) => sum + item.stats.count, 0);
    const discount = withStatus.reduce(
      (sum, item) => sum + item.stats.discount,
      0,
    );
    const revenue = withStatus.reduce(
      (sum, item) => sum + item.stats.revenue,
      0,
    );
    return { active, totalUses, discount, revenue };
  }, [withStatus]);

  const openNew = () => {
    setIsNew(true);
    setErrors({});
    setEditing({
      id: `cp-${Date.now()}`,
      code: "",
      description: "",
      type: "percent",
      value: 10,
      startsAt: NOW.toISOString(),
      used: 0,
      active: true,
    });
  };

  const save = () => {
    if (!editing) return;
    const next: Record<string, string> = {};
    const code = editing.code.trim().toUpperCase();

    if (!code) next.code = "Informe o código do cupom.";
    else if (!/^[A-Z0-9]{3,20}$/.test(code))
      next.code = "Use de 3 a 20 letras e números, sem espaços.";
    else if (
      coupons.some((item) => item.code === code && item.id !== editing.id)
    )
      next.code = "Já existe um cupom com este código.";

    if (editing.type !== "free_shipping" && editing.value <= 0)
      next.value = "Informe um valor maior que zero.";
    if (editing.type === "percent" && editing.value > 90)
      next.value = "Percentual acima de 90% costuma ser engano.";
    if (
      editing.endsAt &&
      new Date(editing.endsAt).getTime() < new Date(editing.startsAt).getTime()
    )
      next.endsAt = "A data final precisa ser depois da inicial.";

    setErrors(next);
    if (Object.keys(next).length) return;

    dispatch({ type: "coupon/save", coupon: { ...editing, code } });
    toast.success(isNew ? "Cupom criado" : "Cupom atualizado", {
      description: code,
    });
    setEditing(null);
  };

  const toggleActive = (coupon: AdminCoupon) => {
    dispatch({
      type: "coupon/save",
      coupon: { ...coupon, active: !coupon.active },
    });
    toast.success(coupon.active ? "Cupom pausado" : "Cupom reativado", {
      description: coupon.code,
    });
  };

  const remove = async (coupon: AdminCoupon) => {
    const used = usage.get(coupon.code)?.count ?? 0;
    const ok = await confirm({
      title: `Excluir o cupom ${coupon.code}?`,
      description: used
        ? `Ele já foi usado em ${used} pedidos. O histórico dos pedidos é mantido, mas o cupom deixa de existir. Pausar costuma ser a melhor opção.`
        : "O cupom deixa de ser aceito no checkout.",
      confirmLabel: "Excluir cupom",
    });
    if (!ok) return;
    dispatch({ type: "coupon/delete", couponId: coupon.id });
    toast.success("Cupom excluído");
  };

  return (
    <>
      <PageHeader
        title="Cupons"
        description={`${coupons.length} cupons cadastrados · ${summary.active} ativos agora`}
        actions={
          <Button variant="primary" icon={Plus} onClick={openNew}>
            Novo cupom
          </Button>
        }
      />

      <div className="mb-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Cupons ativos" value={String(summary.active)} />
        <StatsCard label="Usos totais" value={String(summary.totalUses)} />
        <StatsCard
          label="Desconto concedido"
          value={formatBRL(summary.discount)}
          hint="Somatório histórico"
        />
        <StatsCard
          label="Receita com cupom"
          value={formatBRL(summary.revenue)}
          hint="Pedidos que usaram algum código"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-adm-line px-2 py-2">
          <Tabs
            ariaLabel="Filtrar cupons"
            variant="pill"
            value={tab}
            onChange={setTab}
            items={[
              { value: "todos" as const, label: "Todos", count: withStatus.length },
              {
                value: "ativos" as const,
                label: "Ativos e agendados",
                count: withStatus.filter(
                  (item) => item.status === "ativo" || item.status === "agendado",
                ).length,
              },
              {
                value: "encerrados" as const,
                label: "Encerrados",
                count: withStatus.filter(
                  (item) =>
                    item.status === "expirado" ||
                    item.status === "esgotado" ||
                    item.status === "pausado",
                ).length,
              },
            ]}
          />
        </div>

        <TableWrap>
          <Table minWidth="56rem">
            <THead>
              <tr>
                <Th>Código</Th>
                <Th width="8rem">Tipo</Th>
                <Th align="right" width="7rem">
                  Valor
                </Th>
                <Th width="11rem">Validade</Th>
                <Th width="11rem">Uso</Th>
                <Th width="7.5rem">Status</Th>
                <Th width="3rem">
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </THead>

            <TBody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12">
                    <EmptyState
                      icon={Ticket}
                      title="Nenhum cupom nesta seleção"
                      description="Cupons ajudam a recuperar carrinho e ativar cliente antigo."
                      action={
                        <Button icon={Plus} onClick={openNew}>
                          Criar cupom
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(({ coupon, status, stats }) => {
                  const limit = coupon.usageLimit;
                  const percent = limit
                    ? Math.min(100, (stats.count / limit) * 100)
                    : 0;

                  return (
                    <Tr key={coupon.id}>
                      <Td>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNew(false);
                            setErrors({});
                            setEditing(coupon);
                          }}
                          className="block text-[13px] font-medium tabular-nums tracking-wide text-adm-ink hover:text-adm-accent"
                        >
                          {coupon.code}
                        </button>
                        <span className="block max-w-[18rem] truncate text-micro text-adm-ink-3">
                          {coupon.description}
                        </span>
                      </Td>

                      <Td>{COUPON_TYPE[coupon.type]}</Td>

                      <Td numeric strong>
                        {couponValueLabel(coupon)}
                        {coupon.minSubtotal ? (
                          <span className="block text-micro font-normal text-adm-ink-3">
                            mín. {formatBRL(coupon.minSubtotal)}
                          </span>
                        ) : null}
                      </Td>

                      <Td>
                        <span className="block text-adm-ink-2">
                          {formatDate(coupon.startsAt)}
                        </span>
                        <span className="block text-micro text-adm-ink-3">
                          {coupon.endsAt
                            ? `até ${formatDate(coupon.endsAt)}`
                            : "sem data final"}
                        </span>
                      </Td>

                      <Td>
                        <span className="block text-[12.5px] tabular-nums text-adm-ink-2">
                          {stats.count}
                          {limit ? ` de ${limit}` : " usos"}
                        </span>
                        {limit ? (
                          <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-adm-sunken">
                            <span
                              className={
                                percent >= 100
                                  ? "block h-full rounded-full bg-adm-bad"
                                  : "block h-full rounded-full bg-adm-accent/70"
                              }
                              style={{ width: `${Math.max(2, percent)}%` }}
                            />
                          </span>
                        ) : null}
                      </Td>

                      <Td>
                        <StatusBadge size="sm" status={COUPON_STATUS[status]} />
                      </Td>

                      <Td>
                        <Dropdown
                          label={`Ações do cupom ${coupon.code}`}
                          items={[
                            {
                              label: "Editar",
                              icon: Pencil,
                              onSelect: () => {
                                setIsNew(false);
                                setErrors({});
                                setEditing(coupon);
                              },
                            },
                            {
                              label: coupon.active ? "Pausar" : "Reativar",
                              icon: coupon.active ? Pause : Play,
                              onSelect: () => toggleActive(coupon),
                            },
                            {
                              label: "Excluir",
                              icon: Trash2,
                              tone: "danger",
                              separated: true,
                              onSelect: () => remove(coupon),
                            },
                          ]}
                          trigger={({ open, toggle }) => (
                            <IconButton
                              icon={MoreHorizontal}
                              label={`Ações do cupom ${coupon.code}`}
                              size="sm"
                              aria-expanded={open}
                              onClick={toggle}
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
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={isNew ? "Novo cupom" : `Editar ${editing?.code}`}
        description="O código é o que o cliente digita no checkout."
        persistent
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save}>
              {isNew ? "Criar cupom" : "Salvar"}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <Input
              label="Código"
              required
              value={editing.code}
              error={errors.code}
              hint="Letras e números, sem espaço nem acento."
              onChange={(event) =>
                setEditing({
                  ...editing,
                  code: event.target.value.toUpperCase().replace(/\s/g, ""),
                })
              }
            />

            <Textarea
              label="Descrição interna"
              rows={2}
              value={editing.description}
              onChange={(event) =>
                setEditing({ ...editing, description: event.target.value })
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tipo"
                value={editing.type}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    type: event.target.value as CouponType,
                    value:
                      event.target.value === "free_shipping" ? 0 : editing.value,
                  })
                }
                options={[
                  { value: "percent", label: "Percentual" },
                  { value: "fixed", label: "Valor fixo" },
                  { value: "free_shipping", label: "Frete grátis" },
                ]}
              />
              <Input
                label="Valor"
                type="number"
                min={0}
                disabled={editing.type === "free_shipping"}
                prefix={editing.type === "fixed" ? "R$" : undefined}
                suffix={editing.type === "percent" ? "%" : undefined}
                value={editing.type === "free_shipping" ? 0 : editing.value}
                error={errors.value}
                onChange={(event) =>
                  setEditing({ ...editing, value: Number(event.target.value) })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Início"
                type="date"
                value={dayKey(editing.startsAt)}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    startsAt: new Date(
                      `${event.target.value}T00:00:00-03:00`,
                    ).toISOString(),
                  })
                }
              />
              <Input
                label="Fim"
                type="date"
                value={editing.endsAt ? dayKey(editing.endsAt) : ""}
                error={errors.endsAt}
                hint="Deixe vazio para não expirar."
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    endsAt: event.target.value
                      ? new Date(
                          `${event.target.value}T23:59:59-03:00`,
                        ).toISOString()
                      : undefined,
                  })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Limite de uso"
                type="number"
                min={0}
                value={editing.usageLimit ?? ""}
                hint="Vazio = ilimitado."
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    usageLimit: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  })
                }
              />
              <Input
                label="Compra mínima"
                type="number"
                min={0}
                prefix="R$"
                value={editing.minSubtotal ?? ""}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    minSubtotal: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div className="border-t border-adm-line pt-4">
              <Toggle
                checked={editing.active}
                onChange={(value) => setEditing({ ...editing, active: value })}
                label="Cupom ativo"
                description="Desativado, o código deixa de ser aceito imediatamente."
              />
            </div>

            {!isNew && (
              <p className="text-micro text-adm-ink-3">
                Usado {usage.get(editing.code)?.count ?? 0} vezes ·{" "}
                {formatBRL(usage.get(editing.code)?.discount ?? 0)} em
                descontos concedidos.
              </p>
            )}

            <Badge tone="neutral" size="sm" className="self-start">
              Pré-visualização: {couponValueLabel(editing)}
            </Badge>
          </div>
        )}
      </Modal>
    </>
  );
}
