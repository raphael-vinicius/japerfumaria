import type { Metadata } from "next";
import { Suspense } from "react";
import { StockScreen } from "@/components/admin/screens/StockScreen";
import { LoadingState } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Estoque" };

/** Suspense: a tela pode receber ?produto= vindo da ficha do produto. */
export default function StockPage() {
  return (
    <Suspense fallback={<LoadingState label="Carregando estoque…" />}>
      <StockScreen />
    </Suspense>
  );
}
