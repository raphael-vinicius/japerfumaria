import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize sua compra na JA Store Perfumaria.",
};

export default function CheckoutPage() {
  return (
    <div className="container-wrap py-10">
      <header className="mb-8">
        <p className="eyebrow">Finalizar compra</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Checkout
        </h1>
      </header>
      <CheckoutFlow />
    </div>
  );
}
