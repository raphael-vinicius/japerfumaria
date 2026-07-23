import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductListing } from "@/components/search/ProductListing";
import type { SortKey } from "@/lib/search";

export const metadata: Metadata = {
  title: "Busca",
  description: "Encontre perfumes importados e árabes na JA Store Perfumaria.",
};

interface Props {
  searchParams: { q?: string; sort?: string };
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q;
  const sort = (searchParams.sort as SortKey) ?? "relevancia";

  return (
    <div className="container-wrap py-8">
      <Breadcrumb items={[{ label: query ? `Busca: “${query}”` : "Todos os perfumes" }]} />
      <header className="mb-8 mt-6">
        <p className="eyebrow">Catálogo completo</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          {query ? (
            <>
              Resultados para{" "}
              <span className="text-champagne-dark">“{query}”</span>
            </>
          ) : (
            "Todos os perfumes"
          )}
        </h1>
      </header>

      <ProductListing initialQuery={query} initialSort={sort} />
    </div>
  );
}
