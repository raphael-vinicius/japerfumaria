"use client";

import { useState } from "react";
import { Truck, Store, Loader2 } from "lucide-react";
import { formatCEP } from "@/lib/format";
import { brand } from "@/lib/brand";

export function DeliveryEstimator() {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    { label: string; price: string; eta: string }[] | null
  >(null);

  const calc = () => {
    if (cep.replace(/\D/g, "").length !== 8) return;
    setLoading(true);
    setResult(null);
    // Simulação de consulta de frete
    setTimeout(() => {
      const region = Number(cep.replace(/\D/g, "").slice(0, 3));
      const local = region >= 133 && region <= 134;
      setResult([
        {
          label: local ? "Entrega expressa (região)" : "Sedex",
          price: local ? "Grátis" : "R$ 24,90",
          eta: local ? "Amanhã" : "3 a 5 dias úteis",
        },
        {
          label: "Econômico (PAC)",
          price: local ? "Grátis" : "R$ 16,90",
          eta: local ? "2 dias úteis" : "6 a 10 dias úteis",
        },
      ]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="rounded-xs border border-ink/10 bg-ivory-50 p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <Truck size={16} className="text-champagne-dark" />
        Calcular frete e prazo
      </p>
      <div className="flex gap-2">
        <input
          value={cep}
          onChange={(e) => setCep(formatCEP(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && calc()}
          placeholder="Digite seu CEP"
          inputMode="numeric"
          className="flex-1 rounded-full border border-ink/15 bg-ivory-50 px-4 py-2.5 text-sm focus:border-ink focus:outline-none"
        />
        <button onClick={calc} className="btn-outline px-5">
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Calcular"}
        </button>
      </div>

      {result && (
        <div className="mt-4 grid gap-2 border-t border-ink/10 pt-4">
          {result.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium text-ink">{r.label}</p>
                <p className="text-xs text-ink-500">{r.eta}</p>
              </div>
              <span className="font-semibold text-ink">{r.price}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-xs bg-ivory-100 p-3 text-xs text-ink-600">
        <Store size={15} className="mt-0.5 shrink-0 text-champagne-dark" />
        <span>
          Retire gratuitamente na loja física em {brand.address.city} — avisamos
          pelo WhatsApp assim que estiver pronto.
        </span>
      </div>
    </div>
  );
}
