import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <Logo />
      <p className="mt-12 font-display text-7xl font-semibold text-champagne">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl text-ink">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink-600">
        A fragrância que você procura pode ter mudado de lugar. Que tal voltar ao
        início ou explorar o catálogo?
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          <Home size={16} /> Voltar ao início
        </Link>
        <Link href="/busca" className="btn-outline">
          <Search size={16} /> Explorar perfumes
        </Link>
      </div>
    </div>
  );
}
