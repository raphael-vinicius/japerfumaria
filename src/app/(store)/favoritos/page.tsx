"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/store/FavoritesContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export default function FavoritesPage() {
  const { items, count, hydrated } = useFavorites();

  return (
    <div className="container-wrap py-8">
      <Breadcrumb items={[{ label: "Favoritos" }]} />
      <header className="mb-8 mt-6">
        <p className="eyebrow">Sua lista de desejos</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Favoritos
        </h1>
        {hydrated && count > 0 && (
          <p className="mt-2 text-sm text-ink-500">
            {count} {count === 1 ? "perfume salvo" : "perfumes salvos"}
          </p>
        )}
      </header>

      {!hydrated ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-xs bg-ivory-200"
            />
          ))}
        </div>
      ) : count === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 rounded-xs border border-dashed border-ink/20 py-24 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-ivory-50 shadow-card">
            <Heart size={26} className="text-wine" />
          </div>
          <div>
            <p className="font-display text-2xl text-ink">
              Você ainda não salvou favoritos
            </p>
            <p className="mt-2 max-w-sm text-sm text-ink-500">
              Toque no coração dos perfumes que você ama para guardá-los aqui e
              comprar depois.
            </p>
          </div>
          <Link href="/busca" className="btn-primary">
            Explorar perfumes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
