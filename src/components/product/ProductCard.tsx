"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, Check } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import { discountPercent } from "@/lib/format";
import { useCart } from "@/store/CartContext";
import { useFavorites } from "@/store/FavoritesContext";
import { ProductBottle } from "./ProductBottle";
import { StarRating } from "@/components/ui/StarRating";
import { Price } from "@/components/ui/Price";

interface Props {
  product: Product;
  priority?: boolean;
}

const originLabel: Record<Product["origin"], string> = {
  arabe: "Árabe",
  importado: "Importado",
  nacional: "Nacional",
};

/**
 * Card de produto — desenho exclusivo JA "oud & bone".
 * Cantos vivos, superfície osso, fio de ouro que cresce no hover,
 * rótulos discretos e arte de frasco (ou foto real quando disponível).
 */
export function ProductCard({ product, priority }: Props) {
  const { add } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const [added, setAdded] = useState(false);
  const fav = isFavorite(product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const lowStock = product.stock > 0 && product.stock <= 8;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative flex h-full flex-col">
      <Link
        href={`/produto/${product.slug}`}
        className="relative flex h-full flex-col overflow-hidden rounded-xs border border-ink/10 bg-ivory-50 transition-all duration-500 ease-luxe hover:border-ink/25 hover:shadow-lift"
      >
        {/* ————— Painel da arte (PNG transparente flutua sobre o degradê) ————— */}
        <div
          className="relative aspect-[4/5] w-full overflow-hidden"
          style={{
            background: `radial-gradient(115% 85% at 50% 18%, ${product.accent2}26, transparent 68%)`,
          }}
        >
          {/* Rótulos discretos (flat, sem pílula) */}
          <div className="absolute left-0 top-4 z-10 flex flex-col items-start gap-px">
            {discount > 0 && (
              <span className="bg-wine px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide3 text-ivory-50">
                −{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-ink px-2.5 py-1 text-2xs font-medium uppercase tracking-wide3 text-ivory-50">
                Novo
              </span>
            )}
            {product.bestSeller && !product.isNew && (
              <span className="bg-ivory-50/85 px-2.5 py-1 text-2xs font-medium uppercase tracking-wide3 text-ink-700 backdrop-blur">
                Mais vendido
              </span>
            )}
          </div>

          {/* Favoritar */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-ink-600 transition duration-300 hover:bg-ivory-50/70 hover:text-wine"
          >
            <Heart
              size={16}
              className={clsx("transition", fav && "fill-wine text-wine")}
            />
          </button>

          {/* Arte do frasco (ou foto real, quando existir) */}
          <div className="absolute inset-0 flex items-center justify-center p-7 transition-transform duration-700 ease-luxe group-hover:scale-[1.045]">
            {product.image ? (
              <Image
                src={product.image}
                alt={`${product.brand} ${product.name}`}
                fill
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
                className="object-contain p-7 drop-shadow-[0_16px_18px_rgba(62,45,51,0.2)]"
              />
            ) : (
              <ProductBottle
                accent={product.accent}
                accent2={product.accent2}
                shape={product.bottle}
                monogram={product.brand.slice(0, 2).toUpperCase()}
              />
            )}
          </div>

          {/* Quick add */}
          <button
            type="button"
            onClick={handleAdd}
            className={clsx(
              "absolute bottom-3 right-3 z-10 grid h-10 w-10 place-items-center rounded-full transition-all duration-300 ease-luxe",
              added
                ? "bg-sage text-ivory-50"
                : "bg-ink text-ivory-50 hover:bg-champagne-dark",
            )}
            aria-label="Adicionar à sacola"
          >
            {added ? <Check size={17} /> : <Plus size={17} />}
          </button>
        </div>

        {/* fio de ouro que cresce no hover */}
        <span className="block h-px w-full origin-left scale-x-0 bg-champagne/50 transition-transform duration-700 ease-luxe group-hover:scale-x-100" />

        {/* ————— Informação ————— */}
        <div className="flex flex-1 flex-col gap-1.5 px-4 pb-5 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-semibold uppercase tracking-wide2 text-champagne-dark">
              {product.brand}
            </span>
            <span className="h-1 w-1 rounded-full bg-ink/20" />
            <span className="text-2xs font-medium uppercase text-ink-400">
              {originLabel[product.origin]}
            </span>
          </div>

          <h3 className="font-display text-[1.35rem] font-light leading-[1.1] text-ink">
            {product.name}
          </h3>
          <p className="text-xs text-ink-500">{product.subtitle}</p>

          <StarRating
            rating={product.rating}
            count={product.reviewCount}
            className="mt-1"
          />

          <div className="mt-auto pt-3">
            <Price price={product.price} compareAt={product.compareAtPrice} size="sm" />
          </div>

          {lowStock && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-wine">
              <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-wine" />
              Últimas {product.stock} unidades
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
