import type { Product } from "@/lib/types";

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink-700">{label}</span>
        <span className="text-xs text-ink-500">{value}/5</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < value ? "bg-champagne" : "bg-ivory-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function PerformanceMeters({ product }: { product: Product }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Meter label="Fixação" value={product.longevity} />
      <Meter label="Projeção" value={product.sillage} />
    </div>
  );
}
