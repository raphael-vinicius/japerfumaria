"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  MessageSquareQuote,
  Pencil,
  Reply,
  Star,
  Trash2,
} from "lucide-react";
import { formatDate, formatRelative } from "@/lib/admin/datetime";
import { REVIEW_STATUS } from "@/lib/admin/labels";
import { reviewStats } from "@/lib/admin/metrics";
import { useAdmin } from "@/lib/admin/store";
import type { AdminReview, ReviewStatus } from "@/lib/admin/types";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  StatsCard,
  StatusBadge,
  Tabs,
  Textarea,
  matchesQuery,
  useConfirm,
  usePagination,
  useToast,
  Pagination,
} from "@/components/admin/ui";

/**
 * Moderação de avaliações.
 *
 * Lista, não tabela: o conteúdo é texto corrido e precisa ser lido
 * inteiro antes de aprovar. As pendentes abrem primeiro porque
 * são as únicas que travam alguma coisa — as demais já estão no ar.
 * Responder é ação de primeira linha: avaliação ruim respondida
 * vale mais que avaliação ruim escondida.
 */

type TabId = ReviewStatus | "todas";

export function ReviewsScreen() {
  const { reviews, products, dispatch } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();

  const [tab, setTab] = useState<TabId>("pendente");
  const [query, setQuery] = useState("");
  const [replying, setReplying] = useState<AdminReview | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editing, setEditing] = useState<AdminReview | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const stats = useMemo(() => reviewStats(reviews), [reviews]);

  const scoped = useMemo(
    () =>
      reviews.filter((review) =>
        matchesQuery(
          query,
          review.author,
          review.title,
          review.body,
          productById.get(review.productId)?.name,
        ),
      ),
    [reviews, query, productById],
  );

  const filtered = useMemo(
    () =>
      tab === "todas"
        ? scoped
        : scoped.filter((review) => review.status === tab),
    [scoped, tab],
  );

  const page = usePagination(filtered, 8);

  const moderate = (review: AdminReview, status: ReviewStatus) => {
    const previous = review.status;
    dispatch({ type: "review/status", reviewId: review.id, status });
    toast.success(
      status === "publicada"
        ? "Avaliação publicada na loja"
        : status === "oculta"
          ? "Avaliação ocultada"
          : "Avaliação devolvida para a fila",
      {
        action: {
          label: "Desfazer",
          onClick: () =>
            dispatch({
              type: "review/status",
              reviewId: review.id,
              status: previous,
            }),
        },
      },
    );
  };

  const remove = async (review: AdminReview) => {
    const ok = await confirm({
      title: "Excluir esta avaliação?",
      description:
        "O texto é apagado definitivamente. Se o problema for o conteúdo estar impróprio, ocultar preserva o registro.",
      confirmLabel: "Excluir avaliação",
    });
    if (!ok) return;
    dispatch({ type: "review/delete", reviewId: review.id });
    toast.success("Avaliação excluída");
  };

  const saveReply = () => {
    if (!replying || !replyBody.trim()) return;
    dispatch({
      type: "review/reply",
      reviewId: replying.id,
      body: replyBody.trim(),
    });
    setReplying(null);
    setReplyBody("");
    toast.success("Resposta publicada");
  };

  const saveEdit = () => {
    if (!editing) return;
    dispatch({
      type: "review/update",
      reviewId: editing.id,
      title: editTitle.trim(),
      body: editBody.trim(),
    });
    setEditing(null);
    toast.success("Avaliação atualizada");
  };

  return (
    <>
      <PageHeader
        title="Avaliações"
        description={`${reviews.length} avaliações · nota média ${stats.average.toFixed(1).replace(".", ",")} entre as publicadas`}
      />

      <div className="mb-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Aguardando moderação"
          value={String(stats.pending)}
          hint="Não aparecem na loja"
          attention={stats.pending > 0}
        />
        <StatsCard
          label="Publicadas"
          value={String(stats.published)}
          hint="No ar na página do produto"
        />
        <StatsCard
          label="Nota média"
          value={stats.average.toFixed(1).replace(".", ",")}
          hint="Somente publicadas"
        />
        <StatsCard
          label="Sem resposta"
          value={String(stats.unanswered)}
          hint="Publicadas que ninguém respondeu"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-adm-line p-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            ariaLabel="Filtrar avaliações"
            variant="pill"
            className="min-w-0 flex-1"
            value={tab}
            onChange={setTab}
            items={[
              {
                value: "pendente" as TabId,
                label: "Pendentes",
                count: scoped.filter((r) => r.status === "pendente").length,
              },
              {
                value: "publicada" as TabId,
                label: "Publicadas",
                count: scoped.filter((r) => r.status === "publicada").length,
              },
              {
                value: "oculta" as TabId,
                label: "Ocultas",
                count: scoped.filter((r) => r.status === "oculta").length,
              },
              { value: "todas" as TabId, label: "Todas", count: scoped.length },
            ]}
          />
          <SearchInput
            value={query}
            onChange={setQuery}
            shortcut="/"
            placeholder="Autor, texto ou produto…"
            containerClassName="sm:max-w-xs"
          />
        </div>

        {page.items.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={MessageSquareQuote}
              title={
                tab === "pendente"
                  ? "Nenhuma avaliação aguardando"
                  : "Nenhuma avaliação nesta seleção"
              }
              description={
                tab === "pendente"
                  ? "Tudo moderado. Novas avaliações aparecem aqui assim que o cliente enviar."
                  : "Ajuste a busca ou escolha outra aba."
              }
            />
          </CardBody>
        ) : (
          <ul className="divide-y divide-adm-line">
            {page.items.map((review) => {
              const product = productById.get(review.productId);
              return (
                <li key={review.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="flex items-center gap-0.5"
                          aria-label={`Nota ${review.rating} de 5`}
                        >
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={13}
                              aria-hidden="true"
                              className={
                                index < review.rating
                                  ? "fill-champagne text-champagne"
                                  : "text-adm-line-strong"
                              }
                            />
                          ))}
                        </span>
                        <StatusBadge
                          size="sm"
                          status={REVIEW_STATUS[review.status]}
                        />
                        {review.verified && (
                          <Badge size="sm" tone="info">
                            Compra verificada
                          </Badge>
                        )}
                      </div>

                      <p className="mt-2 text-[13.5px] font-medium text-adm-ink">
                        {review.title}
                      </p>
                      <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-adm-ink-2">
                        {review.body}
                      </p>

                      <p className="mt-2 text-micro text-adm-ink-3">
                        {review.author} · {review.city} ·{" "}
                        {formatDate(review.createdAt)} (
                        {formatRelative(review.createdAt)})
                        {product && (
                          <>
                            {" · "}
                            <Link
                              href={`/admin/produtos/${product.id}`}
                              className="text-adm-accent hover:underline"
                            >
                              {product.name}
                            </Link>
                          </>
                        )}
                      </p>

                      {review.reply && (
                        <div className="mt-3 max-w-3xl rounded-adm border-l-2 border-adm-accent/50 bg-adm-raised px-3 py-2">
                          <p className="text-micro font-medium text-adm-ink-2">
                            Resposta da loja · {review.reply.author}
                          </p>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-adm-ink-2">
                            {review.reply.body}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      {review.status !== "publicada" && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Check}
                          onClick={() => moderate(review, "publicada")}
                        >
                          Publicar
                        </Button>
                      )}
                      {review.status === "publicada" && (
                        <Button
                          size="sm"
                          icon={EyeOff}
                          onClick={() => moderate(review, "oculta")}
                        >
                          Ocultar
                        </Button>
                      )}
                      {review.status === "oculta" && (
                        <Button
                          size="sm"
                          icon={Eye}
                          onClick={() => moderate(review, "pendente")}
                        >
                          Reavaliar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        icon={Reply}
                        onClick={() => {
                          setReplying(review);
                          setReplyBody(review.reply?.body ?? "");
                        }}
                      >
                        {review.reply ? "Editar resposta" : "Responder"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Pencil}
                        aria-label="Editar texto da avaliação"
                        onClick={() => {
                          setEditing(review);
                          setEditTitle(review.title);
                          setEditBody(review.body);
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        aria-label="Excluir avaliação"
                        onClick={() => remove(review)}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-adm-line">
          <Pagination
            page={page.page}
            pageCount={page.pageCount}
            from={page.from}
            to={page.to}
            total={page.total}
            onChange={page.setPage}
            unit="avaliações"
          />
        </div>
      </Card>

      <Modal
        open={Boolean(replying)}
        onClose={() => setReplying(null)}
        title="Responder avaliação"
        description="A resposta aparece publicamente abaixo do comentário."
        footer={
          <>
            <Button variant="ghost" onClick={() => setReplying(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={saveReply}
              disabled={!replyBody.trim()}
            >
              Publicar resposta
            </Button>
          </>
        }
      >
        {replying && (
          <>
            <div className="mb-3 rounded-adm border border-adm-line bg-adm-raised p-3">
              <p className="text-[12.5px] font-medium text-adm-ink">
                {replying.title}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-adm-ink-2">
                {replying.body}
              </p>
              <p className="mt-1.5 text-micro text-adm-ink-3">
                {replying.author} · nota {replying.rating}
              </p>
            </div>
            <Textarea
              label="Sua resposta"
              rows={4}
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
              hint={
                replying.rating <= 3
                  ? "Avaliação crítica: reconheça o problema e ofereça uma solução concreta."
                  : "Agradeça de forma específica — respostas genéricas soam automáticas."
              }
            />
          </>
        )}
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Editar avaliação"
        description="Use apenas para corrigir dados sensíveis ou linguagem imprópria."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={saveEdit}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Input
            label="Título"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
          />
          <Textarea
            label="Texto"
            rows={5}
            value={editBody}
            onChange={(event) => setEditBody(event.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
