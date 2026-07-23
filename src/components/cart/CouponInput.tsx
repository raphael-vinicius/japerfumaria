"use client";

import { useState } from "react";
import { Tag, Check, X } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { coupons } from "@/store/coupons";

export function CouponInput() {
  const { coupon, couponError, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-xs border border-sage/40 bg-sage/5 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-sage">
          <Check size={16} /> Cupom <strong>{coupon.code}</strong> aplicado
        </span>
        <button
          onClick={removeCoupon}
          className="text-ink-500 hover:text-wine"
          aria-label="Remover cupom"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-ink/15 bg-ivory-50 px-4">
          <Tag size={15} className="text-ink-500" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && applyCoupon(code)}
            placeholder="Código do cupom"
            className="flex-1 bg-transparent py-2.5 text-sm uppercase focus:outline-none"
          />
        </div>
        <button onClick={() => applyCoupon(code)} className="btn-outline px-5">
          Aplicar
        </button>
      </div>
      {couponError && (
        <p className="mt-2 text-xs text-wine">{couponError}</p>
      )}
      <p className="mt-2 text-xs text-ink-500">
        Experimente:{" "}
        {coupons.map((c, i) => (
          <button
            key={c.code}
            onClick={() => {
              setCode(c.code);
              applyCoupon(c.code);
            }}
            className="font-semibold text-champagne-dark hover:underline"
          >
            {c.code}
            {i < coupons.length - 1 ? ", " : ""}
          </button>
        ))}
      </p>
    </div>
  );
}
