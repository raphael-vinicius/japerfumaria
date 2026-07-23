import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Truck,
  ShieldCheck,
  RefreshCw,
  Store,
  Sparkles,
  Star,
} from "lucide-react";
import { getProduct, products } from "@/lib/products";
import { getCategory } from "@/lib/categories";
import { siteUrl, brand as storeBrand } from "@/lib/brand";
import { discountPercent } from "@/lib/format";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { DeliveryEstimator } from "@/components/product/DeliveryEstimator";
import { NotesPyramid } from "@/components/product/NotesPyramid";
import { PerformanceMeters } from "@/components/product/PerformanceMeters";
import { Reviews } from "@/components/product/Reviews";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Accordion } from "@/components/ui/Accordion";
import { Price } from "@/components/ui/Price";
import { StarRating } from "@/components/ui/StarRating";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const product = getProduct(params.slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: `${product.name} — ${product.brand}`,
    description: product.description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      title: `${product.brand} ${product.name} · ${product.subtitle}`,
      description: product.description,
      type: "website",
      locale: "pt_BR",
      ...(product.image ? { images: [{ url: product.image }] } : {}),
    },
  };
}

const badges = [
  { icon: ShieldCheck, text: "100% original" },
  { icon: Truck, text: "Envio expresso" },
  { icon: RefreshCw, text: "Troca em 7 dias" },
  { icon: Store, text: "Retire na loja" },
];

export default function ProductPage({ params }: Params) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const category = getCategory(product.categorySlug);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const lowStock = product.stock > 0 && product.stock <= 8;

  // Dados estruturados do produto (Schema.org) para rich results
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    description: product.description,
    ...(product.image ? { image: `${siteUrl}${product.image}` } : {}),
    brand: { "@type": "Brand", name: product.brand },
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/produto/${product.slug}`,
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: storeBrand.name },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="container-wrap pt-6">
        <Breadcrumb
          items={[
            { label: category?.name ?? "Perfumes", href: `/categoria/${product.categorySlug}` },
            { label: product.name },
          ]}
        />
      </div>

      <section className="container-wrap grid gap-10 py-8 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery product={product} />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide2 text-champagne-dark">
              {product.brand}
            </span>
            {product.bestSeller && (
              <span className="inline-flex items-center gap-1 rounded-full bg-champagne-soft/50 px-2.5 py-1 text-2xs font-semibold uppercase text-champagne-dark">
                <Sparkles size={11} /> Mais vendido
              </span>
            )}
          </div>

          <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {product.subtitle}
          </p>

          <a
            href="#avaliacoes"
            className="mt-3 inline-flex w-fit items-center gap-2"
          >
            <StarRating
              rating={product.rating}
              showValue
              count={product.reviewCount}
            />
          </a>

          <div className="mt-6">
            <Price
              price={product.price}
              compareAt={product.compareAtPrice}
              size="lg"
            />
            {discount > 0 && (
              <p className="mt-1 text-sm font-semibold text-wine">
                Economize {discount}% · à vista no Pix
              </p>
            )}
          </div>

          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-700">
            {product.description}
          </p>

          {lowStock && (
            <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-wine/5 px-3 py-1.5 text-xs font-semibold text-wine">
              <Star size={12} className="fill-wine" /> Corra! Últimas{" "}
              {product.stock} unidades em estoque
            </p>
          )}

          <div className="mt-7">
            <ProductActions product={product} />
          </div>

          <div className="mt-7">
            <DeliveryEstimator />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((b) => (
              <div
                key={b.text}
                className="flex flex-col items-center gap-2 rounded-xs border border-ink/10 bg-ivory-50 px-2 py-4 text-center"
              >
                <b.icon size={20} className="text-champagne-dark" />
                <span className="text-xs font-medium text-ink-700">
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detalhes */}
      <section className="container-wrap py-8">
        <div className="mx-auto max-w-3xl">
          <Accordion
            items={[
              {
                title: "Descrição completa",
                content: (
                  <div className="grid gap-4">
                    <p>{product.description}</p>
                    <p>
                      Ideal para{" "}
                      {product.gender === "feminino"
                        ? "ela"
                        : product.gender === "masculino"
                          ? "ele"
                          : "todos"}
                      , com perfil olfativo {product.family}. Uma fragrância{" "}
                      {product.origin === "arabe"
                        ? "árabe importada"
                        : "importada original"}{" "}
                      com {product.concentration} de {product.sizeMl}ml.
                    </p>
                  </div>
                ),
              },
              {
                title: "Notas olfativas",
                content: (
                  <div className="grid gap-8">
                    <NotesPyramid notes={product.notes} />
                    <PerformanceMeters product={product} />
                  </div>
                ),
              },
              {
                title: "Entrega e prazos",
                content: (
                  <ul className="grid list-disc gap-2 pl-5">
                    <li>
                      Entrega expressa em Cabreúva e região (Jundiaí, Itu, Salto,
                      Indaiatuba) em 1 a 2 dias úteis.
                    </li>
                    <li>Frete grátis para pedidos acima de R$ 299 em SP.</li>
                    <li>
                      Envio para todo o Brasil via Correios (3 a 10 dias úteis).
                    </li>
                    <li>Opção de retirada gratuita na loja física.</li>
                  </ul>
                ),
              },
              {
                title: "Trocas e devoluções",
                content: (
                  <p>
                    Você tem até 7 dias corridos após o recebimento para
                    solicitar troca ou devolução, conforme o Código de Defesa do
                    Consumidor. O produto deve estar lacrado e sem uso. Consulte
                    nossa{" "}
                    <Link
                      href="/institucional/trocas"
                      className="font-semibold text-ink underline"
                    >
                      Política de Trocas
                    </Link>{" "}
                    completa.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </section>

      <div className="container-wrap py-8">
        <Reviews product={product} />
      </div>

      <RelatedProducts product={product} />
    </>
  );
}
