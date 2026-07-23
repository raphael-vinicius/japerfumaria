import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/lib/categories";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductListing } from "@/components/search/ProductListing";

interface Params {
  params: { slug: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const category = getCategory(params.slug);
  if (!category) return { title: "Categoria" };
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/categoria/${category.slug}` },
  };
}

export default function CategoryPage({ params }: Params) {
  const category = getCategory(params.slug);
  if (!category) notFound();

  return (
    <>
      {/* Banner da categoria */}
      <section
        className="relative overflow-hidden text-ivory-50"
        style={{
          background: `linear-gradient(135deg, ${category.accent} 0%, ${category.accent2} 130%)`,
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light grain"
        />
        <div className="container-wrap relative py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-2xs font-medium uppercase tracking-luxe text-ivory-50/70">
              Categoria
            </p>
            <h1 className="mt-3 font-display text-4xl font-light leading-[1.05] sm:text-6xl">
              {category.name}
            </h1>
            <p className="mt-3 text-lg text-ivory-50/85">{category.tagline}</p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory-50/75">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      <div className="container-wrap py-8">
        <Breadcrumb items={[{ label: category.name }]} />
        <div className="mt-8">
          <ProductListing fixedCategory={category.slug} />
        </div>
      </div>
    </>
  );
}
