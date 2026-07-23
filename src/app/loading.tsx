/**
 * Estado de carregamento global — monograma pulsando, discreto e on-brand.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Carregando"
    >
      <span className="animate-pulse font-display text-5xl font-light tracking-tight text-champagne">
        JA
      </span>
    </div>
  );
}
