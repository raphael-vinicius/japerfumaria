"use client";

import { useCart } from "@/store/CartContext";
import { formatBRL } from "@/lib/format";

interface Props {
  showItems?: boolean;
}

export function OrderSummary({ showItems = false }: Props) {
  const { items, subtotal, discount, shipping, total, coupon } = useCart();

  return (
    <div className="rounded-xs border border-ink/10 bg-ivory-50 p-6 shadow-card">
      <h2 className="font-display text-xl text-ink">Resumo do pedido</h2>

      {showItems && (
        <ul className="mt-4 grid gap-3 border-b border-ink/10 pb-4">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3 text-sm">
              <span className="text-ink-700">
                {i.quantity}× {i.product.name}
              </span>
              <span className="shrink-0 font-medium text-ink">
                {formatBRL(i.product.price * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid gap-2.5 text-sm">
        <div className="flex justify-between text-ink-700">
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sage">
            <span>Desconto {coupon ? `(${coupon.code})` : ""}</span>
            <span>−{formatBRL(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink-700">
          <span>Frete</span>
          <span>
            {shipping === 0 ? (
              <span className="font-semibold text-sage">Grátis</span>
            ) : (
              formatBRL(shipping)
            )}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-ink/10 pt-4">
        <span className="text-sm font-medium text-ink">Total</span>
        <div className="text-right">
          <span className="font-display text-2xl font-semibold text-ink">
            {formatBRL(total)}
          </span>
          <p className="text-xs text-ink-500">
            em até 10x de {formatBRL(total / 10)}
          </p>
        </div>
      </div>
    </div>
  );
}
