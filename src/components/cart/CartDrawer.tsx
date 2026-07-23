"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { brand } from "@/lib/brand";
import { formatBRL } from "@/lib/format";
import { ProductBottle } from "@/components/product/ProductBottle";

export function CartDrawer() {
  const {
    items,
    subtotal,
    count,
    drawerOpen,
    closeDrawer,
    setQuantity,
    remove,
    freeShippingProgress,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Fecha com Escape enquanto o drawer estiver aberto
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  const remaining = brand.shipping.freeThreshold - subtotal;

  return (
    <div
      className={`fixed inset-0 z-[80] ${drawerOpen ? "visible" : "invisible"}`}
      aria-hidden={!drawerOpen}
    >
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeDrawer}
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-lift transition-transform duration-400 ease-luxe ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Sacola de compras"
      >
        <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="font-display text-xl text-ink">
            Sua sacola{" "}
            <span className="text-sm font-sans text-ink-500">({count})</span>
          </h2>
          <button
            onClick={closeDrawer}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5"
            aria-label="Fechar sacola"
          >
            <X size={22} />
          </button>
        </header>

        {/* Barra de frete grátis */}
        {items.length > 0 && (
          <div className="border-b border-ink/10 bg-ivory-50 px-5 py-3">
            <p className="mb-2 flex items-center gap-2 text-xs text-ink-700">
              <Truck size={14} className="text-champagne-dark" />
              {remaining > 0 ? (
                <>
                  Faltam{" "}
                  <strong className="text-ink">{formatBRL(remaining)}</strong>{" "}
                  para o frete grátis
                </>
              ) : (
                <strong className="text-sage">
                  Você ganhou frete grátis! 🎉
                </strong>
              )}
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-ivory-200">
              <div
                className="h-full rounded-full bg-champagne transition-all duration-500"
                style={{ width: `${freeShippingProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-ivory-50 shadow-card">
              <ShoppingBag size={26} className="text-champagne-dark" />
            </div>
            <div>
              <p className="font-display text-lg text-ink">
                Sua sacola está vazia
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Explore os árabes mais desejados e os importados originais.
              </p>
            </div>
            <button onClick={closeDrawer} className="btn-primary">
              Descobrir perfumes
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="grid gap-4">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <Link
                      href={`/produto/${item.product.slug}`}
                      onClick={closeDrawer}
                      className="relative grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-xs border border-ink/10"
                      style={{
                        background: `linear-gradient(160deg, ${item.product.accent2}22, transparent 75%)`,
                      }}
                    >
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={`${item.product.brand} ${item.product.name}`}
                          fill
                          sizes="80px"
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <span className="h-20 w-16">
                          <ProductBottle
                            accent={item.product.accent}
                            accent2={item.product.accent2}
                            shape={item.product.bottle}
                            backdrop={false}
                            monogram={item.product.brand
                              .slice(0, 2)
                              .toUpperCase()}
                          />
                        </span>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-2xs font-semibold uppercase text-champagne-dark">
                            {item.product.brand}
                          </p>
                          <p className="text-sm font-semibold text-ink">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-ink-500">
                            {item.product.subtitle}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(item.productId)}
                          className="text-ink-500 hover:text-wine"
                          aria-label="Remover item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-ink/15">
                          <button
                            onClick={() =>
                              setQuantity(item.productId, item.quantity - 1)
                            }
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink/5"
                            aria-label="Diminuir"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              setQuantity(item.productId, item.quantity + 1)
                            }
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink/5"
                            aria-label="Aumentar"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-ink">
                          {formatBRL(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-ink/10 bg-ivory-50 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-ink-700">Subtotal</span>
                <span className="font-display text-xl font-semibold text-ink">
                  {formatBRL(subtotal)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="btn-primary w-full"
              >
                Finalizar compra
              </Link>
              <Link
                href="/carrinho"
                onClick={closeDrawer}
                className="mt-2 block w-full py-2 text-center text-sm text-ink-500 hover:text-ink"
              >
                Ver sacola completa
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
