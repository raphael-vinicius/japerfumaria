"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types";
import { getById } from "@/lib/products";
import { brand } from "@/lib/brand";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { findCoupon, type Coupon } from "./coupons";

export interface RawCartItem {
  productId: string;
  quantity: number;
}

export interface CartItem extends RawCartItem {
  product: Product;
}

export type ShippingMethod = "expressa" | "economica" | "retirada";

/** Tabela de frete por método (valores da loja). */
export const SHIPPING_RATES: Record<
  ShippingMethod,
  { label: string; price: number }
> = {
  expressa: { label: "Entrega expressa (1-2 dias)", price: 24.9 },
  economica: { label: "Econômica · Correios (4-9 dias)", price: 16.9 },
  retirada: { label: "Retirada na loja", price: 0 },
};

interface CartValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon: Coupon | null;
  couponError: string | null;
  freeShippingProgress: number; // 0..1
  shippingMethod: ShippingMethod;
  setShippingMethod: (m: ShippingMethod) => void;
  hydrated: boolean;
  drawerOpen: boolean;
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { value: raw, setValue: setRaw, hydrated } = useLocalStorage<
    RawCartItem[]
  >("ja-cart", []);
  const { value: couponCode, setValue: setCouponCode } =
    useLocalStorage<string>("ja-coupon", "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("expressa");

  const items = useMemo<CartItem[]>(
    () =>
      raw
        .map((r) => {
          const product = getById(r.productId);
          return product ? { ...r, product } : null;
        })
        .filter((x): x is CartItem => x !== null),
    [raw],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items],
  );

  const coupon = useMemo<Coupon | null>(() => {
    if (!couponCode) return null;
    const c = findCoupon(couponCode);
    if (!c) return null;
    if (c.minSubtotal && subtotal < c.minSubtotal) return null;
    return c;
  }, [couponCode, subtotal]);

  const discount = useMemo(() => {
    if (!coupon) return 0;
    return coupon.type === "percent"
      ? (subtotal * coupon.value) / 100
      : coupon.value;
  }, [coupon, subtotal]);

  // Frete: reflete o método escolhido no checkout; retirada é sempre grátis
  // e acima do teto o frete de envio é cortesia da loja.
  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    if (shippingMethod === "retirada") return 0;
    if (subtotal - discount >= brand.shipping.freeThreshold) return 0;
    return SHIPPING_RATES[shippingMethod].price;
  }, [subtotal, discount, shippingMethod]);

  const total = Math.max(0, subtotal - discount + shipping);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const freeShippingProgress = Math.min(
    1,
    subtotal / brand.shipping.freeThreshold,
  );

  const add = useCallback(
    (productId: string, quantity = 1) => {
      setRaw((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing)
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        return [...prev, { productId, quantity }];
      });
      setDrawerOpen(true);
    },
    [setRaw],
  );

  const remove = useCallback(
    (productId: string) =>
      setRaw((prev) => prev.filter((i) => i.productId !== productId)),
    [setRaw],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) =>
      setRaw((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.productId !== productId)
          : prev.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            ),
      ),
    [setRaw],
  );

  const clear = useCallback(() => {
    setRaw([]);
    setCouponCode("");
  }, [setRaw, setCouponCode]);

  const applyCoupon = useCallback(
    (code: string): boolean => {
      const c = findCoupon(code);
      if (!c) {
        setCouponError("Cupom inválido ou expirado.");
        return false;
      }
      if (c.minSubtotal && subtotal < c.minSubtotal) {
        setCouponError(
          `Este cupom é válido para compras acima de R$ ${c.minSubtotal.toFixed(0)}.`,
        );
        return false;
      }
      setCouponError(null);
      setCouponCode(c.code);
      return true;
    },
    [subtotal, setCouponCode],
  );

  const removeCoupon = useCallback(() => {
    setCouponCode("");
    setCouponError(null);
  }, [setCouponCode]);

  const value: CartValue = {
    items,
    count,
    subtotal,
    shipping,
    discount,
    total,
    coupon,
    couponError,
    freeShippingProgress,
    shippingMethod,
    setShippingMethod,
    hydrated,
    drawerOpen,
    add,
    remove,
    setQuantity,
    clear,
    applyCoupon,
    removeCoupon,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
