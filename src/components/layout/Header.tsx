"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { categories } from "@/lib/categories";
import { useCart } from "@/store/CartContext";
import { useFavorites } from "@/store/FavoritesContext";
import { Logo } from "@/components/ui/Logo";
import { SearchOverlay } from "./SearchOverlay";
import { MobileMenu } from "./MobileMenu";

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-champagne px-1 text-[10px] font-bold text-ivory-50">
      {n > 9 ? "9+" : n}
    </span>
  );
}

export function Header() {
  const { count, openDrawer, hydrated } = useCart();
  const { count: favCount, hydrated: favHydrated } = useFavorites();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-ink/10 bg-ivory/85 backdrop-blur-md"
            : "bg-ivory"
        }`}
      >
        <div className="container-wrap">
          <div className="flex h-[68px] items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5 lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={22} />
              </button>
              <Logo />
            </div>

            {/* Nav desktop */}
            <nav className="hidden items-center gap-7 lg:flex">
              {categories.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  href={`/categoria/${c.slug}`}
                  className="link-underline text-sm font-medium text-ink-700 hover:text-ink"
                >
                  {c.name}
                </Link>
              ))}
              <div className="group relative">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-ink-700 hover:text-ink"
                  aria-haspopup="true"
                >
                  Mais <ChevronDown size={15} />
                </button>
                <div className="invisible absolute left-1/2 top-full z-10 w-56 -translate-x-1/2 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="card-surface overflow-hidden p-2">
                    {categories.slice(4).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/categoria/${c.slug}`}
                        className="block rounded-xs px-3 py-2 text-sm text-ink-700 hover:bg-ivory-100"
                      >
                        {c.name}
                      </Link>
                    ))}
                    <Link
                      href="/institucional/quem-somos"
                      className="block rounded-xs px-3 py-2 text-sm text-ink-700 hover:bg-ivory-100"
                    >
                      Nossa história
                    </Link>
                    <Link
                      href="/institucional/faq"
                      className="block rounded-xs px-3 py-2 text-sm text-ink-700 hover:bg-ivory-100"
                    >
                      Perguntas frequentes
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* Ações */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>
              <Link
                href="/favoritos"
                className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5"
                aria-label="Favoritos"
              >
                <Heart size={20} />
                {favHydrated && <CountBadge n={favCount} />}
              </Link>
              <button
                onClick={openDrawer}
                className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5"
                aria-label="Abrir sacola"
              >
                <ShoppingBag size={20} />
                {hydrated && <CountBadge n={count} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
