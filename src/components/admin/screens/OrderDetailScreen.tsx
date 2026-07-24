"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  PackageCheck,
  Printer,
  Search,
  Truck,
  User,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import {
  formatDate,
  formatDateTime,
  formatRelative,
  formatTime,
} from "@/lib/admin/datetime";
import { copyToClipboard } from "@/lib/admin/export";
import {
  CHANNEL,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "@/lib/admin/labels";
import { useAdmin } from "@/lib/admin/store";
import type { OrderStatus } from "@/lib/admin/types";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  DataRow,
  Dropdown,
  EmptyState,
  IconButton,
  Input,
  Modal,
  MoneyRow,
  PageHeader,
  Select,
  StatusBadge,
  Textarea,
  useConfirm,
  useToast,
} from "@/components/admin/ui";

/**
 * Ficha do pedido.
 *
 * Organizada pela pergunta que o operador tem em mãos: à esquerda,
 * "o que sai da loja" (itens e valores); à direita, "para quem e
 * como" (cliente, entrega, pagamento) e o histórico do que já
 * aconteceu. A ação principal é sempre uma só — o próximo passo do
 * fluxo — e fica no topo, no mesmo lugar em todos os estados.
 */
export function OrderDetailScreen({ orderNumber }: { orderNumber: string }) {
  const { orders, customers, dispatch } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();

  const [noteDraft, setNoteDraft] = useState("");
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [carrier, setCarrier] = useState("Correios");
  const [code, setCode] = useState("");

  const order = useMemo(
    () => orders.find((item) => String(item.number) === orderNumber),
    [orders, orderNumber],
  );
  const customer = customers.find((item) => item.id === order?.customerId);

  if (!order) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={Search}
            title="Pedido não encontrado"
            description={`Não existe pedido com o número #${orderNumber}. Ele pode ter sido removido ou o número está incorreto.`}
            action={
              <ButtonLink href="/admin/pedidos">Voltar para pedidos</ButtonLink>
            }
          />
        </CardBody>
      </Card>
    );
  }

  const address = order.shipping.address;
  const addressText = `${customer?.name ?? ""}\n${address.street}, ${address.number}${address.complement ? ` — ${address.complement}` : ""}\n${address.district} · ${address.city} - ${address.state}\nCEP ${address.zip}`;

  const setStatus = (status: OrderStatus, detail?: string) => {
    const previous = order.status;
    dispatch({ type: "order/status", orderId: order.id, status, detail });
    toast.success(`Pedido marcado como “${ORDER_STATUS[status].label}”`, {
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

  const cancel = async () => {
    const ok = await confirm({
      title: `Cancelar o pedido #${order.number}?`,
      description:
        "O pagamento passa a constar como estornado e as unidades já separadas voltam ao estoque. A ação fica registrada na linha do tempo.",
      confirmLabel: "Cancelar pedido",
    });
    if (ok) setStatus("cancelado", "Cancelado pelo painel administrativo");
  };

  const saveTracking = () => {
    if (code.trim().length < 6) {
      toast.error("Código de rastreio muito curto");
      return;
    }
    dispatch({
      type: "order/tracking",
      orderId: order.id,
      carrier,
      code: code.trim().toUpperCase(),
    });
    setTrackingOpen(false);
    setCode("");
    toast.success("Rastreio adicionado ao pedido");
  };

  const addNote = () => {
    if (!noteDraft.trim()) return;
    dispatch({ type: "order/note", orderId: order.id, body: noteDraft.trim() });
    setNoteDraft("");
    toast.success("Observação registrada");
  };

  /** Próximo passo do fluxo — vira o botão principal da tela. */
  const nextStep: { label: string; status: OrderStatus; icon: typeof Truck } | null =
    order.status === "aguardando_pagamento"
      ? { label: "Confirmar pagamento", status: "pago", icon: CheckCircle2 }
      : order.status === "pago"
        ? { label: "Iniciar separação", status: "separando", icon: PackageCheck }
        : order.status === "separando"
          ? { label: "Marcar como enviado", status: "enviado", icon: Truck }
          : order.status === "enviado"
            ? { label: "Marcar como entregue", status: "entregue", icon: CheckCircle2 }
            : null;

  const closed = order.status === "entregue" || order.status === "cancelado";

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Pedidos", href: "/admin/pedidos" },
          { label: `#${order.number}` },
        ]}
        title={`Pedido #${order.number}`}
        description={`${formatDateTime(order.createdAt)} · ${CHANNEL[order.channel]} · ${order.items.length} ${order.items.length === 1 ? "item" : "itens"}`}
        meta={<StatusBadge status={ORDER_STATUS[order.status]} />}
        actions={
          <>
            {nextStep && (
              <Button
                variant="primary"
                icon={nextStep.icon}
                onClick={() => {
                  if (
                    nextStep.status === "enviado" &&
                    !order.shipping.trackingCode &&
                    order.shipping.method !== "retirada"
                  ) {
                    setTrackingOpen(true);
                    return;
                  }
                  setStatus(nextStep.status);
                }}
              >
                {nextStep.label}
              </Button>
            )}

            <Button icon={Printer} onClick={() => window.print()}>
              Imprimir
            </Button>

            <Dropdown
              label="Mais ações do pedido"
              items={[
                {
                  label: order.shipping.trackingCode
                    ? "Editar rastreio"
                    : "Adicionar rastreio",
                  icon: Truck,
                  onSelect: () => {
                    setCarrier(order.shipping.carrier ?? "Correios");
                    setCode(order.shipping.trackingCode ?? "");
                    setTrackingOpen(true);
                  },
                },
                {
                  label: "Copiar endereço",
                  icon: MapPin,
                  onSelect: async () => {
                    const ok = await copyToClipboard(addressText);
                    if (ok) toast.success("Endereço copiado");
                    else toast.error("Não foi possível copiar");
                  },
                },
                {
                  label: "Copiar número do pedido",
                  icon: Copy,
                  onSelect: async () => {
                    await copyToClipboard(`#${order.number}`);
                    toast.success("Número copiado");
                  },
                },
                {
                  label: "Cancelar pedido",
                  icon: Ban,
                  tone: "danger",
                  separated: true,
                  disabled: closed,
                  onSelect: cancel,
                },
              ]}
              trigger={({ open, toggle }) => (
                <IconButton
                  icon={MoreHorizontal}
                  label="Mais ações"
                  variant="secondary"
                  aria-expanded={open}
                  onClick={toggle}
                />
              )}
            />
          </>
        }
        className="adm-no-print"
      />

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <Card>
            <CardHeader
              title="Itens do pedido"
              description={`${order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades`}
            />
            <ul className="divide-y divide-adm-line">
              {order.items.map((item) => (
                <li key={item.productId} className="flex gap-3 px-5 py-3">
                  <Link
                    href={`/admin/produtos/${item.productId}`}
                    className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-adm border border-adm-line bg-adm-raised"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 object-contain"
                      />
                    ) : (
                      <span className="text-micro text-adm-ink-3">sem foto</span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/produtos/${item.productId}`}
                      className="block truncate text-[13px] font-medium text-adm-ink hover:text-adm-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-micro text-adm-ink-3">
                      {item.brand} · SKU {item.sku}
                    </p>
                    <p className="mt-1 text-micro tabular-nums text-adm-ink-3">
                      {item.quantity} × {formatBRL(item.unitPrice)}
                    </p>
                  </div>

                  <p className="shrink-0 text-[13px] font-medium tabular-nums text-adm-ink">
                    {formatBRL(item.total)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-adm-line bg-adm-raised px-5 py-3">
              <div className="ml-auto max-w-xs">
                <MoneyRow label="Subtotal" value={order.subtotal} />
                {order.discount > 0 && (
                  <MoneyRow
                    label={`Desconto${order.couponCode ? ` · ${order.couponCode}` : ""}`}
                    value={order.discount}
                    tone="discount"
                  />
                )}
                <MoneyRow
                  label={`Frete · ${order.shipping.label}`}
                  value={order.shipping.fee}
                />
                <MoneyRow label="Total" value={order.total} emphasis />
              </div>
            </div>
          </Card>

          {order.customerMessage && (
            <Card>
              <CardHeader title="Recado do cliente" />
              <CardBody className="py-4">
                <p className="border-l-2 border-adm-accent/40 pl-3 text-[13px] italic leading-relaxed text-adm-ink-2">
                  “{order.customerMessage}”
                </p>
              </CardBody>
            </Card>
          )}

          <Card className="adm-no-print">
            <CardHeader
              title="Observações internas"
              description="Visível apenas para a equipe"
            />
            {order.notes.length > 0 && (
              <ul className="divide-y divide-adm-line">
                {order.notes.map((note) => (
                  <li key={note.id} className="px-5 py-3">
                    <p className="text-[13px] leading-relaxed text-adm-ink-2">
                      {note.body}
                    </p>
                    <p className="mt-1 text-micro text-adm-ink-3">
                      {note.author} · {formatDateTime(note.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <CardBody className="border-t border-adm-line py-4">
              <Textarea
                rows={2}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Registrar uma observação sobre este pedido…"
                aria-label="Nova observação"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  icon={MessageSquare}
                  onClick={addNote}
                  disabled={!noteDraft.trim()}
                >
                  Adicionar observação
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Coluna de contexto */}
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader
              title="Cliente"
              action={
                customer && (
                  <Link
                    href={`/admin/clientes/${customer.id}`}
                    className="text-micro font-medium text-adm-accent hover:underline"
                  >
                    Ver ficha
                  </Link>
                )
              }
            />
            <CardBody className="py-3">
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-adm-sunken text-micro font-medium text-adm-ink-2"
                >
                  {customer?.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("") ?? <User size={14} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-adm-ink">
                    {customer?.name ?? "Cliente removido"}
                  </span>
                  <span className="block text-micro text-adm-ink-3">
                    Cliente desde {customer && formatDate(customer.createdAt)}
                  </span>
                </span>
              </div>

              <dl>
                <DataRow label="E-mail" value={customer?.email ?? "—"} />
                <DataRow label="Telefone" value={customer?.phone ?? "—"} mono />
                <DataRow label="CPF" value={customer?.cpf ?? "—"} mono />
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Entrega"
              action={
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyToClipboard(addressText);
                    if (ok) toast.success("Endereço copiado");
                  }}
                  className="adm-no-print inline-flex items-center gap-1 text-micro font-medium text-adm-accent hover:underline"
                >
                  <Copy size={11} />
                  Copiar
                </button>
              }
            />
            <CardBody className="py-3">
              <address className="not-italic text-[13px] leading-relaxed text-adm-ink-2">
                {address.street}, {address.number}
                {address.complement && ` — ${address.complement}`}
                <br />
                {address.district} · {address.city} - {address.state}
                <br />
                CEP {address.zip}
              </address>

              <dl className="mt-3 border-t border-adm-line pt-2">
                <DataRow label="Modalidade" value={order.shipping.label} />
                <DataRow
                  label="Prazo"
                  value={
                    order.shipping.estimateDays === 0
                      ? "Retirada imediata"
                      : `${order.shipping.estimateDays} dia${order.shipping.estimateDays > 1 ? "s" : ""} úte${order.shipping.estimateDays > 1 ? "is" : "l"}`
                  }
                />
                <DataRow
                  label="Rastreio"
                  value={
                    order.shipping.trackingCode ? (
                      <span className="tabular-nums">
                        {order.shipping.trackingCode}
                      </span>
                    ) : (
                      <span className="text-adm-ink-3">Não informado</span>
                    )
                  }
                />
                {order.shipping.shippedAt && (
                  <DataRow
                    label="Enviado em"
                    value={formatDate(order.shipping.shippedAt)}
                  />
                )}
                {order.shipping.deliveredAt && (
                  <DataRow
                    label="Entregue em"
                    value={formatDate(order.shipping.deliveredAt)}
                  />
                )}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Pagamento" />
            <CardBody className="py-3">
              <div className="mb-2 flex items-center gap-2">
                <CreditCard size={15} className="text-adm-ink-3" />
                <span className="text-[13px] text-adm-ink">
                  {PAYMENT_METHOD[order.payment.method]}
                  {order.payment.installments > 1 &&
                    ` · ${order.payment.installments}x de ${formatBRL(order.total / order.payment.installments)}`}
                </span>
              </div>

              <dl>
                <DataRow
                  label="Situação"
                  value={
                    <Badge
                      size="sm"
                      tone={PAYMENT_STATUS[order.payment.status].tone}
                      dot
                    >
                      {PAYMENT_STATUS[order.payment.status].label}
                    </Badge>
                  }
                />
                {order.payment.cardBrand && (
                  <DataRow
                    label="Cartão"
                    value={`${order.payment.cardBrand} •••• ${order.payment.cardLast4}`}
                    mono
                  />
                )}
                <DataRow
                  label="Transação"
                  value={
                    <span className="text-micro tabular-nums">
                      {order.payment.transactionId}
                    </span>
                  }
                />
                {order.payment.paidAt && (
                  <DataRow
                    label="Aprovado em"
                    value={formatDateTime(order.payment.paidAt)}
                  />
                )}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Linha do tempo" />
            <CardBody className="py-4">
              <ol className="relative flex flex-col gap-4">
                {/* Fio contínuo ligando os marcos */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 left-[5px] top-2 w-px bg-adm-line"
                />
                {[...order.timeline].reverse().map((event, index) => (
                  <li key={event.id} className="relative flex gap-3 pl-0">
                    <span
                      aria-hidden="true"
                      className={
                        index === 0
                          ? "relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-adm-accent bg-adm-surface"
                          : "relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-adm-line bg-adm-surface"
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-adm-ink">
                        {event.label}
                      </p>
                      {event.detail && (
                        <p className="mt-0.5 text-micro leading-relaxed text-adm-ink-3">
                          {event.detail}
                        </p>
                      )}
                      <p className="mt-0.5 text-micro text-adm-ink-3">
                        {formatDate(event.at)} às {formatTime(event.at)} ·{" "}
                        {event.author}
                        <span className="text-adm-ink-3/70">
                          {" "}
                          · {formatRelative(event.at)}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <p className="flex items-center gap-1.5 px-1 text-micro text-adm-ink-3 adm-no-print">
            <FileText size={12} />
            Última atualização {formatRelative(order.updatedAt)}
          </p>
        </div>
      </div>

      <Modal
        open={trackingOpen}
        onClose={() => setTrackingOpen(false)}
        title="Rastreio da entrega"
        description="Informe a transportadora e o código enviado ao cliente."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTrackingOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={saveTracking}>
              Salvar rastreio
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Select
            label="Transportadora"
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            options={[
              { value: "Correios", label: "Correios" },
              { value: "Loggi", label: "Loggi" },
              { value: "Jadlog", label: "Jadlog" },
              { value: "Entrega própria", label: "Entrega própria" },
            ]}
          />
          <Input
            label="Código de rastreio"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="PB123456789BR"
            hint="O cliente recebe este código por e-mail automaticamente."
          />
        </div>
      </Modal>
    </>
  );
}
