"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CreditCard,
  Link2,
  Mail,
  Save,
  Search,
  Shield,
  Truck,
  Users,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { formatRelative } from "@/lib/admin/datetime";
import { STAFF_ROLE } from "@/lib/admin/labels";
import { useAdmin } from "@/lib/admin/store";
import type { StoreSettings } from "@/lib/admin/types";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataRow,
  Input,
  PageHeader,
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
  useToast,
} from "@/components/admin/ui";

/**
 * Configurações.
 *
 * Separadas em módulos porque são consultadas por motivos
 * diferentes e por pessoas diferentes: quem ajusta frete raramente
 * mexe em SEO. As alterações só valem ao salvar — configuração que
 * aplica sozinha a cada tecla é fonte de acidente.
 */

type Module =
  | "loja"
  | "pagamento"
  | "frete"
  | "emails"
  | "usuarios"
  | "seguranca"
  | "seo"
  | "integracoes";

export function SettingsScreen() {
  const { settings, staff, dispatch } = useAdmin();
  const toast = useToast();

  const [module, setModule] = useState<Module>("loja");
  const [draft, setDraft] = useState<StoreSettings>(settings);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(settings),
    [draft, settings],
  );

  const set = <K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const save = () => {
    dispatch({ type: "settings/save", settings: draft });
    toast.success("Configurações salvas");
  };

  const modules: { value: Module; label: string; icon: typeof Building2 }[] = [
    { value: "loja", label: "Loja", icon: Building2 },
    { value: "pagamento", label: "Pagamento", icon: CreditCard },
    { value: "frete", label: "Frete", icon: Truck },
    { value: "emails", label: "E-mails", icon: Mail },
    { value: "usuarios", label: "Usuários", icon: Users },
    { value: "seguranca", label: "Segurança", icon: Shield },
    { value: "seo", label: "SEO", icon: Search },
    { value: "integracoes", label: "Integrações", icon: Link2 },
  ];

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dados da loja, regras de venda, equipe e integrações"
        actions={
          <Button
            variant="primary"
            icon={Save}
            onClick={save}
            disabled={!dirty}
          >
            Salvar alterações
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[13rem_1fr]">
        {/* Navegação dos módulos */}
        <nav
          aria-label="Módulos de configuração"
          className="min-w-0 lg:sticky lg:top-[4.5rem] lg:self-start"
        >
          <div className="min-w-0 lg:hidden">
            <Tabs
              ariaLabel="Módulos de configuração"
              variant="pill"
              value={module}
              onChange={setModule}
              items={modules}
            />
          </div>
          <ul className="hidden flex-col gap-px lg:flex">
            {modules.map((item) => (
              <li key={item.value}>
                <button
                  type="button"
                  onClick={() => setModule(item.value)}
                  aria-current={module === item.value ? "true" : undefined}
                  className={
                    module === item.value
                      ? "flex w-full items-center gap-2.5 rounded-adm bg-adm-surface px-3 py-2 text-left text-[13px] font-medium text-adm-ink shadow-adm"
                      : "flex w-full items-center gap-2.5 rounded-adm px-3 py-2 text-left text-[13px] text-adm-ink-2 transition-colors hover:bg-adm-surface"
                  }
                >
                  <item.icon size={15} className="shrink-0" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          {module === "loja" && (
            <Card>
              <CardHeader
                title="Dados da loja"
                description="Aparecem no rodapé, nas notas e nos e-mails ao cliente"
              />
              <CardBody className="grid max-w-2xl gap-4 sm:grid-cols-2">
                <Input
                  label="Nome fantasia"
                  value={draft.storeName}
                  onChange={(event) => set("storeName", event.target.value)}
                  containerClassName="sm:col-span-2"
                />
                <Input
                  label="Razão social"
                  value={draft.legalName}
                  onChange={(event) => set("legalName", event.target.value)}
                />
                <Input
                  label="CNPJ"
                  value={draft.cnpj}
                  onChange={(event) => set("cnpj", event.target.value)}
                />
                <Input
                  label="E-mail de contato"
                  type="email"
                  value={draft.email}
                  onChange={(event) => set("email", event.target.value)}
                />
                <Input
                  label="Telefone"
                  value={draft.phone}
                  onChange={(event) => set("phone", event.target.value)}
                />
                <Input
                  label="WhatsApp"
                  value={draft.whatsapp}
                  onChange={(event) => set("whatsapp", event.target.value)}
                />
                <Input
                  label="Instagram"
                  value={draft.instagram}
                  onChange={(event) => set("instagram", event.target.value)}
                />

                <div className="border-t border-adm-line pt-4 sm:col-span-2">
                  <p className="mb-3 text-[13px] font-medium text-adm-ink">
                    Endereço
                  </p>
                  <div className="grid gap-4 sm:grid-cols-6">
                    <Input
                      label="CEP"
                      value={draft.address.zip}
                      containerClassName="sm:col-span-2"
                      onChange={(event) =>
                        set("address", { ...draft.address, zip: event.target.value })
                      }
                    />
                    <Input
                      label="Rua"
                      value={draft.address.street}
                      containerClassName="sm:col-span-3"
                      onChange={(event) =>
                        set("address", {
                          ...draft.address,
                          street: event.target.value,
                        })
                      }
                    />
                    <Input
                      label="Número"
                      value={draft.address.number}
                      onChange={(event) =>
                        set("address", {
                          ...draft.address,
                          number: event.target.value,
                        })
                      }
                    />
                    <Input
                      label="Bairro"
                      value={draft.address.district}
                      containerClassName="sm:col-span-2"
                      onChange={(event) =>
                        set("address", {
                          ...draft.address,
                          district: event.target.value,
                        })
                      }
                    />
                    <Input
                      label="Cidade"
                      value={draft.address.city}
                      containerClassName="sm:col-span-3"
                      onChange={(event) =>
                        set("address", {
                          ...draft.address,
                          city: event.target.value,
                        })
                      }
                    />
                    <Input
                      label="UF"
                      value={draft.address.state}
                      maxLength={2}
                      onChange={(event) =>
                        set("address", {
                          ...draft.address,
                          state: event.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {module === "pagamento" && (
            <Card>
              <CardHeader
                title="Regras de pagamento"
                description="Valem para o checkout da loja"
              />
              <CardBody className="max-w-2xl">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Desconto no Pix"
                    type="number"
                    min={0}
                    max={30}
                    suffix="%"
                    value={draft.pixDiscountPercent}
                    onChange={(event) =>
                      set("pixDiscountPercent", Number(event.target.value))
                    }
                  />
                  <Input
                    label="Parcelas máximas"
                    type="number"
                    min={1}
                    max={12}
                    suffix="x"
                    value={draft.maxInstallments}
                    onChange={(event) =>
                      set("maxInstallments", Number(event.target.value))
                    }
                  />
                  <Input
                    label="Parcela mínima"
                    type="number"
                    min={0}
                    prefix="R$"
                    value={draft.minInstallmentValue}
                    onChange={(event) =>
                      set("minInstallmentValue", Number(event.target.value))
                    }
                  />
                </div>

                <div className="mt-5 rounded-adm border border-adm-line bg-adm-raised p-4">
                  <p className="text-[13px] font-medium text-adm-ink">
                    Como fica para o cliente
                  </p>
                  <dl className="mt-2 max-w-sm">
                    <DataRow
                      label="Compra de R$ 400 no Pix"
                      mono
                      value={formatBRL(400 * (1 - draft.pixDiscountPercent / 100))}
                    />
                    <DataRow
                      label="Mesma compra parcelada"
                      mono
                      value={`${Math.min(
                        draft.maxInstallments,
                        Math.max(1, Math.floor(400 / draft.minInstallmentValue)),
                      )}× de ${formatBRL(
                        400 /
                          Math.min(
                            draft.maxInstallments,
                            Math.max(
                              1,
                              Math.floor(400 / draft.minInstallmentValue),
                            ),
                          ),
                      )}`}
                    />
                  </dl>
                </div>
              </CardBody>
            </Card>
          )}

          {module === "frete" && (
            <Card>
              <CardHeader
                title="Frete e entrega"
                description="Valores usados no cálculo do checkout"
              />
              <CardBody className="max-w-2xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Frete grátis a partir de"
                    type="number"
                    min={0}
                    prefix="R$"
                    value={draft.freeShippingThreshold}
                    hint="Vale para entrega padrão."
                    onChange={(event) =>
                      set("freeShippingThreshold", Number(event.target.value))
                    }
                  />
                  <Input
                    label="Entrega local (Cabreúva)"
                    type="number"
                    min={0}
                    prefix="R$"
                    value={draft.localDeliveryFee}
                    hint="Zero mantém a entrega local gratuita."
                    onChange={(event) =>
                      set("localDeliveryFee", Number(event.target.value))
                    }
                  />
                  <Input
                    label="Entrega padrão"
                    type="number"
                    min={0}
                    prefix="R$"
                    value={draft.standardShippingFee}
                    onChange={(event) =>
                      set("standardShippingFee", Number(event.target.value))
                    }
                  />
                  <Input
                    label="Entrega expressa"
                    type="number"
                    min={0}
                    prefix="R$"
                    value={draft.expressShippingFee}
                    onChange={(event) =>
                      set("expressShippingFee", Number(event.target.value))
                    }
                  />
                  <Input
                    label="Alerta de estoque baixo"
                    type="number"
                    min={0}
                    suffix="un."
                    value={draft.lowStockAlert}
                    hint="Piso do alerta quando o produto não tem mínimo próprio."
                    onChange={(event) =>
                      set("lowStockAlert", Number(event.target.value))
                    }
                  />
                </div>
              </CardBody>
            </Card>
          )}

          {module === "emails" && (
            <Card>
              <CardHeader
                title="E-mails automáticos"
                description="Mensagens disparadas pela loja"
              />
              <CardBody className="flex max-w-2xl flex-col gap-4">
                {(
                  [
                    ["orderPlaced", "Pedido recebido", "Confirmação enviada logo após a compra."],
                    ["paymentApproved", "Pagamento aprovado", "Avisa que o pedido entrou em preparação."],
                    ["orderShipped", "Pedido enviado", "Inclui o código de rastreio."],
                    ["orderDelivered", "Pedido entregue", "Fecha o ciclo e agradece a compra."],
                    ["abandonedCart", "Carrinho abandonado", "Lembrete 24h após o abandono."],
                    ["reviewRequest", "Convite para avaliar", "Enviado 7 dias após a entrega."],
                  ] as const
                ).map(([key, label, description]) => (
                  <Toggle
                    key={key}
                    checked={draft.emails[key]}
                    onChange={(value) =>
                      set("emails", { ...draft.emails, [key]: value })
                    }
                    label={label}
                    description={description}
                  />
                ))}
              </CardBody>
            </Card>
          )}

          {module === "usuarios" && (
            <Card className="overflow-hidden">
              <CardHeader
                title="Equipe"
                description={`${staff.filter((user) => user.active).length} ${
                  staff.filter((user) => user.active).length === 1
                    ? "usuário"
                    : "usuários"
                } com acesso ao painel`}
              />
              <TableWrap>
                <Table minWidth="34rem">
                  <THead sticky={false}>
                    <tr>
                      <Th>Usuário</Th>
                      <Th width="9rem">Perfil</Th>
                      <Th width="10rem">Último acesso</Th>
                      <Th width="7rem">Situação</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {staff.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <span className="flex items-center gap-2.5">
                            <span
                              aria-hidden="true"
                              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-adm-sunken text-micro font-medium text-adm-ink-2"
                            >
                              {user.initials}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-medium text-adm-ink">
                                {user.name}
                              </span>
                              <span className="block truncate text-micro text-adm-ink-3">
                                {user.email}
                              </span>
                            </span>
                          </span>
                        </Td>
                        <Td>{STAFF_ROLE[user.role]}</Td>
                        <Td muted>{formatRelative(user.lastAccessAt)}</Td>
                        <Td>
                          <Badge
                            size="sm"
                            tone={user.active ? "ok" : "neutral"}
                            dot
                          >
                            {user.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
              <CardBody className="border-t border-adm-line py-3">
                <p className="text-micro text-adm-ink-3">
                  Convites e permissões dependem de autenticação real — entram
                  junto com o back-end.
                </p>
              </CardBody>
            </Card>
          )}

          {module === "seguranca" && (
            <Card>
              <CardHeader
                title="Segurança"
                description="Proteção do acesso ao painel"
              />
              <CardBody className="flex max-w-2xl flex-col gap-4">
                <Toggle
                  checked
                  disabled
                  onChange={() => undefined}
                  label="Sessão expira após 12 horas"
                  description="Recomendado para computadores compartilhados na loja."
                />
                <Toggle
                  checked={false}
                  disabled
                  onChange={() => undefined}
                  label="Verificação em duas etapas"
                  description="Exige código adicional no login. Requer back-end."
                />
                <Toggle
                  checked
                  disabled
                  onChange={() => undefined}
                  label="Registrar ações da equipe"
                  description="Cada alteração de pedido e estoque guarda autor e horário."
                />
                <div className="rounded-adm border border-adm-info/25 bg-adm-info-bg p-3">
                  <p className="text-[12.5px] leading-relaxed text-adm-info">
                    Estas opções estão fixas nesta versão: sem servidor não há
                    sessão real para expirar nem segundo fator para validar.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {module === "seo" && (
            <Card>
              <CardHeader
                title="SEO da loja"
                description="Como a loja aparece em buscadores e redes"
              />
              <CardBody className="flex max-w-2xl flex-col gap-4">
                <Input
                  label="Título padrão"
                  value={draft.seoTitle}
                  aside={`${draft.seoTitle.length}/60`}
                  onChange={(event) => set("seoTitle", event.target.value)}
                />
                <Textarea
                  label="Descrição padrão"
                  rows={3}
                  value={draft.seoDescription}
                  aside={`${draft.seoDescription.length}/160`}
                  onChange={(event) => set("seoDescription", event.target.value)}
                />
                <div className="rounded-adm border border-adm-line bg-adm-raised p-4">
                  <p className="mb-2 text-micro font-medium uppercase text-adm-ink-3">
                    Prévia
                  </p>
                  <p className="truncate text-[15px] text-adm-info">
                    {draft.seoTitle}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-adm-ink-2">
                    {draft.seoDescription}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {module === "integracoes" && (
            <Card>
              <CardHeader
                title="Integrações"
                description="Serviços conectados à loja"
              />
              <ul className="divide-y divide-adm-line">
                {draft.integrations.map((integration) => (
                  <li
                    key={integration.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-adm-ink">
                        {integration.name}
                      </p>
                      <p className="mt-0.5 text-micro text-adm-ink-3">
                        {integration.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge
                        size="sm"
                        tone={integration.connected ? "ok" : "neutral"}
                        dot
                      >
                        {integration.connected ? "Conectado" : "Desconectado"}
                      </Badge>
                      <Button
                        size="sm"
                        variant={integration.connected ? "ghost" : "secondary"}
                        onClick={() =>
                          set(
                            "integrations",
                            draft.integrations.map((item) =>
                              item.id === integration.id
                                ? { ...item, connected: !item.connected }
                                : item,
                            ),
                          )
                        }
                      >
                        {integration.connected ? "Desconectar" : "Conectar"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {dirty && (
        <div className="sticky bottom-4 z-30 mt-4 flex items-center justify-between gap-3 rounded-adm-lg border border-adm-line bg-adm-surface px-4 py-2.5 shadow-adm-pop">
          <p className="text-[12.5px] text-adm-ink-2">
            Você alterou as configurações e ainda não salvou.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDraft(settings)}>
              Descartar
            </Button>
            <Button variant="primary" size="sm" icon={Save} onClick={save}>
              Salvar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
