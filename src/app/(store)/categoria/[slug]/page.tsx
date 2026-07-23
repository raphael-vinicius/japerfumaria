import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MessageCircle, MapPin } from "lucide-react";
import { categories, getCategory } from "@/lib/categories";
import { brand, waLink } from "@/lib/brand";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductListing } from "@/components/search/ProductListing";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const category = getCategory(params.slug);
  if (!category) return { title: "Categoria" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default function CategoryPage({ params }: Params) {
  const category = getCategory(params.slug);
  if (!category) notFound();

  const waMessage = `Olá, JA! Vi a linha de ${category.name} no site e queria ver as peças disponíveis. Pode me mostrar as novidades?`;

  return (
    <>
      {/* Banner da categoria */}
      <section
        className="relative overflow-hidden text-ivory-50"
        style={{
          background: `linear-gradient(135deg, ${category.accent} 0%, ${category.accent2} 130%)`,
        }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light grain" />
        <div className="container-wrap relative py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-2xs font-medium uppercase tracking-luxe text-ivory-50/70">
              {category.consultOnly ? "Linha da loja" : "Categoria"}
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

        {category.consultOnly ? (
          <section className="mt-8 grid gap-8 overflow-hidden rounded-xs border border-ink/10 bg-ivory-50 md:grid-cols-2">
            <div className="relative min-h-[280px] md:min-h-[420px]">
              <Image
                src="/marca/fachada.jpg"
                alt={`Fachada da ${brand.name} em Cabreúva`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-5 p-7 sm:p-10">
              <p className="eyebrow">Conduzido por atendimento</p>
              <h2 className="font-display text-3xl font-light leading-tight text-ink sm:text-4xl">
                {category.name} são apresentadas pessoalmente
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-ink-600">
                Essa linha gira por curadoria e estoque da loja física — as peças
                entram e saem por temporada. Chame a JA no WhatsApp: enviamos as
                fotos das opções disponíveis agora, com as novidades da semana e
                condições especiais.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={waLink(waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                >
                  <MessageCircle size={16} /> Ver disponíveis no WhatsApp
                </a>
                <a
                  href={brand.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  Ver no Instagram
                </a>
              </div>
              <p className="flex items-center gap-2 pt-2 text-xs text-ink-500">
                <MapPin size={14} className="text-champagne-dark" />
                {brand.address.street} — {brand.address.city}/{brand.address.state}
              </p>
            </div>
          </section>
        ) : (
          <div className="mt-8">
            <ProductListing fixedCategory={category.slug} />
          </div>
        )}
      </div>
    </>
  );
}
