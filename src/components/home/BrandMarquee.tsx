import { allBrands } from "@/lib/products";

export function BrandMarquee() {
  const brands = allBrands().filter((b) => b !== "JA Store");
  const doubled = [...brands, ...brands];
  return (
    <section className="border-y border-ink/10 bg-ivory-50 py-7">
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-12 whitespace-nowrap">
          {doubled.map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="font-display text-xl text-ink-500/70 sm:text-2xl"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
