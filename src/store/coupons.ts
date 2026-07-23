export interface Coupon {
  code: string;
  label: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
}

export const coupons: Coupon[] = [
  {
    code: "BEMVINDO10",
    label: "10% de boas-vindas",
    type: "percent",
    value: 10,
  },
  {
    code: "JASTORE15",
    label: "15% acima de R$ 400",
    type: "percent",
    value: 15,
    minSubtotal: 400,
  },
  {
    code: "PIX5",
    label: "5% extra no Pix",
    type: "percent",
    value: 5,
  },
];

export const findCoupon = (code: string): Coupon | undefined =>
  coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
