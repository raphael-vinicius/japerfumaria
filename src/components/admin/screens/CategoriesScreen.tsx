"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ExternalLink,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Tags,
  Trash2,
} from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import type { AdminCategory } from "@/lib/admin/types";
import {
  Button,
  Card,
  Dropdown,
  EmptyState,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Select,
  Table,
  TableWrap,
  TBody,
  Td,
  Textarea,
  Th,
  THead,
  Tr,
  useConfirm,
  useToast,
} from "@/components/admin/ui";

/**
 * Categorias.
 *
 * A vitrine mostra cada categoria com a foto de um produto-símbolo,
 * então o editor pede exatamente isso — escolher o produto que
 * representa a categoria — em vez de um upload solto que teria de
 * ser mantido à parte.
 */
export function CategoriesScreen() {
  const { categories, products, dispatch } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();

  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products)
      map.set(
        product.categorySlug,
        (map.get(product.categorySlug) ?? 0) + 1,
      );
    return map;
  }, [products]);

  const heroImage = (category: AdminCategory) => {
    if (category.image) return category.image;
    const hero =
      products.find((p) => p.slug === category.heroSlug && p.image) ??
      products.find((p) => p.categorySlug === category.slug && p.image);
    return hero?.image;
  };

  const slugify = (value: string) =>
    value
      .normalize("NFD")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const openNew = () => {
    setIsNew(true);
    setErrors({});
    setEditing({
      slug: "",
      name: "",
      tagline: "",
      description: "",
      accent: "#8A5A34",
      accent2: "#CBA06A",
    });
  };

  const save = () => {
    if (!editing) return;
    const next: Record<string, string> = {};
    if (!editing.name.trim()) next.name = "Informe o nome da categoria.";
    const slug = editing.slug.trim() || slugify(editing.name);
    if (!slug) next.slug = "Informe a URL da categoria.";
    if (
      isNew &&
      categories.some((category) => category.slug === slug)
    )
      next.slug = "Já existe uma categoria com esta URL.";

    setErrors(next);
    if (Object.keys(next).length) return;

    const previousSlug = isNew ? undefined : editing.slug;
    dispatch({
      type: "category/save",
      category: { ...editing, slug },
      previousSlug,
    });
    toast.success(isNew ? "Categoria criada" : "Categoria atualizada", {
      description: editing.name,
    });
    setEditing(null);
  };

  const remove = async (category: AdminCategory) => {
    const linked = countByCategory.get(category.slug) ?? 0;
    if (linked > 0) {
      toast.error("Categoria com produtos vinculados", {
        description: `Mova os ${linked} produtos para outra categoria antes de excluir.`,
      });
      return;
    }
    const ok = await confirm({
      title: `Excluir a categoria “${category.name}”?`,
      description: "Ela deixa de aparecer na navegação da loja.",
      confirmLabel: "Excluir categoria",
    });
    if (!ok) return;
    dispatch({ type: "category/delete", slug: category.slug });
    toast.success("Categoria excluída");
  };

  return (
    <>
      <PageHeader
        title="Categorias"
        description={`${categories.length} categorias organizam ${products.length} produtos na vitrine`}
        actions={
          <Button variant="primary" icon={Plus} onClick={openNew}>
            Nova categoria
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <TableWrap>
          <Table minWidth="52rem">
            <THead>
              <tr>
                <Th>Categoria</Th>
                <Th width="10rem">URL</Th>
                <Th>Chamada</Th>
                <Th align="right" width="9rem">
                  Produtos
                </Th>
                <Th width="3rem">
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </THead>
            <TBody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12">
                    <EmptyState
                      icon={Tags}
                      title="Nenhuma categoria cadastrada"
                      description="As categorias organizam a navegação da loja."
                      action={
                        <Button icon={Plus} onClick={openNew}>
                          Criar a primeira
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const image = heroImage(category);
                  const linked = countByCategory.get(category.slug) ?? 0;

                  return (
                    <Tr key={category.slug}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <span
                            className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-adm border border-adm-line"
                            style={{
                              background: `linear-gradient(140deg, ${category.accent}18, ${category.accent2}30)`,
                            }}
                          >
                            {image ? (
                              <Image
                                src={image}
                                alt=""
                                width={30}
                                height={30}
                                className="h-[30px] w-[30px] object-contain"
                              />
                            ) : (
                              <Tags size={14} className="text-adm-ink-3" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <button
                              type="button"
                              onClick={() => {
                                setIsNew(false);
                                setErrors({});
                                setEditing(category);
                              }}
                              className="block truncate text-[13px] font-medium text-adm-ink hover:text-adm-accent"
                            >
                              {category.name}
                            </button>
                            <span className="block max-w-md truncate text-micro text-adm-ink-3">
                              {category.description}
                            </span>
                          </span>
                        </div>
                      </Td>

                      <Td muted className="text-micro">
                        /categoria/{category.slug}
                      </Td>

                      <Td className="max-w-[16rem] truncate">
                        {category.tagline}
                      </Td>

                      <Td numeric>
                        <Link
                          href={`/admin/produtos?categoria=${category.slug}`}
                          onClick={(event) => event.stopPropagation()}
                          className="font-medium text-adm-ink hover:text-adm-accent"
                        >
                          {linked}
                        </Link>
                        <span className="block text-micro text-adm-ink-3">
                          {linked === 1 ? "produto" : "produtos"}
                        </span>
                      </Td>

                      <Td>
                        <Dropdown
                          label={`Ações de ${category.name}`}
                          items={[
                            {
                              label: "Editar",
                              icon: Pencil,
                              onSelect: () => {
                                setIsNew(false);
                                setErrors({});
                                setEditing(category);
                              },
                            },
                            {
                              label: "Ver produtos",
                              icon: Package,
                              href: `/admin/produtos?categoria=${category.slug}`,
                            },
                            {
                              label: "Ver na loja",
                              icon: ExternalLink,
                              href: `/categoria/${category.slug}`,
                            },
                            {
                              label: "Excluir",
                              icon: Trash2,
                              tone: "danger",
                              separated: true,
                              onSelect: () => remove(category),
                            },
                          ]}
                          trigger={({ open, toggle }) => (
                            <IconButton
                              icon={MoreHorizontal}
                              label={`Ações de ${category.name}`}
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
        title={isNew ? "Nova categoria" : "Editar categoria"}
        description="Aparece na navegação e nas páginas de listagem da loja."
        persistent
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save}>
              {isNew ? "Criar categoria" : "Salvar"}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <Input
              label="Nome"
              required
              value={editing.name}
              error={errors.name}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  name: event.target.value,
                  slug:
                    isNew && !editing.slug
                      ? slugify(event.target.value)
                      : editing.slug,
                })
              }
            />
            <Input
              label="URL"
              required
              prefix="/categoria/"
              value={editing.slug}
              error={errors.slug}
              hint="Alterar a URL de uma categoria publicada quebra links antigos."
              onChange={(event) =>
                setEditing({ ...editing, slug: slugify(event.target.value) })
              }
            />
            <Input
              label="Chamada"
              value={editing.tagline}
              hint="Linha curta exibida sob o nome no card da categoria."
              onChange={(event) =>
                setEditing({ ...editing, tagline: event.target.value })
              }
            />
            <Textarea
              label="Descrição"
              rows={3}
              value={editing.description}
              onChange={(event) =>
                setEditing({ ...editing, description: event.target.value })
              }
            />
            <Select
              label="Produto-símbolo"
              value={editing.heroSlug ?? ""}
              hint="A foto deste produto ilustra a categoria na home."
              onChange={(event) =>
                setEditing({
                  ...editing,
                  heroSlug: event.target.value || undefined,
                })
              }
              options={[
                { value: "", label: "Escolher automaticamente" },
                ...products
                  .filter(
                    (product) =>
                      product.categorySlug === editing.slug && product.image,
                  )
                  .map((product) => ({
                    value: product.slug,
                    label: `${product.name} · ${product.brand}`,
                  })),
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Cor principal"
                value={editing.accent}
                onChange={(event) =>
                  setEditing({ ...editing, accent: event.target.value })
                }
              />
              <Input
                label="Cor secundária"
                value={editing.accent2}
                onChange={(event) =>
                  setEditing({ ...editing, accent2: event.target.value })
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
