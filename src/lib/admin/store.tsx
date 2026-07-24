"use client";

/**
 * Estado vivo do painel.
 *
 * Um único reducer concentra todas as escritas, o que dá duas
 * garantias: nenhuma tela muta dados por conta própria e cada
 * ação mantém os invariantes do domínio — mudar um pedido para
 * "separando" baixa o estoque e escreve na linha do tempo; um
 * cancelamento devolve as unidades à prateleira.
 *
 * Protótipo: o estado vive em memória e volta ao original a cada
 * recarregamento. Com backend, cada `case` vira uma chamada de
 * API e o reducer segue sendo o mesmo.
 */

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { NOW } from "./datetime";
import { loadDataset, type AdminDataset } from "./source";
import type {
  AdminCategory,
  AdminCoupon,
  AdminProduct,
  AdminReview,
  Order,
  OrderEvent,
  OrderStatus,
  ReviewStatus,
  StockMovement,
  StockMovementType,
  StoreSettings,
} from "./types";

/* ————————————————————————— Ações ————————————————————————— */

export type AdminAction =
  | { type: "order/status"; orderId: string; status: OrderStatus; detail?: string }
  | { type: "order/tracking"; orderId: string; carrier: string; code: string }
  | { type: "order/note"; orderId: string; body: string }
  | { type: "product/save"; product: AdminProduct }
  | { type: "product/delete"; productId: string }
  | { type: "category/save"; category: AdminCategory; previousSlug?: string }
  | { type: "category/delete"; slug: string }
  | { type: "coupon/save"; coupon: AdminCoupon }
  | { type: "coupon/delete"; couponId: string }
  | { type: "review/status"; reviewId: string; status: ReviewStatus }
  | { type: "review/reply"; reviewId: string; body: string }
  | { type: "review/update"; reviewId: string; title: string; body: string }
  | { type: "review/delete"; reviewId: string }
  | {
      type: "stock/movement";
      productId: string;
      movementType: StockMovementType;
      quantity: number;
      reason: string;
    }
  | { type: "customer/note"; customerId: string; body: string }
  | { type: "settings/save"; settings: StoreSettings };

interface AdminState extends AdminDataset {
  author: string;
}

/* ———————————————————————— Utilitários ———————————————————————— */

const nowIso = () => NOW.toISOString();

let sequence = 0;
/** Id estável dentro da sessão — só usado em registros criados agora. */
const uid = (prefix: string) => {
  sequence += 1;
  return `${prefix}-${sequence}`;
};

const STATUS_RANK: Record<OrderStatus, number> = {
  aguardando_pagamento: 0,
  pago: 1,
  separando: 2,
  enviado: 3,
  entregue: 4,
  cancelado: 5,
};

const STATUS_EVENT: Record<
  OrderStatus,
  { type: OrderEvent["type"]; label: string }
> = {
  aguardando_pagamento: { type: "pagamento", label: "Aguardando pagamento" },
  pago: { type: "pagamento", label: "Pagamento aprovado" },
  separando: { type: "separacao", label: "Em separação" },
  enviado: { type: "envio", label: "Pedido enviado" },
  entregue: { type: "entrega", label: "Entrega concluída" },
  cancelado: { type: "cancelamento", label: "Pedido cancelado" },
};

/** Baixa de estoque na separação; devolução no cancelamento. */
function applyStockEffect(
  state: AdminState,
  order: Order,
  next: OrderStatus,
): { products: AdminProduct[]; movements: StockMovement[] } {
  const alreadyPicked = state.movements.some(
    (m) => m.orderNumber === order.number && m.type === "saida",
  );
  const goingToPicking = STATUS_RANK[next] >= 2 && next !== "cancelado";
  const returning = next === "cancelado" && alreadyPicked;

  if (!returning && (!goingToPicking || alreadyPicked)) {
    return { products: state.products, movements: state.movements };
  }

  const products = [...state.products];
  const created: StockMovement[] = [];

  for (const item of order.items) {
    const index = products.findIndex((p) => p.id === item.productId);
    if (index < 0) continue;
    const product = products[index];
    const balance = returning
      ? product.stock + item.quantity
      : product.stock - item.quantity;

    products[index] = { ...product, stock: balance, updatedAt: nowIso() };
    created.push({
      id: uid(`mv-${item.productId}`),
      productId: item.productId,
      at: nowIso(),
      type: returning ? "entrada" : "saida",
      quantity: item.quantity,
      reason: returning
        ? `Devolução do pedido #${order.number} cancelado`
        : `Separação do pedido #${order.number}`,
      author: state.author,
      balanceAfter: balance,
      orderNumber: order.number,
    });
  }

  return {
    products,
    movements: [...created, ...state.movements],
  };
}

/* ———————————————————————— Reducer ———————————————————————— */

function reducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "order/status": {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.status === action.status) return state;

      const meta = STATUS_EVENT[action.status];
      const event: OrderEvent = {
        id: uid("ev"),
        at: nowIso(),
        type: meta.type,
        label: meta.label,
        detail: action.detail,
        author: state.author,
      };

      const { products, movements } = applyStockEffect(
        state,
        order,
        action.status,
      );

      const updated: Order = {
        ...order,
        status: action.status,
        updatedAt: event.at,
        timeline: [...order.timeline, event],
        payment:
          action.status === "pago" && order.payment.status !== "aprovado"
            ? { ...order.payment, status: "aprovado", paidAt: event.at }
            : action.status === "cancelado"
              ? {
                  ...order.payment,
                  status:
                    order.payment.status === "aprovado"
                      ? "estornado"
                      : "recusado",
                }
              : order.payment,
        shipping: {
          ...order.shipping,
          shippedAt:
            action.status === "enviado" && !order.shipping.shippedAt
              ? event.at
              : order.shipping.shippedAt,
          deliveredAt:
            action.status === "entregue" ? event.at : order.shipping.deliveredAt,
        },
      };

      return {
        ...state,
        products,
        movements,
        orders: state.orders.map((o) => (o.id === order.id ? updated : o)),
      };
    }

    case "order/tracking": {
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== action.orderId) return order;
          const event: OrderEvent = {
            id: uid("ev"),
            at: nowIso(),
            type: "rastreio",
            label: "Rastreio adicionado",
            detail: `${action.carrier} · ${action.code}`,
            author: state.author,
          };
          return {
            ...order,
            updatedAt: event.at,
            shipping: {
              ...order.shipping,
              carrier: action.carrier,
              trackingCode: action.code,
            },
            timeline: [...order.timeline, event],
          };
        }),
      };
    }

    case "order/note": {
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId
            ? {
                ...order,
                notes: [
                  ...order.notes,
                  {
                    id: uid("nt"),
                    at: nowIso(),
                    author: state.author,
                    body: action.body,
                  },
                ],
              }
            : order,
        ),
      };
    }

    case "product/save": {
      const exists = state.products.some((p) => p.id === action.product.id);
      const product = { ...action.product, updatedAt: nowIso() };
      return {
        ...state,
        products: exists
          ? state.products.map((p) => (p.id === product.id ? product : p))
          : [product, ...state.products],
      };
    }

    case "product/delete":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.productId),
      };

    case "category/save": {
      const key = action.previousSlug ?? action.category.slug;
      const exists = state.categories.some((c) => c.slug === key);
      return {
        ...state,
        categories: exists
          ? state.categories.map((c) => (c.slug === key ? action.category : c))
          : [...state.categories, action.category],
        // Produtos acompanham a categoria quando o slug muda.
        products:
          action.previousSlug && action.previousSlug !== action.category.slug
            ? state.products.map((p) =>
                p.categorySlug === action.previousSlug
                  ? { ...p, categorySlug: action.category.slug }
                  : p,
              )
            : state.products,
      };
    }

    case "category/delete":
      return {
        ...state,
        categories: state.categories.filter((c) => c.slug !== action.slug),
      };

    case "coupon/save": {
      const exists = state.coupons.some((c) => c.id === action.coupon.id);
      return {
        ...state,
        coupons: exists
          ? state.coupons.map((c) =>
              c.id === action.coupon.id ? action.coupon : c,
            )
          : [action.coupon, ...state.coupons],
      };
    }

    case "coupon/delete":
      return {
        ...state,
        coupons: state.coupons.filter((c) => c.id !== action.couponId),
      };

    case "review/status":
      return {
        ...state,
        reviews: state.reviews.map((r) =>
          r.id === action.reviewId ? { ...r, status: action.status } : r,
        ),
      };

    case "review/reply":
      return {
        ...state,
        reviews: state.reviews.map((r) =>
          r.id === action.reviewId
            ? {
                ...r,
                reply: {
                  body: action.body,
                  at: nowIso(),
                  author: state.author,
                },
              }
            : r,
        ),
      };

    case "review/update":
      return {
        ...state,
        reviews: state.reviews.map((r) =>
          r.id === action.reviewId
            ? { ...r, title: action.title, body: action.body }
            : r,
        ),
      };

    case "review/delete":
      return {
        ...state,
        reviews: state.reviews.filter((r) => r.id !== action.reviewId),
      };

    case "stock/movement": {
      const product = state.products.find((p) => p.id === action.productId);
      if (!product) return state;

      const signed =
        action.movementType === "entrada"
          ? Math.abs(action.quantity)
          : action.movementType === "saida"
            ? -Math.abs(action.quantity)
            : action.quantity;
      const balance = Math.max(0, product.stock + signed);

      const movement: StockMovement = {
        id: uid(`mv-${product.id}`),
        productId: product.id,
        at: nowIso(),
        type: action.movementType,
        quantity:
          action.movementType === "ajuste" ? action.quantity : Math.abs(action.quantity),
        reason: action.reason,
        author: state.author,
        balanceAfter: balance,
      };

      return {
        ...state,
        products: state.products.map((p) =>
          p.id === product.id
            ? { ...p, stock: balance, updatedAt: nowIso() }
            : p,
        ),
        movements: [movement, ...state.movements],
      };
    }

    case "customer/note":
      return {
        ...state,
        customers: state.customers.map((customer) =>
          customer.id === action.customerId
            ? {
                ...customer,
                notes: [
                  ...customer.notes,
                  {
                    id: uid("nt"),
                    at: nowIso(),
                    author: state.author,
                    body: action.body,
                  },
                ],
              }
            : customer,
        ),
      };

    case "settings/save":
      return { ...state, settings: action.settings };

    default:
      return state;
  }
}

/* ———————————————————————— Contexto ———————————————————————— */

interface AdminContextValue extends AdminState {
  dispatch: (action: AdminAction) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function init(): AdminState {
  const dataset = loadDataset();
  return { ...dataset, author: dataset.currentUser.name };
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const value = useMemo(() => ({ ...state, dispatch }), [state]);
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdmin precisa estar dentro de <AdminDataProvider>.");
  return context;
}

/* ———————————————————————— Atalhos de leitura ———————————————————————— */

export function useOrder(numberOrId: string) {
  const { orders } = useAdmin();
  return orders.find(
    (o) => o.id === numberOrId || String(o.number) === numberOrId,
  );
}

export function useCustomer(id: string) {
  const { customers } = useAdmin();
  return customers.find((c) => c.id === id);
}

export function useProduct(idOrSlug: string) {
  const { products } = useAdmin();
  return products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}
