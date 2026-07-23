# JA Store Perfumaria — E-commerce

E-commerce premium desenvolvido para a **JA Store Perfumaria**, perfumaria de
**árabes e importados** localizada em Cabreúva – SP (bairro Jacaré). O projeto
reconstrói digitalmente a identidade real da loja — logo, paleta (blush + dourado
+ verde-menta da fachada), tom de comunicação e catálogo.

> **Protótipo de front-end.** Não há backend, banco de dados ou pagamento real:
> carrinho, favoritos e checkout são simulados (persistência via `localStorage`).
> A estrutura é isolada em camadas, pronta para receber uma API sem alterar a UI.

## ✨ Destaques

- **Home showroom** — hero editorial, categorias com produto-símbolo, best-sellers,
  novidades, seção "Nossa loja" com foto real da fachada e prova social.
- **Página de produto** — galeria com fotos reais (PNG sem fundo), pirâmide olfativa,
  medidores de fixação/projeção, calculadora de frete, avaliações e relacionados.
- **Fluxo de compra** — sacola (drawer + página), cupons, checkout em 4 etapas
  (identificação, entrega, pagamento Pix/Cartão, revisão) e tela de sucesso.
- **Painel administrativo** (visual) — dashboard, pedidos, clientes, produtos,
  categorias, cupons, relatórios e configurações.
- **Institucional** — quem somos, contato, FAQ, políticas de privacidade e trocas.
- **SEO & A11y** — `sitemap`, `robots`, JSON-LD (Store + Product), Open Graph,
  skip-link, navegação por teclado e contraste AA.

## 🛠️ Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · lucide-react

## 🚀 Rodando localmente

```bash
npm install
npm run dev
```

Acesse **http://localhost:3000**.

```bash
npm run build   # build de produção
npm start       # servir o build
```

## 📁 Estrutura

```
src/
├─ app/            # rotas (App Router): loja, checkout, admin, institucional
├─ components/     # UI por domínio (home, product, cart, checkout, layout, admin, ui)
├─ lib/            # dados e regras (brand, products, categories, format, coupons…)
├─ store/          # contextos de carrinho e favoritos
└─ hooks/          # hooks utilitários
public/
├─ produtos/       # fotos reais dos produtos (PNG sem fundo)
└─ marca/          # logo e fachada
```

---

Dados da loja (endereço, contato, Instagram) são reais; **preços são de referência
de mercado** e devem ser confirmados pela loja antes de uso em produção.
