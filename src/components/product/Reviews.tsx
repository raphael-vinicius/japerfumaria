import { Star, CheckCircle2, ThumbsUp } from "lucide-react";
import type { Product } from "@/lib/types";
import { reviewsFor, ratingBreakdown } from "@/lib/reviews";
import { StarRating } from "@/components/ui/StarRating";

export function Reviews({ product }: { product: Product }) {
  const reviews = reviewsFor(product, 4);
  const breakdown = ratingBreakdown(product);

  return (
    <section id="avaliacoes" className="scroll-mt-24">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        {/* Resumo */}
        <div>
          <h2 className="font-display text-2xl text-ink">Avaliações</h2>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-5xl font-semibold text-ink">
              {product.rating.toFixed(1)}
            </span>
            <div className="pb-1">
              <StarRating rating={product.rating} size={16} />
              <p className="mt-1 text-xs text-ink-500">
                {product.reviewCount} avaliações
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            {breakdown.map((b) => (
              <div key={b.star} className="flex items-center gap-3">
                <span className="flex w-8 items-center gap-1 text-xs text-ink-600">
                  {b.star}
                  <Star size={11} className="fill-champagne text-champagne" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory-200">
                  <div
                    className="h-full rounded-full bg-champagne"
                    style={{ width: `${b.percent}%` }}
                  />
                </div>
                <span className="w-9 text-right text-xs text-ink-500">
                  {b.percent}%
                </span>
              </div>
            ))}
          </div>

          <button className="btn-outline mt-6 w-full">
            Avaliar este produto
          </button>
        </div>

        {/* Lista */}
        <div className="grid gap-5">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-xs border border-ink/10 bg-ivory-50 p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-semibold text-ivory">
                    {r.initials}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                      {r.author}
                      {r.verified && (
                        <CheckCircle2 size={13} className="text-sage" />
                      )}
                    </p>
                    <p className="text-xs text-ink-500">
                      {r.city} · {r.date}
                    </p>
                  </div>
                </div>
                <StarRating rating={r.rating} size={13} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-ink">{r.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                {r.body}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
                {r.verified && (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-sage" /> Compra
                    verificada
                  </span>
                )}
                <button className="inline-flex items-center gap-1 hover:text-ink">
                  <ThumbsUp size={12} /> Útil
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
