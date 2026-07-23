"use client";

import { useId } from "react";
import type { BottleShape } from "@/lib/types";
import clsx from "clsx";

interface Props {
  accent: string;
  accent2: string;
  shape: BottleShape;
  monogram?: string;
  className?: string;
  /** fundo suave atrás do frasco */
  backdrop?: boolean;
}

/**
 * Ilustração vetorial de frasco de perfume, gerada a partir das cores
 * do produto. Substitui a foto real por uma arte premium e autossuficiente
 * (sem depender de assets externos), variando por formato de frasco.
 */
export function ProductBottle({
  accent,
  accent2,
  shape,
  monogram = "JA",
  className,
  backdrop = true,
}: Props) {
  const id = useId().replace(/[:]/g, "");
  const liquid = `liquid-${id}`;
  const glass = `glass-${id}`;
  const glow = `glow-${id}`;
  const cap = `cap-${id}`;

  return (
    <svg
      viewBox="0 0 220 280"
      className={clsx("h-full w-full", className)}
      role="img"
      aria-label="Frasco de perfume"
    >
      <defs>
        <linearGradient id={liquid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent2} />
          <stop offset="55%" stopColor={accent} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="18%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="82%" stopColor="#000000" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={cap} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a231d" />
          <stop offset="100%" stopColor="#0f0c0a" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor={accent2} stopOpacity="0.5" />
          <stop offset="100%" stopColor={accent2} stopOpacity="0" />
        </radialGradient>
      </defs>

      {backdrop && (
        <>
          <circle cx="110" cy="120" r="96" fill={`url(#${glow})`} />
          <ellipse
            cx="110"
            cy="252"
            rx="66"
            ry="10"
            fill="#000000"
            opacity="0.12"
          />
        </>
      )}

      {shape === "tall" && (
        <g>
          <rect x="98" y="26" width="24" height="16" rx="3" fill={`url(#${cap})`} />
          <rect x="94" y="40" width="32" height="10" rx="2" fill="#1a1512" />
          <rect
            x="72"
            y="50"
            width="76"
            height="188"
            rx="14"
            fill={`url(#${liquid})`}
          />
          <rect
            x="72"
            y="50"
            width="76"
            height="188"
            rx="14"
            fill={`url(#${glass})`}
          />
        </g>
      )}

      {shape === "flacon" && (
        <g>
          <rect x="99" y="24" width="22" height="18" rx="3" fill={`url(#${cap})`} />
          <rect x="96" y="40" width="28" height="12" rx="2" fill="#1a1512" />
          <path
            d="M78 66 Q110 48 142 66 L150 210 Q110 246 70 210 Z"
            fill={`url(#${liquid})`}
          />
          <path
            d="M78 66 Q110 48 142 66 L150 210 Q110 246 70 210 Z"
            fill={`url(#${glass})`}
          />
        </g>
      )}

      {shape === "cube" && (
        <g>
          <rect x="96" y="22" width="28" height="20" rx="3" fill={`url(#${cap})`} />
          <rect x="100" y="40" width="20" height="12" rx="2" fill="#1a1512" />
          <rect
            x="64"
            y="70"
            width="92"
            height="160"
            rx="10"
            fill={`url(#${liquid})`}
          />
          <rect
            x="64"
            y="70"
            width="92"
            height="160"
            rx="10"
            fill={`url(#${glass})`}
          />
        </g>
      )}

      {shape === "orb" && (
        <g>
          <rect x="100" y="24" width="20" height="18" rx="3" fill={`url(#${cap})`} />
          <rect x="96" y="40" width="28" height="10" rx="2" fill="#1a1512" />
          <path
            d="M110 52 C64 52 52 96 52 140 C52 200 78 236 110 236 C142 236 168 200 168 140 C168 96 156 52 110 52 Z"
            fill={`url(#${liquid})`}
          />
          <path
            d="M110 52 C64 52 52 96 52 140 C52 200 78 236 110 236 C142 236 168 200 168 140 C168 96 156 52 110 52 Z"
            fill={`url(#${glass})`}
          />
        </g>
      )}

      {/* reflexo vertical */}
      <rect
        x={shape === "cube" ? 74 : 82}
        y={shape === "orb" ? 76 : 68}
        width="8"
        height={shape === "orb" ? 120 : 150}
        rx="4"
        fill="#ffffff"
        opacity="0.22"
      />

      {/* monograma "gravado" */}
      <text
        x="110"
        y={shape === "cube" ? 158 : 156}
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="26"
        fontWeight="600"
        fill="#ffffff"
        opacity="0.85"
        letterSpacing="1"
      >
        {monogram}
      </text>
    </svg>
  );
}
