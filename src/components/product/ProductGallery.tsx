"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import { ProductBottle } from "./ProductBottle";

interface View {
  label: string;
  backdrop: string;
  scale: number;
  translate: string;
}

/**
 * Galeria do produto. A foto real (PNG sem fundo) flutua sobre os
 * degradês na cor do produto; as vistas mudam o enquadramento (zoom).
 * Sem foto: arte vetorial do frasco com os mesmos fundos.
 */
export function ProductGallery({ product }: { product: Product }) {
  const monogram = product.brand.slice(0, 2).toUpperCase();
  const hasPhoto = Boolean(product.image);

  const views: View[] = [
    {
      label: "Frasco",
      backdrop: `radial-gradient(110% 90% at 50% 25%, ${product.accent2}33, transparent 65%)`,
      scale: 1,
      translate: "translate-y-0",
    },
    {
      label: "Detalhe",
      backdrop: `radial-gradient(120% 100% at 50% 60%, ${product.accent}22, transparent 70%)`,
      scale: hasPhoto ? 1.45 : 1.35,
      translate: "translate-y-4",
    },
    {
      label: hasPhoto ? "Rótulo" : "Perfil",
      backdrop: `linear-gradient(150deg, ${product.accent2}22, ${product.accent}18)`,
      scale: hasPhoto ? 1.2 : 1.05,
      translate: "-translate-y-2",
    },
    {
      label: hasPhoto ? "Conjunto" : "Ambiente",
      backdrop: `radial-gradient(90% 70% at 70% 20%, ${product.accent2}44, ${product.accent}10 70%)`,
      scale: 0.92,
      translate: "translate-y-0",
    },
  ];

  const [active, setActive] = useState(0);
  const view = views[active];

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-xs border border-ink/10"
        style={{ background: view.backdrop }}
      >
        <div
          className={clsx(
            "absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-luxe",
            hasPhoto ? "p-6" : "p-12",
            view.translate,
          )}
          style={{ transform: `scale(${view.scale})` }}
        >
          {hasPhoto ? (
            <Image
              src={product.image!}
              alt={`${product.brand} ${product.name} — ${product.subtitle}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-contain p-8 drop-shadow-[0_24px_26px_rgba(0,0,0,0.18)]"
            />
          ) : (
            <div className="h-full w-full max-w-[280px]">
              <ProductBottle
                accent={product.accent}
                accent2={product.accent2}
                shape={product.bottle}
                monogram={monogram}
              />
            </div>
          )}
        </div>
        {product.compareAtPrice && (
          <span className="absolute left-5 top-5 bg-wine px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide3 text-ivory-50">
            Oferta
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {views.map((v, i) => (
          <button
            key={v.label}
            onClick={() => setActive(i)}
            className={clsx(
              "relative aspect-square overflow-hidden rounded-xs border transition",
              active === i
                ? "border-champagne ring-1 ring-champagne"
                : "border-ink/10 hover:border-ink/30",
            )}
            style={{ background: v.backdrop }}
            aria-label={`Ver ${v.label}`}
          >
            <div className="absolute inset-0 flex items-center justify-center p-2.5">
              {hasPhoto ? (
                <Image
                  src={product.image!}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-contain p-2"
                  style={{ transform: `scale(${v.scale >= 1.2 ? 1.5 : 1})` }}
                />
              ) : (
                <div className="h-full w-full">
                  <ProductBottle
                    accent={product.accent}
                    accent2={product.accent2}
                    shape={product.bottle}
                    backdrop={false}
                    monogram={monogram}
                  />
                </div>
              )}
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ivory-50/90 to-transparent pb-1 pt-3 text-center text-[8.5px] font-medium uppercase tracking-wide2 text-ink-600">
              {v.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
