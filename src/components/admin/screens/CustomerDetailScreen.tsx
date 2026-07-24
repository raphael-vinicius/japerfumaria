"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Search,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { waLink } from "@/lib/brand";
import { formatDate, formatDateTime, formatRelative } from "@/lib/admin/datetime";
import { copyToClipboard } from "@/lib/admin/export";
import { CUSTOMER_TAG, ORDER_STATUS } from "@/lib/admin/labels";
import { customerStats } from "@/lib/admin/metrics";
import { useAdmin } from "@/lib/admin/store";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  DataRow,
  EmptyState,
  PageHeader,
  StatsCard,
  StatusBadge,
  Table,
  TableWrap,
  TBody,
  Td,
  TdLink,
  Textarea,
  Th,
  THead,
  Tr,
  useToast,
} from "@/components/admin/ui";

/**
 * Ficha do cliente.
 *
 * Existe para responder, antes de um atendimento: quanto essa
 * pessoa já comprou, o que ela gosta, e se tem algo pendente. Por
 * isso o histórico de pedidos vem completo e as observações da
 * equipe ficam à mão — é o que evita o "deixa eu confirmar aqui".
 */
export function CustomerDetailScreen({ customerId }: { customerId: string }) {
  const { customers, orders, products, dispatch } = useAdmin();
  const toast = useToast();
  const [noteDraft, setNoteDraft] = useState("");

  const customer = customers.find((item) => item.id === customerId);

  const own = useMemo(
    () =>
      orders
        .filter((order) => order.customerId === customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders, customerId],
  );

  const stats = useMemo(
    () => customerStats(customerId, orders, products),
    [customerId, orders, products],
  );

  const favorites = useMemo(() => {
    const map = new Map<string, { name: string; units: number }>();
    for (const order of own) {
      if (order.status === "cancelado") continue;
      for (const item of order.items) {
        const current = map.get(item.productId) ?? {
          name: item.name,
          units: 0,
        };
        current.units += item.quantity;
        map.set(item.productId, current);
      }
    }
    return [...map.entries()]
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 4);
  }, [own]);

  if (!customer) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={Search}
            title="Cliente não encontrado"
            description="Este cadastro não existe mais."
            action={
              <ButtonLink href="/admin/clientes">Voltar para clientes</ButtonLink>
            }
          />
        </CardBody>
      </Card>
    );
  }

  const addNote = () => {
    if (!noteDraft.trim()) return;
    dispatch({
      type: "customer/note",
      customerId: customer.id,
      body: noteDraft.trim(),
    });
    setNoteDraft("");
    toast.success("Observação registrada");
  };

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Clientes", href: "/admin/clientes" },
          { label: customer.name },
        ]}
        title={customer.name}
        description={`Cliente desde ${formatDate(customer.createdAt)} · ${customer.addresses[0]?.city ?? ""}`}
        meta={
          <>
            {customer.tags.map((tag) => (
              <Badge key={tag} size="sm" tone={CUSTOMER_TAG[tag].tone} dot>
                {CUSTOMER_TAG[tag].label}
              </Badge>
            ))}
          </>
        }
        actions={
          <>
            <ButtonLink
              href={waLink(
                `Olá, ${customer.name.split(" ")[0]}! Aqui é da JA Store Perfumaria.`,
              )}
              icon={MessageCircle}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </ButtonLink>
            <ButtonLink href={`mailto:${customer.email}`} icon={Mail}>
              E-mail
            </ButtonLink>
          </>
        }
      />

      <div className="mb-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total gasto"
          value={formatBRL(stats.totalSpent)}
          hint="Pedidos não cancelados"
        />
        <StatsCard
          label="Pedidos"
          value={String(stats.orderCount)}
          hint={
            own.length !== stats.orderCount
              ? `${own.length - stats.orderCount} cancelado(s)`
              : "Nenhum cancelamento"
          }
        />
        <StatsCard
          label="Ticket médio"
          value={formatBRL(stats.averageTicket)}
          hint="Por pedido"
        />
        <StatsCard
          label="Última compra"
          value={
            stats.lastOrderAt ? formatRelative(stats.lastOrderAt) : "Nunca"
          }
          hint={
            stats.lastOrderAt ? formatDate(stats.lastOrderAt) : "Sem histórico"
          }
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader
              title="Histórico de pedidos"
              description={`${own.length} ${own.length === 1 ? "pedido" : "pedidos"}`}
            />
            {own.length === 0 ? (
              <CardBody>
                <EmptyState
                  compact
                  title="Nenhum pedido ainda"
                  description="Este cliente se cadastrou mas ainda não comprou."
                />
              </CardBody>
            ) : (
              <TableWrap>
                <Table minWidth="36rem">
                  <THead sticky={false}>
                    <tr>
                      <Th width="6rem">Pedido</Th>
                      <Th width="7rem">Data</Th>
                      <Th>Itens</Th>
                      <Th width="9.5rem">Status</Th>
                      <Th align="right" width="7rem">
                        Valor
                      </Th>
                    </tr>
                  </THead>
                  <TBody>
                    {own.map((order) => (
                      <Tr key={order.id} href={`/admin/pedidos/${order.number}`}>
                        <TdLink href={`/admin/pedidos/${order.number}`}>
                          #{order.number}
                        </TdLink>
                        <Td muted>{formatDate(order.createdAt)}</Td>
                        <Td className="max-w-[16rem] truncate">
                          {order.items.map((item) => item.name).join(", ")}
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
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Observações da equipe"
              description="Contexto que ajuda no próximo atendimento"
            />
            {customer.notes.length > 0 && (
              <ul className="divide-y divide-adm-line">
                {customer.notes.map((note) => (
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
                placeholder="Ex.: prefere receber depois das 18h; gosta de árabes doces."
                aria-label="Nova observação sobre o cliente"
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

        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader title="Contato" />
            <CardBody className="py-3">
              <dl>
                <DataRow
                  label="E-mail"
                  value={
                    <span className="break-all">{customer.email}</span>
                  }
                />
                <DataRow label="Telefone" value={customer.phone} mono />
                <DataRow label="CPF" value={customer.cpf} mono />
                {customer.birthDate && (
                  <DataRow
                    label="Nascimento"
                    value={formatDate(customer.birthDate)}
                  />
                )}
                <DataRow
                  label="Marketing"
                  value={
                    customer.acceptsMarketing ? "Aceita receber" : "Não aceita"
                  }
                />
              </dl>
              <Button
                size="sm"
                icon={Copy}
                className="mt-3"
                fullWidth
                onClick={async () => {
                  const ok = await copyToClipboard(
                    `${customer.name}\n${customer.email}\n${customer.phone}`,
                  );
                  if (ok) toast.success("Contato copiado");
                }}
              >
                Copiar contato
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Endereços"
              description={`${customer.addresses.length} cadastrado${customer.addresses.length > 1 ? "s" : ""}`}
            />
            <ul className="divide-y divide-adm-line">
              {customer.addresses.map((address, index) => (
                <li key={index} className="px-5 py-3">
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={13}
                      className="mt-0.5 shrink-0 text-adm-ink-3"
                    />
                    <address className="not-italic text-[12.5px] leading-relaxed text-adm-ink-2">
                      {address.street}, {address.number}
                      {address.complement && ` — ${address.complement}`}
                      <br />
                      {address.district} · {address.city} - {address.state}
                      <br />
                      CEP {address.zip}
                    </address>
                  </div>
                  {index === 0 && (
                    <Badge size="sm" className="mt-2">
                      Principal
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          {favorites.length > 0 && (
            <Card>
              <CardHeader
                title="Preferências"
                description={
                  stats.favoriteCategory
                    ? `Compra mais em ${stats.favoriteCategory}`
                    : undefined
                }
              />
              <ul className="divide-y divide-adm-line">
                {favorites.map(([id, item]) => (
                  <li
                    key={id}
                    className="flex items-center justify-between gap-3 px-5 py-2.5"
                  >
                    <span className="min-w-0 truncate text-[12.5px] text-adm-ink-2">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-micro tabular-nums text-adm-ink-3">
                      {item.units} un.
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <CardBody className="py-4">
              <p className="flex items-center gap-2 text-micro text-adm-ink-3">
                <Phone size={12} />
                Primeiro pedido em{" "}
                {stats.firstOrderAt ? formatDate(stats.firstOrderAt) : "—"}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
