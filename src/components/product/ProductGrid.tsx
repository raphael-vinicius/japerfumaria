import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

interface Props {
  products: Product[];
  /** exibe em trilho horizontal (mobile-first) em vez de grade */
  rail?: boolean;
}

export function ProductGrid({ products, rail = false }: Props) {
  if (rail) {
    return (
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[70%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <RevealOnScroll key={p.id} delay={(i % 4) * 70}>
          <ProductCard product={p} />
        </RevealOnScroll>
      ))}
    </div>
  );
}
