/**
 * Vocabulário do painel: rótulos e tons semânticos.
 *
 * Cada estado do domínio tem UM rótulo e UMA cor, definidos aqui.
 * Se "Aguardando pagamento" for âmbar na tabela de pedidos, será
 * âmbar no dashboard e na ficha do cliente — sem exceção.
 */

import type { Family, Gender, Origin } from "@/lib/types";
import type {
  AdminCoupon,
  CouponStatus,
  CouponType,
  CustomerTag,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  ReviewStatus,
  SalesChannel,
  ShippingMethod,
  StaffRole,
  StockHealth,
} from "./types";

/** Tons do sistema — mapeados para os tokens `adm.*` do Tailwind. */
export type Tone =
  | "neutral"
  | "accent"
  | "ok"
  | "warn"
  | "bad"
  | "info"
  | "ship";

interface LabelTone {
  label: string;
  tone: Tone;
}

export const ORDER_STATUS: Record<OrderStatus, LabelTone & { short: string }> = {
  aguardando_pagamento: {
    label: "Aguardando pagamento",
    short: "Aguardando",
    tone: "warn",
  },
  pago: { label: "Pago", short: "Pago", tone: "info" },
  separando: { label: "Separando", short: "Separando", tone: "accent" },
  enviado: { label: "Enviado", short: "Enviado", tone: "ship" },
  entregue: { label: "Entregue", short: "Entregue", tone: "ok" },
  cancelado: { label: "Cancelado", short: "Cancelado", tone: "bad" },
};

/** Ordem operacional do pedido — base dos botões de avanço. */
export const ORDER_FLOW: OrderStatus[] = [
  "aguardando_pagamento",
  "pago",
  "separando",
  "enviado",
  "entregue",
];

export const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  pix: "Pix",
  credito: "Cartão de crédito",
  boleto: "Boleto",
};

export const PAYMENT_STATUS: Record<PaymentStatus, LabelTone> = {
  pendente: { label: "Pendente", tone: "warn" },
  aprovado: { label: "Aprovado", tone: "ok" },
  recusado: { label: "Recusado", tone: "bad" },
  estornado: { label: "Estornado", tone: "neutral" },
};

export const CHANNEL: Record<SalesChannel, string> = {
  site: "Site",
  whatsapp: "WhatsApp",
  loja: "Loja física",
  instagram: "Instagram",
};

export const SHIPPING_METHOD: Record<ShippingMethod, string> = {
  retirada: "Retirada na loja",
  padrao: "Entrega padrão",
  expressa: "Entrega expressa",
};

export const STOCK_HEALTH: Record<StockHealth, LabelTone> = {
  sem_estoque: { label: "Sem estoque", tone: "bad" },
  critico: { label: "Crítico", tone: "bad" },
  baixo: { label: "Baixo", tone: "warn" },
  saudavel: { label: "Saudável", tone: "ok" },
  nao_publicado: { label: "Não publicado", tone: "neutral" },
};

export const PRODUCT_STATUS: Record<ProductStatus, LabelTone> = {
  ativo: { label: "Ativo", tone: "ok" },
  rascunho: { label: "Rascunho", tone: "warn" },
  arquivado: { label: "Arquivado", tone: "neutral" },
};

export const REVIEW_STATUS: Record<ReviewStatus, LabelTone> = {
  pendente: { label: "Pendente", tone: "warn" },
  publicada: { label: "Publicada", tone: "ok" },
  oculta: { label: "Oculta", tone: "neutral" },
};

export const CUSTOMER_TAG: Record<CustomerTag, LabelTone> = {
  vip: { label: "VIP", tone: "accent" },
  recorrente: { label: "Recorrente", tone: "info" },
  novo: { label: "Novo", tone: "neutral" },
  atacado: { label: "Atacado", tone: "ship" },
};

/** Vocabulário do catálogo — acentuado, como se escreve em português. */
export const FAMILY: Record<Family, string> = {
  amadeirado: "Amadeirado",
  oriental: "Oriental",
  ambar: "Âmbar",
  floral: "Floral",
  citrico: "Cítrico",
  aromatico: "Aromático",
  fougere: "Fougère",
  gourmand: "Gourmand",
  aquatico: "Aquático",
};

export const GENDER: Record<Gender, string> = {
  feminino: "Feminino",
  masculino: "Masculino",
  unissex: "Unissex",
};

export const ORIGIN: Record<Origin, string> = {
  arabe: "Árabe",
  importado: "Importado",
  nacional: "Nacional",
};

export const STAFF_ROLE: Record<StaffRole, string> = {
  proprietario: "Proprietário",
  gerente: "Gerente",
  operador: "Operador",
};

export const COUPON_TYPE: Record<CouponType, string> = {
  percent: "Percentual",
  fixed: "Valor fixo",
  free_shipping: "Frete grátis",
};

export const COUPON_STATUS: Record<CouponStatus, LabelTone> = {
  ativo: { label: "Ativo", tone: "ok" },
  agendado: { label: "Agendado", tone: "info" },
  pausado: { label: "Pausado", tone: "neutral" },
  expirado: { label: "Expirado", tone: "bad" },
  esgotado: { label: "Esgotado", tone: "warn" },
};

/** O status do cupom é derivado — nunca digitado por quem cadastra. */
export function couponStatus(coupon: AdminCoupon, now: Date): CouponStatus {
  if (!coupon.active) return "pausado";
  if (new Date(coupon.startsAt).getTime() > now.getTime()) return "agendado";
  if (coupon.endsAt && new Date(coupon.endsAt).getTime() < now.getTime())
    return "expirado";
  if (coupon.usageLimit && coupon.used >= coupon.usageLimit) return "esgotado";
  return "ativo";
}

/** "10%", "R$ 25", "Frete grátis". */
export function couponValueLabel(coupon: AdminCoupon): string {
  if (coupon.type === "percent") return `${coupon.value}%`;
  if (coupon.type === "fixed")
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(coupon.value);
  return "Frete grátis";
}
