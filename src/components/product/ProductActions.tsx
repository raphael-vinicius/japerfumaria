"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Check, Zap } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import { useCart } from "@/store/CartContext";
import { useFavorites } from "@/store/FavoritesContext";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const fav = isFavorite(product.id);

  const handleAdd = () => {
    add(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    add(product.id, qty);
    router.push("/checkout");
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-ink/15">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5"
            aria-label="Diminuir quantidade"
          >
            <Minus size={15} />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5"
            aria-label="Aumentar quantidade"
          >
            <Plus size={15} />
          </button>
        </div>
        <button
          onClick={() => toggle(product.id)}
          className={clsx(
            "grid h-11 w-11 place-items-center rounded-full border transition",
            fav
              ? "border-wine bg-wine/5 text-wine"
              : "border-ink/15 text-ink-700 hover:border-ink",
          )}
          aria-label="Favoritar"
        >
          <Heart size={18} className={fav ? "fill-wine" : ""} />
        </button>
        <span className="text-xs text-ink-500">
          {product.stock > 0
            ? `${product.stock} em estoque`
            : "Indisponível"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={handleAdd}
          className={clsx(
            "btn w-full",
            added
              ? "bg-sage text-ivory-50"
              : "border border-ink/20 text-ink hover:bg-ink hover:text-ivory",
          )}
        >
          {added ? (
            <>
              <Check size={17} /> Adicionado
            </>
          ) : (
            <>
              <ShoppingBag size={17} /> Adicionar à sacola
            </>
          )}
        </button>
        <button onClick={handleBuyNow} className="btn-primary w-full">
          <Zap size={16} /> Comprar agora
        </button>
      </div>
    </div>
  );
}
