/**
 * ————————————————————————————————————————————————————————————
 *  Modelo de domínio do painel administrativo.
 * ————————————————————————————————————————————————————————————
 *  Independente da camada de apresentação e da vitrine. Quando
 *  houver backend, estas interfaces viram o contrato da API: a
 *  troca acontece só em `source.ts`, sem tocar em componentes.
 * ———————————————————————————————————————————————————————————— */

import type { Category, Product } from "@/lib/types";

/* ————————————————————————— Pedidos ————————————————————————— */

export type OrderStatus =
  | "aguardando_pagamento"
  | "pago"
  | "separando"
  | "enviado"
  | "entregue"
  | "cancelado";

export type PaymentMethod = "pix" | "credito" | "boleto";

export type PaymentStatus = "pendente" | "aprovado" | "recusado" | "estornado";

export type ShippingMethod = "retirada" | "padrao" | "expressa";

export type SalesChannel = "site" | "whatsapp" | "loja" | "instagram";

export interface Address {
  zip: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  sku: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  /** unitPrice × quantity — sempre recalculado, nunca digitado. */
  total: number;
}

export interface OrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  installments: number;
  /** Bandeira do cartão, quando aplicável. */
  cardBrand?: string;
  cardLast4?: string;
  /** Identificador da transação no adquirente (simulado). */
  transactionId: string;
  paidAt?: string;
}

export interface OrderShipping {
  method: ShippingMethod;
  label: string;
  fee: number;
  address: Address;
  carrier?: string;
  trackingCode?: string;
  shippedAt?: string;
  deliveredAt?: string;
  /** Prazo prometido ao cliente, em dias úteis. */
  estimateDays: number;
}

export type OrderEventType =
  | "criado"
  | "pagamento"
  | "separacao"
  | "envio"
  | "entrega"
  | "cancelamento"
  | "nota"
  | "rastreio";

export interface OrderEvent {
  id: string;
  at: string;
  type: OrderEventType;
  label: string;
  detail?: string;
  author: string;
}

export interface OrderNote {
  id: string;
  at: string;
  author: string;
  body: string;
}

export interface Order {
  id: string;
  /** Número sequencial exibido ao cliente e à operação. */
  number: number;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  channel: SalesChannel;
  items: OrderItem[];
  payment: OrderPayment;
  shipping: OrderShipping;
  couponCode?: string;
  /** Σ dos itens. */
  subtotal: number;
  discount: number;
  /** subtotal − discount + frete. */
  total: number;
  timeline: OrderEvent[];
  notes: OrderNote[];
  /** Recado deixado pelo cliente no checkout. */
  customerMessage?: string;
}

/* ———————————————————————— Clientes ———————————————————————— */

export type CustomerTag = "vip" | "recorrente" | "novo" | "atacado";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate?: string;
  createdAt: string;
  addresses: Address[];
  tags: CustomerTag[];
  notes: OrderNote[];
  /** Aceite de marketing declarado no cadastro. */
  acceptsMarketing: boolean;
}

/** Métricas do cliente — sempre derivadas dos pedidos, nunca gravadas. */
export interface CustomerStats {
  orderCount: number;
  totalSpent: number;
  averageTicket: number;
  lastOrderAt?: string;
  firstOrderAt?: string;
  favoriteCategory?: string;
}

/* ———————————————————————— Catálogo ———————————————————————— */

export type ProductStatus = "ativo" | "rascunho" | "arquivado";

/**
 * Produto na visão da operação: o catálogo público (`Product`)
 * acrescido dos campos que só o painel manipula.
 */
export interface AdminProduct extends Product {
  sku: string;
  status: ProductStatus;
  /** Custo de aquisição — base da margem. */
  cost: number;
  barcode: string;
  weightGrams: number;
  /** Caixa fechada, em centímetros — base do cálculo de frete. */
  dimensionsCm: { length: number; width: number; height: number };
  fragile: boolean;
  /** Estoque mínimo antes do alerta de reposição. */
  stockMin: number;
  supplier: string;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Categoria na visão da operação. A vitrine deriva a imagem do
 * produto-símbolo (`heroSlug`); aqui é possível fixar uma arte
 * própria sem mexer no contrato público de `Category`.
 */
export interface AdminCategory extends Category {
  image?: string;
}

/* ————————————————————————— Estoque ————————————————————————— */

export type StockMovementType = "entrada" | "saida" | "ajuste";

export interface StockMovement {
  id: string;
  productId: string;
  at: string;
  type: StockMovementType;
  /** Entrada e saída: sempre positivo. Ajuste: delta com sinal. */
  quantity: number;
  reason: string;
  author: string;
  /** Saldo resultante logo após o movimento. */
  balanceAfter: number;
  /** Pedido que originou a saída, quando houver. */
  orderNumber?: number;
}

export type StockHealth =
  | "sem_estoque"
  | "critico"
  | "baixo"
  | "saudavel"
  /** Produto fora da vitrine: não gera alerta de ruptura. */
  | "nao_publicado";

/** Linha da tela de estoque — inteiramente derivada. */
export interface StockRow {
  product: AdminProduct;
  onHand: number;
  /** Unidades comprometidas em pedidos ainda não enviados. */
  reserved: number;
  available: number;
  min: number;
  health: StockHealth;
}

/* ————————————————————————— Cupons ————————————————————————— */

export type CouponType = "percent" | "fixed" | "free_shipping";
export type CouponStatus =
  | "ativo"
  | "agendado"
  | "pausado"
  | "expirado"
  | "esgotado";

export interface AdminCoupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  /** % (0–100), R$ ou 0 para frete grátis. */
  value: number;
  startsAt: string;
  endsAt?: string;
  usageLimit?: number;
  used: number;
  minSubtotal?: number;
  active: boolean;
}

/* ———————————————————————— Avaliações ———————————————————————— */

export type ReviewStatus = "pendente" | "publicada" | "oculta";

export interface AdminReview {
  id: string;
  productId: string;
  customerId?: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  status: ReviewStatus;
  /** Compra confirmada em pedido entregue. */
  verified: boolean;
  reply?: { body: string; at: string; author: string };
}

/* ———————————————————— Equipe e atividades ———————————————————— */

export type StaffRole = "proprietario" | "gerente" | "operador";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  lastAccessAt: string;
  initials: string;
}

export type ActivityKind =
  | "pedido"
  | "estoque"
  | "avaliacao"
  | "cliente"
  | "cupom";

export interface ActivityEntry {
  id: string;
  at: string;
  kind: ActivityKind;
  message: string;
  author: string;
  href?: string;
}

/* ———————————————————————— Configurações ———————————————————————— */

export interface StoreSettings {
  storeName: string;
  legalName: string;
  cnpj: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: Address;
  freeShippingThreshold: number;
  localDeliveryFee: number;
  standardShippingFee: number;
  expressShippingFee: number;
  pixDiscountPercent: number;
  maxInstallments: number;
  minInstallmentValue: number;
  lowStockAlert: number;
  seoTitle: string;
  seoDescription: string;
  /** Notificações transacionais ativas. */
  emails: {
    orderPlaced: boolean;
    paymentApproved: boolean;
    orderShipped: boolean;
    orderDelivered: boolean;
    abandonedCart: boolean;
    reviewRequest: boolean;
  };
  integrations: {
    id: string;
    name: string;
    description: string;
    connected: boolean;
  }[];
}
