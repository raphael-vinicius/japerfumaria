import type { Metadata } from "next";
import { ProductsScreen } from "@/components/admin/screens/ProductsScreen";

export const metadata: Metadata = { title: "Produtos" };

export default function ProductsPage() {
  return <ProductsScreen />;
}
