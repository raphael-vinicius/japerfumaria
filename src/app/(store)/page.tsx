import { Hero } from "@/components/home/Hero";
import { ValueProps } from "@/components/home/ValueProps";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { EditorialBanner } from "@/components/home/EditorialBanner";
import { StoreSection } from "@/components/home/StoreSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { ReviewsShowcase } from "@/components/home/ReviewsShowcase";
import { Newsletter } from "@/components/layout/Newsletter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { bestSellers, newArrivals, featuredProducts } from "@/lib/products";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <CategoryStrip />

      <section className="container-wrap py-12 sm:py-16">
        <SectionHeading
          eyebrow="Os favoritos da loja"
          title="Mais vendidos"
          description="Os perfumes que mais saem das nossas prateleiras — aprovados por quem já comprou."
          href="/busca?sort=mais-vendidos"
        />
        <div className="mt-8">
          <ProductGrid products={bestSellers().slice(0, 8)} />
        </div>
      </section>

      <EditorialBanner />

      <StoreSection />

      <section className="container-wrap py-12 sm:py-16">
        <SectionHeading
          eyebrow="Acabaram de chegar"
          title="Novidades"
          description="Lançamentos e reposições fresquinhas na curadoria JA."
          href="/busca?sort=lancamentos"
        />
        <div className="mt-8">
          <ProductGrid products={newArrivals()} rail />
        </div>
      </section>


      <BrandMarquee />

      <section className="container-wrap py-12 sm:py-16">
        <SectionHeading
          eyebrow="Seleção JA"
          title="Escolhidos a dedo"
          description="Uma vitrine com o que há de melhor entre árabes e importados, do queridinho ao nicho."
          href="/busca"
          align="center"
        />
        <div className="mt-10">
          <ProductGrid products={featuredProducts()} />
        </div>
      </section>

      <ReviewsShowcase />
      <Newsletter />
    </>
  );
}
