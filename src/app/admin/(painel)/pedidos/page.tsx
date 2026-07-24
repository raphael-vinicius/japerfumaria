import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersScreen } from "@/components/admin/screens/OrdersScreen";
import { LoadingState } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Pedidos" };

/** Suspense: a tela lê filtros da URL via useSearchParams. */
export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingState label="Carregando pedidos…" />}>
      <OrdersScreen />
    </Suspense>
  );
}
