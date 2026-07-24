/**
 * ————————————————————————————————————————————————————————————
 *  Origem dos dados do painel — o único ponto de acoplamento.
 * ————————————————————————————————————————————————————————————
 *  Hoje devolve a base simulada de `seed.ts`. Quando existir um
 *  backend, é ESTE arquivo que muda (e só ele): `loadDataset`
 *  passa a buscar da API e devolve o mesmo `AdminDataset`.
 *  Nenhuma tela, componente ou seletor precisa ser tocado.
 * ———————————————————————————————————————————————————————————— */

import { categories } from "@/lib/categories";
import {
  currentUser,
  seedCoupons,
  seedCustomerList,
  seedOrders,
  seedProducts,
  seedReviews,
  seedSettings,
  seedStockMovements,
  staff,
} from "./seed";
import type {
  AdminCategory,
  AdminCoupon,
  AdminProduct,
  AdminReview,
  Customer,
  Order,
  StaffUser,
  StockMovement,
  StoreSettings,
} from "./types";

export interface AdminDataset {
  orders: Order[];
  customers: Customer[];
  products: AdminProduct[];
  categories: AdminCategory[];
  coupons: AdminCoupon[];
  reviews: AdminReview[];
  movements: StockMovement[];
  settings: StoreSettings;
  staff: StaffUser[];
  currentUser: StaffUser;
}

export function loadDataset(): AdminDataset {
  return {
    orders: seedOrders,
    customers: seedCustomerList,
    products: seedProducts,
    categories: categories.map((category) => ({ ...category })),
    coupons: seedCoupons,
    reviews: seedReviews,
    movements: seedStockMovements,
    settings: seedSettings,
    staff,
    currentUser,
  };
}
