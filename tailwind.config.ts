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

        /**
         * ————————————————————————————————————————————————
         *  ADM · sistema exclusivo do painel administrativo
         * ————————————————————————————————————————————————
         *  Namespace isolado: a vitrine não usa nenhum destes
         *  tokens. O painel herda a tinta rosewood e o dourado
         *  da marca, mas sobre superfícies neutras e frias —
         *  densidade e legibilidade de software de gestão,
         *  não de editorial.
         */
        adm: {
          canvas: "#F3F1EE", // fundo da aplicação
          surface: "#FFFFFF", // cards, tabelas, painéis
          raised: "#FAF8F6", // cabeçalhos de tabela, toolbars
          sunken: "#EEEAE5", // poços, campos desabilitados
          line: "#E7E2DC", // fio padrão
          "line-strong": "#D5CCC4", // fio de ênfase
          nav: "#2A2024", // sidebar (rosewood quase preto)
          "nav-raised": "#37292E",
          /**
           * Rampa de texto verificada contra as superfícies do
           * painel: 15.4 / 8.4 / 5.2 sobre branco. O terciário
           * carrega conteúdo real (datas, dicas, metadados), então
           * precisa cumprir 4.5:1 como qualquer outro texto —
           * a hierarquia vem do tamanho, não de cinza claro demais.
           */
          ink: "#2C2226", // texto primário
          "ink-2": "#574A4E", // texto secundário
          "ink-3": "#766A6E", // texto terciário / placeholder
          accent: "#836329", // dourado legível sobre claro (AA)
          "accent-bg": "#F4EDDF",
          ok: "#35624A",
          "ok-bg": "#E6EFE9",
          warn: "#8A6320",
          "warn-bg": "#F7EFDF",
          bad: "#93384F",
          "bad-bg": "#F8E8EC",
          info: "#3F5D75",
          "info-bg": "#E9F0F5",
          ship: "#57496F",
          "ship-bg": "#EEEAF4",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.16em" }],
        // Escala densa do painel (tracking neutro, ao contrário do 2xs editorial)
        micro: ["0.6875rem", { lineHeight: "1.05rem", letterSpacing: "0.01em" }],
        "micro-caps": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.07em" }],
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
        // Painel: cantos levemente arredondados, de interface
        adm: "5px",
        "adm-lg": "8px",
      },
      boxShadow: {
        card: "0 1px 1px rgba(23,18,13,0.03), 0 22px 48px -34px rgba(23,18,13,0.4)",
        lift: "0 34px 70px -40px rgba(23,18,13,0.5)",
        soft: "0 1px 0 rgba(23,18,13,0.05)",
        gold: "0 18px 40px -26px rgba(123,85,34,0.6)",
        // Elevação do painel — sombras curtas, de interface
        adm: "0 1px 2px rgba(44,34,38,0.05)",
        "adm-md": "0 1px 2px rgba(44,34,38,0.04), 0 8px 20px -12px rgba(44,34,38,0.22)",
        "adm-pop": "0 2px 4px rgba(44,34,38,0.06), 0 16px 40px -16px rgba(44,34,38,0.28)",
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
        // ——— Painel administrativo ———
        "adm-pop": {
          "0%": { opacity: "0", transform: "translateY(6px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "adm-drawer": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "adm-toast": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "adm-menu": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.7s ease both",
        marquee: "marquee 34s linear infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "adm-pop": "adm-pop 0.18s cubic-bezier(0.22,1,0.36,1) both",
        "adm-drawer": "adm-drawer 0.28s cubic-bezier(0.22,1,0.36,1) both",
        "adm-toast": "adm-toast 0.22s cubic-bezier(0.22,1,0.36,1) both",
        "adm-menu": "adm-menu 0.13s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
