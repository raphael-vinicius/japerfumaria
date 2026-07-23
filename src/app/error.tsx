"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

/**
 * Tela de erro global — mantém a linguagem da marca mesmo em falhas.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Em produção, enviar para observabilidade (Sentry etc.)
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <span aria-hidden className="font-display text-6xl font-light text-champagne">
        JA
      </span>
      <div>
        <h1 className="font-display text-3xl font-light text-ink">
          Algo saiu do lugar
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
          Tivemos um imprevisto ao carregar esta página. Tente novamente — se
          persistir, fale com a gente pelo WhatsApp.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          <RotateCcw size={15} /> Tentar novamente
        </button>
        <Link href="/" className="btn-outline">
          Ir para a página inicial
        </Link>
      </div>
    </div>
  );
}
