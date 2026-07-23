/**
 * Dados fictícios para o painel administrativo (apenas visual).
 * Nenhuma informação real — números coerentes para demonstração.
 */

export type OrderStatus =
  | "Pendente"
  | "Pago"
  | "Enviado"
  | "Entregue"
  | "Cancelado";

export interface AdminOrder {
  id: string;
  customer: string;
  city: string;
  date: string;
  items: number;
  total: number;
  status: OrderStatus;
  payment: "Pix" | "Cartão";
}

export interface AdminCustomer {
  name: string;
  email: string;
  city: string;
  orders: number;
  spent: number;
  since: string;
  tier: "Novo" | "Recorrente" | "VIP";
}

export const kpis = [
  { label: "Faturamento (mês)", value: "R$ 48.720", delta: +18.4, positive: true },
  { label: "Pedidos", value: "312", delta: +9.1, positive: true },
  { label: "Ticket médio", value: "R$ 156", delta: +4.2, positive: true },
  { label: "Novos clientes", value: "87", delta: -2.3, positive: false },
];

export const revenueSeries = [
  { label: "Jan", value: 28 },
  { label: "Fev", value: 31 },
  { label: "Mar", value: 26 },
  { label: "Abr", value: 34 },
  { label: "Mai", value: 39 },
  { label: "Jun", value: 43 },
  { label: "Jul", value: 48 },
];

export const channelSplit = [
  { label: "Loja física", value: 42, color: "#171310" },
  { label: "Site", value: 33, color: "#B08D57" },
  { label: "WhatsApp", value: 18, color: "#5E6B57" },
  { label: "Instagram", value: 7, color: "#6E1A2B" },
];

export const orders: AdminOrder[] = [
  { id: "JA-748213", customer: "Camila Rodrigues", city: "Itu - SP", date: "21/07", items: 2, total: 369.8, status: "Pago", payment: "Pix" },
  { id: "JA-748210", customer: "Rodrigo Alves", city: "Jundiaí - SP", date: "21/07", items: 1, total: 699.9, status: "Enviado", payment: "Cartão" },
  { id: "JA-748204", customer: "Patrícia Gomes", city: "Cabreúva - SP", date: "20/07", items: 3, total: 549.7, status: "Entregue", payment: "Pix" },
  { id: "JA-748198", customer: "Bruno Santos", city: "Salto - SP", date: "20/07", items: 1, total: 199.9, status: "Pago", payment: "Pix" },
  { id: "JA-748193", customer: "Fernanda Lima", city: "Sorocaba - SP", date: "19/07", items: 2, total: 429.8, status: "Pendente", payment: "Cartão" },
  { id: "JA-748187", customer: "Diego Pereira", city: "Campinas - SP", date: "19/07", items: 4, total: 812.5, status: "Enviado", payment: "Cartão" },
  { id: "JA-748180", customer: "Larissa Vieira", city: "Cabreúva - SP", date: "18/07", items: 1, total: 179.9, status: "Entregue", payment: "Pix" },
  { id: "JA-748176", customer: "Anderson Teixeira", city: "Indaiatuba - SP", date: "18/07", items: 2, total: 259.8, status: "Cancelado", payment: "Cartão" },
  { id: "JA-748171", customer: "Tatiane Barbosa", city: "Cabreúva - SP", date: "17/07", items: 3, total: 634.7, status: "Entregue", payment: "Pix" },
  { id: "JA-748165", customer: "Henrique Oliveira", city: "Várzea Paulista - SP", date: "17/07", items: 1, total: 224.9, status: "Pago", payment: "Pix" },
];

export const customers: AdminCustomer[] = [
  { name: "Camila Rodrigues", email: "camila.r@email.com", city: "Itu - SP", orders: 8, spent: 2340, since: "2023", tier: "VIP" },
  { name: "Rodrigo Alves", email: "rodrigo.a@email.com", city: "Jundiaí - SP", orders: 5, spent: 1890, since: "2024", tier: "Recorrente" },
  { name: "Patrícia Gomes", email: "paty.gomes@email.com", city: "Cabreúva - SP", orders: 12, spent: 3720, since: "2022", tier: "VIP" },
  { name: "Bruno Santos", email: "bruno.s@email.com", city: "Salto - SP", orders: 3, spent: 640, since: "2025", tier: "Recorrente" },
  { name: "Fernanda Lima", email: "fe.lima@email.com", city: "Sorocaba - SP", orders: 1, spent: 429, since: "2026", tier: "Novo" },
  { name: "Diego Pereira", email: "diego.p@email.com", city: "Campinas - SP", orders: 6, spent: 2110, since: "2024", tier: "Recorrente" },
  { name: "Larissa Vieira", email: "lari.v@email.com", city: "Cabreúva - SP", orders: 2, spent: 359, since: "2025", tier: "Novo" },
  { name: "Anderson Teixeira", email: "anderson.t@email.com", city: "Indaiatuba - SP", orders: 4, spent: 980, since: "2024", tier: "Recorrente" },
];

export interface AdminCoupon {
  code: string;
  type: string;
  value: string;
  uses: number;
  limit: number;
  status: "Ativo" | "Pausado" | "Expirado";
}

export const adminCoupons: AdminCoupon[] = [
  { code: "BEMVINDO10", type: "Percentual", value: "10%", uses: 143, limit: 500, status: "Ativo" },
  { code: "JASTORE15", type: "Percentual", value: "15%", uses: 61, limit: 200, status: "Ativo" },
  { code: "PIX5", type: "Percentual", value: "5%", uses: 289, limit: 1000, status: "Ativo" },
  { code: "FRETEGRATIS", type: "Frete", value: "Grátis", uses: 78, limit: 150, status: "Pausado" },
  { code: "BLACK50", type: "Percentual", value: "50%", uses: 320, limit: 320, status: "Expirado" },
];

export const statusStyles: Record<OrderStatus, string> = {
  Pendente: "bg-amber-100 text-amber-800",
  Pago: "bg-blue-100 text-blue-800",
  Enviado: "bg-violet-100 text-violet-800",
  Entregue: "bg-emerald-100 text-emerald-800",
  Cancelado: "bg-rose-100 text-rose-700",
};
