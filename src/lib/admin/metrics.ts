/**
 * Seletores de métrica — a única fonte de números do painel.
 *
 * Nenhuma tela calcula faturamento por conta própria: dashboard,
 * relatórios e ficha do cliente chamam as mesmas funções puras
 * daqui. É isso que garante que dois lugares nunca discordem.
 *
 * Convenção da casa: pedidos cancelados não contam como venda em
 * lugar nenhum. Só aparecem onde o assunto é cancelamento.
 */

import { categories } from "@/lib/categories";
import {
  NOW,
  addDays,
  dayKey,
  daysBetween,
  formatDateShort,
  startOfMonth,
} from "./datetime";
import { round2 } from "./random";
import type {
  ActivityEntry,
  AdminProduct,
  AdminReview,
  Customer,
  CustomerStats,
  Order,
  OrderStatus,
  StockHealth,
  StockMovement,
  StockRow,
} from "./types";

/* ————————————————————————— Base ————————————————————————— */

export const isRevenue = (order: Order) => order.status !== "cancelado";

/** Pedidos que entram em faturamento, no intervalo [from, to]. */
export const inRange = (orders: Order[], from: Date, to: Date): Order[] => {
  const start = from.getTime();
  const end = to.getTime();
  return orders.filter((o) => {
    const at = new Date(o.createdAt).getTime();
    return at >= start && at <= end;
  });
};

export const sumRevenue = (orders: Order[]) =>
  round2(orders.filter(isRevenue).reduce((sum, o) => sum + o.total, 0));

export const sumUnits = (orders: Order[]) =>
  orders
    .filter(isRevenue)
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

export const averageTicket = (orders: Order[]) => {
  const valid = orders.filter(isRevenue);
  return valid.length ? round2(sumRevenue(valid) / valid.length) : 0;
};

export const countByStatus = (orders: Order[], status: OrderStatus) =>
  orders.filter((o) => o.status === status).length;

/** Variação percentual entre dois períodos. */
export const delta = (current: number, previous: number): number | null => {
  if (!previous) return current > 0 ? null : 0;
  return round2(((current - previous) / previous) * 100);
};

/* ———————————————————————— Dashboard ———————————————————————— */

export interface DashboardMetrics {
  revenueToday: number;
  revenueTodayDelta: number | null;
  revenueMonth: number;
  revenueMonthDelta: number | null;
  ordersToday: number;
  ordersTodayDelta: number | null;
  awaitingPayment: number;
  awaitingPicking: number;
  shipped: number;
  averageTicket: number;
  averageTicketDelta: number | null;
  unitsSoldMonth: number;
  /** Faturamento dia a dia dos últimos 30 dias. */
  revenueSeries: { date: string; label: string; value: number }[];
}

export function dashboardMetrics(orders: Order[]): DashboardMetrics {
  const todayKey = dayKey(NOW);

  const today = orders.filter((o) => dayKey(o.createdAt) === todayKey);

  /**
   * O dia de hoje é comparado com a média dos 7 dias anteriores, e
   * não com ontem. Numa loja que faz 2 a 4 pedidos por dia, um dia
   * fraco vira "+600%" no dia seguinte — variação real, informação
   * nenhuma. Contra a média da semana, o número volta a significar
   * "hoje está acima ou abaixo de um dia normal".
   */
  const lastSevenDays: Order[][] = [];
  for (let i = 1; i <= 7; i++) {
    const key = dayKey(addDays(NOW, -i));
    lastSevenDays.push(orders.filter((o) => dayKey(o.createdAt) === key));
  }
  const weekRevenueAverage =
    lastSevenDays.reduce((sum, day) => sum + sumRevenue(day), 0) / 7;
  const weekOrdersAverage =
    lastSevenDays.reduce((sum, day) => sum + day.filter(isRevenue).length, 0) /
    7;

  const monthStart = startOfMonth(NOW);
  const month = inRange(orders, monthStart, NOW);

  // Mesmo trecho do mês anterior — comparar 23 dias com 31 mentiria.
  const prevMonthStart = startOfMonth(addDays(monthStart, -1));
  const prevMonthSameDay = addDays(prevMonthStart, daysBetween(monthStart, NOW));
  const prevMonth = inRange(orders, prevMonthStart, prevMonthSameDay);

  const series: DashboardMetrics["revenueSeries"] = [];
  for (let i = 29; i >= 0; i--) {
    const day = addDays(NOW, -i);
    const key = dayKey(day);
    series.push({
      date: key,
      label: formatDateShort(day),
      value: sumRevenue(orders.filter((o) => dayKey(o.createdAt) === key)),
    });
  }

  return {
    revenueToday: sumRevenue(today),
    revenueTodayDelta: delta(sumRevenue(today), weekRevenueAverage),
    revenueMonth: sumRevenue(month),
    revenueMonthDelta: delta(sumRevenue(month), sumRevenue(prevMonth)),
    ordersToday: today.filter(isRevenue).length,
    ordersTodayDelta: delta(today.filter(isRevenue).length, weekOrdersAverage),
    awaitingPayment: countByStatus(orders, "aguardando_pagamento"),
    awaitingPicking: countByStatus(orders, "pago"),
    shipped: countByStatus(orders, "enviado"),
    averageTicket: averageTicket(month),
    averageTicketDelta: delta(averageTicket(month), averageTicket(prevMonth)),
    unitsSoldMonth: sumUnits(month),
    revenueSeries: series,
  };
}

/* ———————————————————————— Produtos ———————————————————————— */

export interface ProductSales {
  product: AdminProduct;
  units: number;
  revenue: number;
  orders: number;
}

export function productSales(
  orders: Order[],
  products: AdminProduct[],
): ProductSales[] {
  const byId = new Map<string, { units: number; revenue: number; orders: number }>();

  for (const order of orders) {
    if (!isRevenue(order)) continue;
    for (const item of order.items) {
      const acc = byId.get(item.productId) ?? { units: 0, revenue: 0, orders: 0 };
      acc.units += item.quantity;
      acc.revenue = round2(acc.revenue + item.total);
      acc.orders += 1;
      byId.set(item.productId, acc);
    }
  }

  return products
    .map((product) => ({
      product,
      units: byId.get(product.id)?.units ?? 0,
      revenue: byId.get(product.id)?.revenue ?? 0,
      orders: byId.get(product.id)?.orders ?? 0,
    }))
    .sort((a, b) => b.units - a.units);
}

/* ———————————————————————— Categorias ———————————————————————— */

export interface CategorySales {
  slug: string;
  name: string;
  units: number;
  revenue: number;
  share: number;
}

export function categorySales(
  orders: Order[],
  products: AdminProduct[],
): CategorySales[] {
  const categoryOf = new Map(products.map((p) => [p.id, p.categorySlug]));
  const acc = new Map<string, { units: number; revenue: number }>();

  for (const order of orders) {
    if (!isRevenue(order)) continue;
    for (const item of order.items) {
      const slug = categoryOf.get(item.productId);
      if (!slug) continue;
      const current = acc.get(slug) ?? { units: 0, revenue: 0 };
      current.units += item.quantity;
      current.revenue = round2(current.revenue + item.total);
      acc.set(slug, current);
    }
  }

  const total = [...acc.values()].reduce((s, v) => s + v.revenue, 0);

  return categories
    .map((category) => {
      const data = acc.get(category.slug) ?? { units: 0, revenue: 0 };
      return {
        slug: category.slug,
        name: category.name,
        units: data.units,
        revenue: data.revenue,
        share: total ? round2((data.revenue / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

/* ———————————————————————— Clientes ———————————————————————— */

export function customerStats(
  customerId: string,
  orders: Order[],
  products: AdminProduct[],
): CustomerStats {
  const own = orders
    .filter((o) => o.customerId === customerId && isRevenue(o))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const totalSpent = round2(own.reduce((sum, o) => sum + o.total, 0));
  const categoryOf = new Map(products.map((p) => [p.id, p.categorySlug]));
  const byCategory = new Map<string, number>();

  for (const order of own) {
    for (const item of order.items) {
      const slug = categoryOf.get(item.productId);
      if (!slug) continue;
      byCategory.set(slug, (byCategory.get(slug) ?? 0) + item.quantity);
    }
  }

  const favorite = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    orderCount: own.length,
    totalSpent,
    averageTicket: own.length ? round2(totalSpent / own.length) : 0,
    lastOrderAt: own[0]?.createdAt,
    firstOrderAt: own[own.length - 1]?.createdAt,
    favoriteCategory: favorite
      ? categories.find((c) => c.slug === favorite[0])?.name
      : undefined,
  };
}

export interface CustomerRow {
  customer: Customer;
  stats: CustomerStats;
}

export function customerRows(
  customers: Customer[],
  orders: Order[],
  products: AdminProduct[],
): CustomerRow[] {
  return customers
    .map((customer) => ({
      customer,
      stats: customerStats(customer.id, orders, products),
    }))
    .sort((a, b) => b.stats.totalSpent - a.stats.totalSpent);
}

/* ————————————————————————— Estoque ————————————————————————— */

/**
 * Só o pedido pago reserva estoque.
 *
 * Em "separando" a mercadoria já saiu fisicamente da prateleira —
 * é nesse momento que o movimento de saída é gravado. Contar o
 * pedido como reservado depois disso subtrairia a mesma unidade
 * duas vezes do disponível.
 */
const RESERVING: OrderStatus[] = ["pago"];

export function stockRows(
  products: AdminProduct[],
  orders: Order[],
): StockRow[] {
  const reserved = new Map<string, number>();
  for (const order of orders) {
    if (!RESERVING.includes(order.status)) continue;
    for (const item of order.items) {
      reserved.set(
        item.productId,
        (reserved.get(item.productId) ?? 0) + item.quantity,
      );
    }
  }

  return products
    .map((product) => {
      const onHand = product.stock;
      const held = reserved.get(product.id) ?? 0;
      const available = onHand - held;
      let health: StockHealth = "saudavel";
      // Rascunho e arquivado não estão à venda: zero unidades ali
      // é situação normal, não ruptura.
      if (product.status !== "ativo") health = "nao_publicado";
      else if (onHand <= 0) health = "sem_estoque";
      else if (available <= 0) health = "critico";
      else if (available <= product.stockMin) health = "baixo";

      return {
        product,
        onHand,
        reserved: held,
        available,
        min: product.stockMin,
        health,
      };
    })
    .sort((a, b) => {
      // O que precisa de decisão primeiro; rascunhos por último.
      const rank: Record<StockHealth, number> = {
        sem_estoque: 0,
        critico: 1,
        baixo: 2,
        saudavel: 3,
        nao_publicado: 4,
      };
      return rank[a.health] - rank[b.health] || a.available - b.available;
    });
}

/** Linhas que exigem reposição — a base de todo alerta do painel. */
export const lowStockRows = (rows: StockRow[]) =>
  rows.filter(
    (r) => r.health !== "saudavel" && r.health !== "nao_publicado",
  );

export const stockValue = (rows: StockRow[]) =>
  round2(rows.reduce((sum, r) => sum + r.onHand * r.product.cost, 0));

export const movementsOf = (movements: StockMovement[], productId: string) =>
  movements
    .filter((m) => m.productId === productId)
    .sort((a, b) => b.at.localeCompare(a.at));

/* ————————————————————————— Relatórios ————————————————————————— */

export interface PaymentBreakdown {
  method: string;
  label: string;
  orders: number;
  revenue: number;
  share: number;
}

export function paymentBreakdown(orders: Order[]): PaymentBreakdown[] {
  const labels: Record<string, string> = {
    pix: "Pix",
    credito: "Cartão de crédito",
    boleto: "Boleto",
  };
  const acc = new Map<string, { orders: number; revenue: number }>();

  for (const order of orders) {
    if (!isRevenue(order)) continue;
    const current = acc.get(order.payment.method) ?? { orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue = round2(current.revenue + order.total);
    acc.set(order.payment.method, current);
  }

  const total = [...acc.values()].reduce((s, v) => s + v.revenue, 0);

  return [...acc.entries()]
    .map(([method, data]) => ({
      method,
      label: labels[method] ?? method,
      orders: data.orders,
      revenue: data.revenue,
      share: total ? round2((data.revenue / total) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface ChannelBreakdown {
  channel: string;
  label: string;
  orders: number;
  revenue: number;
  share: number;
}

export function channelBreakdown(orders: Order[]): ChannelBreakdown[] {
  const labels: Record<string, string> = {
    site: "Site",
    whatsapp: "WhatsApp",
    loja: "Loja física",
    instagram: "Instagram",
  };
  const acc = new Map<string, { orders: number; revenue: number }>();

  for (const order of orders) {
    if (!isRevenue(order)) continue;
    const current = acc.get(order.channel) ?? { orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue = round2(current.revenue + order.total);
    acc.set(order.channel, current);
  }

  const total = [...acc.values()].reduce((s, v) => s + v.revenue, 0);

  return [...acc.entries()]
    .map(([channel, data]) => ({
      channel,
      label: labels[channel] ?? channel,
      orders: data.orders,
      revenue: data.revenue,
      share: total ? round2((data.revenue / total) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Série diária de faturamento e pedidos para o período escolhido. */
export function revenueByDay(orders: Order[], from: Date, to: Date) {
  const days = Math.max(0, daysBetween(from, to));
  const out: { date: string; label: string; revenue: number; orders: number }[] = [];

  for (let i = 0; i <= days; i++) {
    const day = addDays(from, i);
    const key = dayKey(day);
    const ofDay = orders.filter((o) => dayKey(o.createdAt) === key);
    out.push({
      date: key,
      label: formatDateShort(day),
      revenue: sumRevenue(ofDay),
      orders: ofDay.filter(isRevenue).length,
    });
  }
  return out;
}

/** Agrupamento mensal — usado quando o período passa de 60 dias. */
export function revenueByMonth(orders: Order[], from: Date, to: Date) {
  const acc = new Map<string, { revenue: number; orders: number }>();
  for (const order of inRange(orders, from, to)) {
    if (!isRevenue(order)) continue;
    const key = dayKey(order.createdAt).slice(0, 7);
    const current = acc.get(key) ?? { revenue: 0, orders: 0 };
    current.revenue = round2(current.revenue + order.total);
    current.orders += 1;
    acc.set(key, current);
  }
  return [...acc.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, data]) => ({
      date: key,
      label: new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        month: "short",
      })
        .format(new Date(`${key}-15T12:00:00-03:00`))
        .replace(".", ""),
      ...data,
    }));
}

/* ———————————————————————— Atividades ———————————————————————— */

/**
 * Feed de atividades derivado do estado atual — nenhuma entrada é
 * inventada. Cada linha aponta para o registro que a originou, o
 * que torna o bloco navegável em vez de decorativo.
 */
export function activityFeed(
  input: {
    orders: Order[];
    customers: Customer[];
    products: AdminProduct[];
    movements: StockMovement[];
    reviews: AdminReview[];
  },
  limit = 18,
): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const nameOf = new Map(input.customers.map((c) => [c.id, c.name]));
  const productOf = new Map(input.products.map((p) => [p.id, p.name]));

  for (const order of input.orders.slice(0, 30)) {
    for (const event of order.timeline) {
      entries.push({
        id: `act-${event.id}`,
        at: event.at,
        kind: "pedido",
        message: `${event.label} — #${order.number} · ${nameOf.get(order.customerId) ?? "Cliente"}`,
        author: event.author,
        href: `/admin/pedidos/${order.number}`,
      });
    }
  }

  for (const movement of input.movements.slice(0, 20)) {
    if (movement.type === "saida") continue;
    entries.push({
      id: `act-${movement.id}`,
      at: movement.at,
      kind: "estoque",
      message:
        movement.type === "entrada"
          ? `Entrada de ${movement.quantity} un. — ${productOf.get(movement.productId) ?? ""}`
          : `Ajuste de ${movement.quantity > 0 ? "+" : ""}${movement.quantity} un. — ${productOf.get(movement.productId) ?? ""}`,
      author: movement.author,
      href: `/admin/estoque?produto=${movement.productId}`,
    });
  }

  for (const review of input.reviews.slice(0, 12)) {
    entries.push({
      id: `act-${review.id}`,
      at: review.createdAt,
      kind: "avaliacao",
      message: `Avaliação ${review.rating}★ em ${productOf.get(review.productId) ?? ""} — ${review.author}`,
      author: review.author,
      href: "/admin/avaliacoes",
    });
  }

  for (const customer of input.customers) {
    if (daysBetween(customer.createdAt, NOW) > 10) continue;
    entries.push({
      id: `act-cli-${customer.id}`,
      at: customer.createdAt,
      kind: "cliente",
      message: `Novo cliente cadastrado — ${customer.name}`,
      author: "Sistema",
      href: `/admin/clientes/${customer.id}`,
    });
  }

  return entries
    .filter((entry) => new Date(entry.at).getTime() <= NOW.getTime())
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

/* ———————————————————————— Avaliações ———————————————————————— */

export const reviewStats = (reviews: AdminReview[]) => {
  const published = reviews.filter((r) => r.status === "publicada");
  const average = published.length
    ? round2(
        published.reduce((sum, r) => sum + r.rating, 0) / published.length,
      )
    : 0;
  return {
    pending: reviews.filter((r) => r.status === "pendente").length,
    published: published.length,
    hidden: reviews.filter((r) => r.status === "oculta").length,
    average,
    unanswered: published.filter((r) => !r.reply).length,
  };
};
