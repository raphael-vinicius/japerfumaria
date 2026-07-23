"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Lock } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { formatBRL } from "@/lib/format";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CouponInput } from "@/components/cart/CouponInput";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { ProductBottle } from "@/components/product/ProductBottle";

export default function CartPage() {
  const { items, count, setQuantity, remove, hydrated } = useCart();

  return (
    <div className="container-wrap py-8">
      <Breadcrumb items={[{ label: "Sacola" }]} />
      <header className="mb-8 mt-6">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          Sua sacola
        </h1>
        {hydrated && count > 0 && (
          <p className="mt-2 text-sm text-ink-500">
            {count} {count === 1 ? "item" : "itens"}
          </p>
        )}
      </header>

      {hydrated && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 rounded-xs border border-dashed border-ink/20 py-24 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-ivory-50 shadow-card">
            <ShoppingBag size={26} className="text-champagne-dark" />
          </div>
          <p className="font-display text-2xl text-ink">Sua sacola está vazia</p>
          <Link href="/busca" className="btn-primary">
            Explorar perfumes
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <ul className="grid divide-y divide-ink/10 border-y border-ink/10">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-5">
                  <Link
                    href={`/produto/${item.product.slug}`}
                    className="grid h-28 w-24 shrink-0 place-items-center rounded-xs border border-ink/10 bg-ivory-50"
                  >
                    <span className="relative h-24 w-20">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={`${item.product.brand} ${item.product.name}`}
                          fill
                          sizes="96px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <ProductBottle
                          accent={item.product.accent}
                          accent2={item.product.accent2}
                          shape={item.product.bottle}
                          backdrop={false}
                          monogram={item.product.brand.slice(0, 2).toUpperCase()}
                        />
                      )}
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-2xs font-semibold uppercase text-champagne-dark">
                          {item.product.brand}
                        </p>
                        <Link
                          href={`/produto/${item.product.slug}`}
                          className="font-display text-lg text-ink hover:text-champagne-dark"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-ink-500">
                          {item.product.subtitle}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(item.productId)}
                        className="text-ink-500 hover:text-wine"
                        aria-label="Remover"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-ink/15">
                        <button
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1)
                          }
                          className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5"
                          aria-label="Diminuir"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1)
                          }
                          className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5"
                          aria-label="Aumentar"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-display text-lg font-semibold text-ink">
                        {formatBRL(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <CouponInput />
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <OrderSummary />
            <Link href="/checkout" className="btn-primary mt-4 w-full">
              Ir para o checkout <ArrowRight size={17} />
            </Link>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500">
              <Lock size={12} /> Ambiente 100% seguro e criptografado
            </p>
            <Link
              href="/busca"
              className="mt-4 block text-center text-sm text-ink-500 hover:text-ink"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
