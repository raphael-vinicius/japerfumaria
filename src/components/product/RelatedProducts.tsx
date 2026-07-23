import type { Product } from "@/lib/types";
import { relatedProducts } from "@/lib/products";
import { ProductGrid } from "./ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function RelatedProducts({ product }: { product: Product }) {
  const related = relatedProducts(product, 4);
  if (related.length === 0) return null;
  return (
    <section className="container-wrap py-16">
      <SectionHeading
        eyebrow="Você também vai gostar"
        title="Combina com esta escolha"
      />
      <div className="mt-8">
        <ProductGrid products={related} />
      </div>
    </section>
  );
}
