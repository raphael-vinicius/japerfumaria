"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, TrendingUp } from "lucide-react";
import { searchSuggestions } from "@/lib/search";
import { ProductBottle } from "@/components/product/ProductBottle";
import { formatBRL } from "@/lib/format";

const popular = ["Asad", "Yara", "Sauvage", "Club de Nuit", "Good Girl", "Árabes"];

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = searchSuggestions(query, 5);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else setQuery("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[60] transition-all duration-300 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-0 top-0 bg-ivory shadow-lift transition-transform duration-400 ease-luxe ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container-wrap py-6">
          <form onSubmit={submit} className="flex items-center gap-4">
            <Search size={22} className="text-champagne-dark" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por perfume, marca ou nota olfativa…"
              className="flex-1 bg-transparent py-2 font-display text-xl text-ink placeholder:text-ink-500/60 focus:outline-none sm:text-2xl"
            />
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5"
              aria-label="Fechar busca"
            >
              <X size={20} />
            </button>
          </form>

          <div className="mt-6 border-t border-ink/10 pt-6">
            {query.trim() && results.length === 0 && (
              <p className="text-sm text-ink-500">
                Nenhum resultado para “{query}”. Tente outra marca ou nota.
              </p>
            )}

            {query.trim() && results.length > 0 && (
              <ul className="grid gap-1">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/produto/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 rounded-xs px-3 py-2.5 transition duration-300 hover:bg-ivory-50"
                    >
                      <span className="relative h-12 w-12 shrink-0">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        ) : (
                          <ProductBottle
                            accent={p.accent}
                            accent2={p.accent2}
                            shape={p.bottle}
                            backdrop={false}
                            monogram={p.brand.slice(0, 2).toUpperCase()}
                          />
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-ink">
                          {p.name}
                        </span>
                        <span className="block text-xs text-ink-500">
                          {p.brand} · {p.subtitle}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {formatBRL(p.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!query.trim() && (
              <div>
                <p className="mb-3 flex items-center gap-2 text-2xs font-semibold uppercase tracking-luxe text-ink-500">
                  <TrendingUp size={13} /> Buscas populares
                </p>
                <div className="flex flex-wrap gap-2">
                  {popular.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        router.push(`/busca?q=${encodeURIComponent(term)}`);
                        onClose();
                      }}
                      className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink-700 transition duration-300 hover:border-ink hover:bg-ivory-50"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
