"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Package,
  Save,
  Search,
  Tag,
  Truck,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { siteUrl } from "@/lib/brand";
import { formatDateTime, formatRelative } from "@/lib/admin/datetime";
import { FAMILY, GENDER, ORIGIN, PRODUCT_STATUS } from "@/lib/admin/labels";
import { movementsOf, stockRows } from "@/lib/admin/metrics";
import { useAdmin } from "@/lib/admin/store";
import type { AdminProduct, ProductStatus } from "@/lib/admin/types";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  DataRow,
  EmptyState,
  Input,
  PageHeader,
  Select,
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
  useToast,
} from "@/components/admin/ui";

/**
 * Editor de produto.
 *
 * Dividido em abas porque um formulário único com 25 campos faz
 * qualquer alteração custar rolagem. Cada aba é uma decisão
 * diferente: "o que é", "como é descrito", "quanto custa", "como
 * é encontrado". O estoque aparece em modo leitura — quem altera
 * saldo é a tela de Estoque, que registra o movimento. Editar o
 * número aqui criaria um saldo sem história.
 */

type TabId =
  | "informacoes"
  | "descricao"
  | "imagens"
  | "preco"
  | "seo"
  | "estoque"
  | "entrega";

const blankProduct = (): AdminProduct => ({
  id: `p-novo-${Date.now()}`,
  slug: "",
  name: "",
  brand: "",
  origin: "importado",
  gender: "unissex",
  family: "amadeirado",
  categorySlug: "arabes",
  subtitle: "",
  description: "",
  notes: { top: [], heart: [], base: [] },
  sizeMl: 100,
  concentration: "EDP",
  price: 0,
  stock: 0,
  rating: 0,
  reviewCount: 0,
  longevity: 3,
  sillage: 3,
  accent: "#8A5A34",
  accent2: "#CBA06A",
  bottle: "flacon",
  sku: "",
  status: "rascunho",
  cost: 0,
  barcode: "",
  weightGrams: 280,
  dimensionsCm: { length: 10, width: 8, height: 15 },
  fragile: true,
  stockMin: 3,
  supplier: "",
  seoTitle: "",
  seoDescription: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function ProductEditorScreen({ productId }: { productId: string }) {
  const router = useRouter();
  const { products, categories, orders, movements, dispatch } = useAdmin();
  const toast = useToast();

  const isNew = productId === "novo";
  const original = products.find((item) => item.id === productId);

  const [draft, setDraft] = useState<AdminProduct>(
    () => original ?? blankProduct(),
  );
  const [tab, setTab] = useState<TabId>("informacoes");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(original ?? blankProduct()),
    [draft, original],
  );

  const stock = useMemo(() => {
    const row = stockRows(products, orders).find(
      (item) => item.product.id === productId,
    );
    return row;
  }, [products, orders, productId]);

  const history = useMemo(
    () => movementsOf(movements, productId).slice(0, 8),
    [movements, productId],
  );

  if (!isNew && !original) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={Search}
            title="Produto não encontrado"
            description="Este produto não existe mais no catálogo."
            action={
              <ButtonLink href="/admin/produtos" icon={ArrowLeft}>
                Voltar para produtos
              </ButtonLink>
            }
          />
        </CardBody>
      </Card>
    );
  }

  const set = <K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const slugify = (value: string) =>
    value
      .normalize("NFD")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const save = () => {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = "Informe o nome do produto.";
    if (!draft.brand.trim()) next.brand = "Informe a marca.";
    if (!draft.sku.trim()) next.sku = "Informe o SKU.";
    if (draft.price <= 0) next.price = "O preço precisa ser maior que zero.";
    if (
      products.some(
        (item) => item.sku === draft.sku.trim() && item.id !== draft.id,
      )
    )
      next.sku = "Já existe outro produto com este SKU.";

    setErrors(next);
    if (Object.keys(next).length) {
      const firstTab: TabId = next.price ? "preco" : "informacoes";
      setTab(firstTab);
      toast.error("Revise os campos destacados", {
        description: "Alguns dados obrigatórios estão faltando.",
      });
      return;
    }

    const product: AdminProduct = {
      ...draft,
      slug: draft.slug.trim() || slugify(`${draft.brand} ${draft.name}`),
      seoTitle:
        draft.seoTitle.trim() ||
        `${draft.name} ${draft.brand} ${draft.sizeMl}ml | JA Store Perfumaria`,
      seoDescription:
        draft.seoDescription.trim() || draft.description.slice(0, 155),
    };

    dispatch({ type: "product/save", product });
    toast.success(isNew ? "Produto criado" : "Alterações salvas", {
      description: product.name,
    });
    if (isNew) router.replace(`/admin/produtos/${product.id}`);
    else setDraft(product);
  };

  const margin =
    draft.price > 0 ? ((draft.price - draft.cost) / draft.price) * 100 : 0;

  const tabs: { value: TabId; label: string; icon: typeof Tag }[] = [
    { value: "informacoes", label: "Informações", icon: Tag },
    { value: "descricao", label: "Descrição", icon: FileText },
    { value: "imagens", label: "Imagens", icon: ImageIcon },
    { value: "preco", label: "Preço", icon: Package },
    { value: "seo", label: "SEO", icon: Search },
    { value: "estoque", label: "Estoque", icon: Box },
    { value: "entrega", label: "Entrega", icon: Truck },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Produtos", href: "/admin/produtos" },
          { label: isNew ? "Novo produto" : draft.name || "Sem nome" },
        ]}
        title={isNew ? "Novo produto" : draft.name || "Sem nome"}
        description={
          isNew
            ? "Cadastre o produto e publique quando estiver pronto."
            : `${draft.brand} · SKU ${draft.sku} · atualizado ${formatRelative(draft.updatedAt)}`
        }
        meta={<StatusBadge status={PRODUCT_STATUS[draft.status]} />}
        actions={
          <>
            {!isNew && draft.status === "ativo" && (
              <ButtonLink
                href={`/produto/${draft.slug}`}
                icon={ExternalLink}
                target="_blank"
                rel="noreferrer"
              >
                Ver na loja
              </ButtonLink>
            )}
            <Button
              variant="primary"
              icon={Save}
              onClick={save}
              disabled={!dirty && !isNew}
            >
              {isNew ? "Criar produto" : "Salvar alterações"}
            </Button>
          </>
        }
      />

      {dirty && !isNew && (
        <div
          role="status"
          className="mb-3 flex items-center gap-2 rounded-adm border border-adm-warn/35 bg-adm-warn-bg px-3 py-2 text-[12.5px] text-adm-warn"
        >
          <AlertTriangle size={14} />
          Há alterações não salvas nesta ficha.
          <button
            type="button"
            onClick={() => setDraft(original ?? blankProduct())}
            className="ml-auto font-medium underline underline-offset-2"
          >
            Descartar
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-adm-line px-2">
          <Tabs
            ariaLabel="Seções do produto"
            value={tab}
            onChange={setTab}
            items={tabs}
          />
        </div>

        <CardBody className="p-5 sm:p-6">
          {/* ——————————————— Informações ——————————————— */}
          {tab === "informacoes" && (
            <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
              <Input
                label="Nome do produto"
                required
                value={draft.name}
                error={errors.name}
                onChange={(event) => set("name", event.target.value)}
                containerClassName="sm:col-span-2"
              />
              <Input
                label="Marca"
                required
                value={draft.brand}
                error={errors.brand}
                onChange={(event) => set("brand", event.target.value)}
              />
              <Select
                label="Categoria"
                value={draft.categorySlug}
                onChange={(event) => set("categorySlug", event.target.value)}
                options={categories.map((item) => ({
                  value: item.slug,
                  label: item.name,
                }))}
              />
              <Input
                label="SKU"
                required
                value={draft.sku}
                error={errors.sku}
                hint="Código interno usado na conferência física."
                onChange={(event) =>
                  set("sku", event.target.value.toUpperCase())
                }
              />
              <Input
                label="Código de barras (EAN)"
                value={draft.barcode}
                onChange={(event) => set("barcode", event.target.value)}
              />
              <Select
                label="Gênero"
                value={draft.gender}
                onChange={(event) =>
                  set("gender", event.target.value as AdminProduct["gender"])
                }
                options={Object.entries(GENDER).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Select
                label="Origem"
                value={draft.origin}
                onChange={(event) =>
                  set("origin", event.target.value as AdminProduct["origin"])
                }
                options={Object.entries(ORIGIN).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Select
                label="Família olfativa"
                value={draft.family}
                onChange={(event) =>
                  set("family", event.target.value as AdminProduct["family"])
                }
                options={Object.entries(FAMILY).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Select
                label="Concentração"
                value={draft.concentration}
                onChange={(event) =>
                  set(
                    "concentration",
                    event.target.value as AdminProduct["concentration"],
                  )
                }
                options={[
                  { value: "Parfum", label: "Parfum" },
                  { value: "EDP", label: "Eau de Parfum" },
                  { value: "EDT", label: "Eau de Toilette" },
                  { value: "Body Mist", label: "Body Mist" },
                ]}
              />
              <Input
                label="Volume (ml)"
                type="number"
                min={1}
                value={draft.sizeMl}
                onChange={(event) => set("sizeMl", Number(event.target.value))}
                suffix="ml"
              />
              <Input
                label="Fornecedor"
                value={draft.supplier}
                onChange={(event) => set("supplier", event.target.value)}
              />
              <Select
                label="Status"
                value={draft.status}
                hint="Só produtos ativos aparecem na vitrine."
                onChange={(event) =>
                  set("status", event.target.value as ProductStatus)
                }
                options={[
                  { value: "ativo", label: "Ativo — publicado" },
                  { value: "rascunho", label: "Rascunho — não publicado" },
                  { value: "arquivado", label: "Arquivado" },
                ]}
              />

              <div className="flex flex-col gap-3 border-t border-adm-line pt-4 sm:col-span-2">
                <p className="text-[13px] font-medium text-adm-ink">
                  Destaques na loja
                </p>
                <Toggle
                  checked={Boolean(draft.bestSeller)}
                  onChange={(value) => set("bestSeller", value)}
                  label="Mais vendido"
                  description="Aparece na seleção de best-sellers da home."
                />
                <Toggle
                  checked={Boolean(draft.featured)}
                  onChange={(value) => set("featured", value)}
                  label="Destaque"
                  description="Entra na vitrine de destaques e no herói da home."
                />
                <Toggle
                  checked={Boolean(draft.isNew)}
                  onChange={(value) => set("isNew", value)}
                  label="Novidade"
                  description="Ganha o selo de lançamento por 30 dias."
                />
              </div>
            </div>
          )}

          {/* ——————————————— Descrição ——————————————— */}
          {tab === "descricao" && (
            <div className="flex max-w-3xl flex-col gap-4">
              <Input
                label="Subtítulo"
                value={draft.subtitle}
                hint="Linha curta abaixo do nome — ex.: “Eau de Parfum 100ml”."
                onChange={(event) => set("subtitle", event.target.value)}
              />
              <Textarea
                label="Descrição"
                rows={6}
                value={draft.description}
                aside={`${draft.description.length} caracteres`}
                hint="Texto exibido na página do produto. Descreva o perfume, não a promoção."
                onChange={(event) => set("description", event.target.value)}
              />

              <div className="border-t border-adm-line pt-4">
                <p className="text-[13px] font-medium text-adm-ink">
                  Pirâmide olfativa
                </p>
                <p className="mt-0.5 text-micro text-adm-ink-3">
                  Separe as notas por vírgula.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {(["top", "heart", "base"] as const).map((layer) => (
                    <Input
                      key={layer}
                      label={
                        layer === "top"
                          ? "Notas de topo"
                          : layer === "heart"
                            ? "Notas de coração"
                            : "Notas de fundo"
                      }
                      value={draft.notes[layer].join(", ")}
                      onChange={(event) =>
                        set("notes", {
                          ...draft.notes,
                          [layer]: event.target.value
                            .split(",")
                            .map((note) => note.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-3 border-t border-adm-line pt-4 sm:grid-cols-2">
                <Input
                  label="Fixação (1 a 5)"
                  type="number"
                  min={1}
                  max={5}
                  value={draft.longevity}
                  onChange={(event) =>
                    set("longevity", Number(event.target.value))
                  }
                />
                <Input
                  label="Projeção (1 a 5)"
                  type="number"
                  min={1}
                  max={5}
                  value={draft.sillage}
                  onChange={(event) =>
                    set("sillage", Number(event.target.value))
                  }
                />
              </div>
            </div>
          )}

          {/* ——————————————— Imagens ——————————————— */}
          {tab === "imagens" && (
            <div className="max-w-3xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="grid h-40 w-40 shrink-0 place-items-center overflow-hidden rounded-adm-lg border border-adm-line bg-adm-raised">
                  {draft.image ? (
                    <Image
                      src={draft.image}
                      alt={`Prévia de ${draft.name}`}
                      width={130}
                      height={130}
                      className="h-32 w-32 object-contain"
                    />
                  ) : (
                    <span className="px-4 text-center text-micro text-adm-ink-3">
                      Sem imagem
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Input
                    label="Caminho da imagem"
                    value={draft.image ?? ""}
                    placeholder="/produtos/lattafa-asad.png"
                    hint="PNG com fundo transparente, lado maior de 1000px."
                    onChange={(event) =>
                      set("image", event.target.value || undefined)
                    }
                  />
                  <div className="mt-4 rounded-adm border border-dashed border-adm-line-strong bg-adm-raised p-4 text-center">
                    <ImageIcon
                      size={18}
                      className="mx-auto text-adm-ink-3"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-[12.5px] text-adm-ink-2">
                      Upload de arquivos exige armazenamento
                    </p>
                    <p className="mt-0.5 text-micro text-adm-ink-3">
                      Nesta versão as imagens vêm da pasta pública do
                      projeto. O envio direto entra junto com o back-end.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t border-adm-line pt-4 sm:grid-cols-2">
                <Input
                  label="Cor de fundo principal"
                  value={draft.accent}
                  hint="Usada no fundo do card do produto na loja."
                  onChange={(event) => set("accent", event.target.value)}
                />
                <Input
                  label="Cor de fundo secundária"
                  value={draft.accent2}
                  onChange={(event) => set("accent2", event.target.value)}
                />
              </div>
            </div>
          )}

          {/* ——————————————— Preço ——————————————— */}
          {tab === "preco" && (
            <div className="max-w-3xl">
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Preço de venda"
                  required
                  type="number"
                  step="0.01"
                  min={0}
                  prefix="R$"
                  value={draft.price}
                  error={errors.price}
                  onChange={(event) => set("price", Number(event.target.value))}
                />
                <Input
                  label="Preço comparativo"
                  type="number"
                  step="0.01"
                  min={0}
                  prefix="R$"
                  value={draft.compareAtPrice ?? ""}
                  hint="Riscado na loja."
                  onChange={(event) =>
                    set(
                      "compareAtPrice",
                      event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    )
                  }
                />
                <Input
                  label="Custo de aquisição"
                  type="number"
                  step="0.01"
                  min={0}
                  prefix="R$"
                  value={draft.cost}
                  hint="Não aparece na loja."
                  onChange={(event) => set("cost", Number(event.target.value))}
                />
              </div>

              <div className="mt-5 rounded-adm border border-adm-line bg-adm-raised p-4">
                <p className="text-[13px] font-medium text-adm-ink">
                  Resultado por unidade
                </p>
                <dl className="mt-2 max-w-sm">
                  <DataRow
                    label="Margem bruta"
                    mono
                    value={
                      <span
                        className={
                          margin >= 30
                            ? "font-medium text-adm-ok"
                            : margin > 0
                              ? "font-medium text-adm-warn"
                              : "font-medium text-adm-bad"
                        }
                      >
                        {margin.toFixed(1)}%
                      </span>
                    }
                  />
                  <DataRow
                    label="Lucro por venda"
                    mono
                    value={formatBRL(Math.max(0, draft.price - draft.cost))}
                  />
                  {draft.compareAtPrice ? (
                    <DataRow
                      label="Desconto exibido"
                      mono
                      value={`${Math.round(((draft.compareAtPrice - draft.price) / draft.compareAtPrice) * 100)}%`}
                    />
                  ) : null}
                  <DataRow
                    label="Parcelamento máximo"
                    mono
                    value={`10× de ${formatBRL(draft.price / 10)}`}
                  />
                </dl>
                {margin < 30 && draft.price > 0 && (
                  <p className="mt-3 flex items-start gap-1.5 text-micro text-adm-warn">
                    <AlertTriangle size={12} className="mt-px shrink-0" />
                    Margem abaixo de 30% — confira o custo antes de publicar.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ——————————————— SEO ——————————————— */}
          {tab === "seo" && (
            <div className="flex max-w-3xl flex-col gap-4">
              <Input
                label="URL do produto"
                value={draft.slug}
                prefix="/produto/"
                hint="Evite alterar depois de publicado: links antigos deixam de funcionar."
                onChange={(event) => set("slug", slugify(event.target.value))}
              />
              <Input
                label="Título para busca"
                value={draft.seoTitle}
                aside={`${draft.seoTitle.length}/60`}
                error={
                  draft.seoTitle.length > 60
                    ? "Acima de 60 caracteres o Google costuma cortar."
                    : undefined
                }
                onChange={(event) => set("seoTitle", event.target.value)}
              />
              <Textarea
                label="Descrição para busca"
                rows={3}
                value={draft.seoDescription}
                aside={`${draft.seoDescription.length}/160`}
                error={
                  draft.seoDescription.length > 160
                    ? "Acima de 160 caracteres o texto é truncado."
                    : undefined
                }
                onChange={(event) => set("seoDescription", event.target.value)}
              />

              <div className="rounded-adm border border-adm-line bg-adm-raised p-4">
                <p className="mb-2 text-micro font-medium uppercase tracking-wide text-adm-ink-3">
                  Prévia no Google
                </p>
                <div className="max-w-lg">
                  <p className="truncate text-micro text-adm-ink-3">
                    {siteUrl.replace(/^https?:\/\//, "")} › produto ›{" "}
                    {draft.slug || "sem-url"}
                  </p>
                  <p className="mt-0.5 truncate text-[15px] text-adm-info">
                    {draft.seoTitle || draft.name || "Título do produto"}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-adm-ink-2">
                    {draft.seoDescription ||
                      draft.description ||
                      "A descrição aparece aqui."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ——————————————— Estoque ——————————————— */}
          {tab === "estoque" && (
            <div className="max-w-3xl">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Em estoque", value: stock?.onHand ?? draft.stock },
                  { label: "Reservado", value: stock?.reserved ?? 0 },
                  { label: "Disponível", value: stock?.available ?? draft.stock },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-adm border border-adm-line bg-adm-raised px-4 py-3"
                  >
                    <p className="text-micro text-adm-ink-3">{item.label}</p>
                    <p className="mt-1 text-[20px] font-medium tabular-nums text-adm-ink">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <Input
                  label="Estoque mínimo"
                  type="number"
                  min={0}
                  value={draft.stockMin}
                  hint="Abaixo disso o produto entra no alerta de reposição."
                  containerClassName="w-40"
                  onChange={(event) =>
                    set("stockMin", Number(event.target.value))
                  }
                />
                <ButtonLink
                  href={`/admin/estoque?produto=${draft.id}`}
                  icon={Box}
                  className="mb-[1.35rem]"
                >
                  Registrar movimentação
                </ButtonLink>
              </div>

              <p className="mt-4 text-micro leading-relaxed text-adm-ink-3">
                O saldo não é editado aqui: toda alteração passa por uma
                entrada, saída ou ajuste na tela de Estoque, para que o
                histórico explique cada unidade.
              </p>

              {history.length > 0 && (
                <div className="mt-5 border-t border-adm-line pt-4">
                  <p className="mb-2 text-[13px] font-medium text-adm-ink">
                    Últimas movimentações
                  </p>
                  <TableWrap>
                    <Table minWidth="30rem">
                      <THead sticky={false}>
                        <tr>
                          <Th>Data</Th>
                          <Th>Tipo</Th>
                          <Th>Motivo</Th>
                          <Th align="right">Qtd.</Th>
                          <Th align="right">Saldo</Th>
                        </tr>
                      </THead>
                      <TBody>
                        {history.map((movement) => (
                          <Tr key={movement.id}>
                            <Td muted>{formatDateTime(movement.at)}</Td>
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
                            <Td className="max-w-[16rem] truncate">
                              {movement.reason}
                            </Td>
                            <Td numeric strong>
                              {movement.type === "saida" ? "−" : "+"}
                              {Math.abs(movement.quantity)}
                            </Td>
                            <Td numeric muted>
                              {movement.balanceAfter}
                            </Td>
                          </Tr>
                        ))}
                      </TBody>
                    </Table>
                  </TableWrap>
                </div>
              )}
            </div>
          )}

          {/* ——————————————— Entrega ——————————————— */}
          {tab === "entrega" && (
            <div className="max-w-3xl">
              <div className="grid gap-4 sm:grid-cols-4">
                <Input
                  label="Peso"
                  type="number"
                  min={0}
                  suffix="g"
                  value={draft.weightGrams}
                  onChange={(event) =>
                    set("weightGrams", Number(event.target.value))
                  }
                />
                {(["length", "width", "height"] as const).map((axis) => (
                  <Input
                    key={axis}
                    label={
                      axis === "length"
                        ? "Comprimento"
                        : axis === "width"
                          ? "Largura"
                          : "Altura"
                    }
                    type="number"
                    min={0}
                    suffix="cm"
                    value={draft.dimensionsCm[axis]}
                    onChange={(event) =>
                      set("dimensionsCm", {
                        ...draft.dimensionsCm,
                        [axis]: Number(event.target.value),
                      })
                    }
                  />
                ))}
              </div>

              <div className="mt-5 border-t border-adm-line pt-4">
                <Toggle
                  checked={draft.fragile}
                  onChange={(value) => set("fragile", value)}
                  label="Produto frágil"
                  description="Adiciona proteção extra na embalagem e sinaliza na etiqueta."
                />
              </div>

              <div className="mt-5 rounded-adm border border-adm-line bg-adm-raised p-4">
                <p className="text-[13px] font-medium text-adm-ink">
                  Como este produto é cotado
                </p>
                <dl className="mt-2 max-w-sm">
                  <DataRow
                    label="Peso cubado"
                    mono
                    value={`${(
                      (draft.dimensionsCm.length *
                        draft.dimensionsCm.width *
                        draft.dimensionsCm.height) /
                      6000
                    ).toFixed(2)} kg`}
                  />
                  <DataRow
                    label="Peso real"
                    mono
                    value={`${(draft.weightGrams / 1000).toFixed(3)} kg`}
                  />
                  <DataRow
                    label="Frete grátis"
                    value={
                      draft.price >= 299
                        ? "Sim, acima de R$ 299"
                        : "Não isoladamente"
                    }
                  />
                </dl>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {!isNew && (
        <Card className="mt-3">
          <CardHeader title="Registro" />
          <CardBody className="py-3">
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <DataRow label="Criado em" value={formatDateTime(draft.createdAt)} />
              <DataRow
                label="Última alteração"
                value={formatDateTime(draft.updatedAt)}
              />
              <DataRow label="Identificador" value={draft.id} mono />
              <DataRow
                label="Avaliações"
                value={`${draft.reviewCount} · nota ${draft.rating.toFixed(1)}`}
              />
            </dl>
          </CardBody>
        </Card>
      )}
    </>
  );
}
