/** Cupons simulados. Estrutura pronta para vir de um backend futuramente. */
export interface Coupon {
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number; // percentual (0-100), valor em R$ ou 0 para frete grátis
  label: string;
  minSubtotal?: number;
}

export const coupons: Coupon[] = [
  {
    code: "BEMVINDO10",
    type: "percent",
    value: 10,
    label: "10% de desconto na primeira compra",
  },
  {
    code: "ARABES15",
    type: "percent",
    value: 15,
    label: "15% off na linha de árabes",
    minSubtotal: 250,
  },
  {
    code: "FRETEJA",
    type: "free_shipping",
    value: 0,
    label: "Frete grátis para todo o Brasil",
    minSubtotal: 199,
  },
];

export const findCoupon = (code: string): Coupon | undefined =>
  coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
