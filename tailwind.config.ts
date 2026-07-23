import type { Config } from "tailwindcss";

/**
 * ————————————————————————————————————————————————————————————
 *  JA STORE PARFUM · DESIGN SYSTEM — Site 1 (loja)
 * ————————————————————————————————————————————————————————————
 *  Identidade REAL da loja de Cabreúva (extraída da fachada e do
 *  logo): feminina, romântica e delicada. Paleta "blush & gold":
 *  fundo blush-creme (ivory), tinta rosewood (ink), acento dourado
 *  (champagne), etiquetas em rosa-framboesa (wine) e verde-menta
 *  da fachada (sage/mint). Refino no nível de Lancôme × Diptyque,
 *  com o respiro editorial de Aesop.
 * ————————————————————————————————————————————————————————————
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Superfícies — blush-creme quente
        ivory: {
          DEFAULT: "#F8F1EB",
          50: "#FCF8F4",
          100: "#F8F1EB",
          200: "#F0E3DA",
          300: "#E6D2C7",
        },
        // Tinta — rosewood profundo (quente, feminino, legível)
        ink: {
          DEFAULT: "#3E2D33",
          0: "#291D21",
          900: "#33252A",
          800: "#4B383E",
          700: "#5F4A50",
          600: "#7B646A",
          500: "#9C878C",
          400: "#BBAAAE",
        },
        // Acento — dourado do logo (mantém o nome champagne no sistema)
        champagne: {
          DEFAULT: "#C09A54",
          light: "#D8BE86",
          dark: "#9C7936",
          deep: "#7A5D28",
          soft: "#EBDBBB",
        },
        // Etiquetas / coração — rosa-framboesa
        wine: {
          DEFAULT: "#A8465F",
          light: "#C46079",
        },
        // Verde-menta da fachada (secundário)
        sage: "#9FBFA6",
        // Rosa assinatura — blush
        blush: {
          DEFAULT: "#E7C3C0",
          soft: "#F4E1DD",
          veil: "#FBEEEA",
          deep: "#D9A6A2",
        },
        // Menta (tons de apoio)
        mint: {
          DEFAULT: "#A9C6B0",
          soft: "#DDEAE0",
          deep: "#7FA98C",
          dark: "#3F6B52",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.16em" }],
        display: ["clamp(2.6rem, 7vw, 5.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        hero: ["clamp(2.1rem, 5.2vw, 3.9rem)", { lineHeight: "1.02", letterSpacing: "-0.015em" }],
        title: ["clamp(1.7rem, 3.4vw, 2.8rem)", { lineHeight: "1.07", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        luxe: "0.34em",
        wide2: "0.2em",
        wide3: "0.14em",
      },
      spacing: {
        section: "clamp(4.5rem, 11vw, 9rem)",
      },
      maxWidth: {
        wrap: "1320px",
        prose2: "40rem",
      },
      borderRadius: {
        xs: "3px",
      },
      boxShadow: {
        card: "0 1px 1px rgba(23,18,13,0.03), 0 22px 48px -34px rgba(23,18,13,0.4)",
        lift: "0 34px 70px -40px rgba(23,18,13,0.5)",
        soft: "0 1px 0 rgba(23,18,13,0.05)",
        gold: "0 18px 40px -26px rgba(123,85,34,0.6)",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
        drift: "cubic-bezier(0.4, 0, 0.1, 1)",
      },
      transitionDuration: {
        400: "400ms",
        600: "600ms",
        900: "900ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.7s ease both",
        marquee: "marquee 34s linear infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
