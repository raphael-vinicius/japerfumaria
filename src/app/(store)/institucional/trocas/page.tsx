import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegalDocument } from "@/components/ui/LegalSection";

export const metadata: Metadata = {
  title: "Política de trocas e devoluções",
  description: "Entenda como funcionam as trocas e devoluções na JA Store Perfumaria.",
};

export default function ExchangePage() {
  return (
    <>
      <PageHeader
        eyebrow="Compre com tranquilidade"
        title="Política de trocas e devoluções"
        description="Queremos que você ame o seu perfume. Se algo não sair como esperado, resolvemos rápido e sem burocracia."
        crumbs={[{ label: "Política de trocas" }]}
      />
      <LegalDocument
        updated="21 de julho de 2026"
        sections={[
          {
            title: "Prazo de arrependimento (7 dias)",
            body: (
              <p>
                Conforme o art. 49 do Código de Defesa do Consumidor, você pode
                desistir da compra em até <strong>7 dias corridos</strong> após o
                recebimento, sem precisar justificar. Nesse caso, devolvemos 100%
                do valor pago, incluindo o frete.
              </p>
            ),
          },
          {
            title: "Condições para troca ou devolução",
            body: (
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  O produto deve estar <strong>lacrado e sem uso</strong>, na
                  embalagem original.
                </li>
                <li>
                  Por questões de higiene e segurança, perfumes abertos ou
                  utilizados não podem ser trocados, salvo defeito de fabricação.
                </li>
                <li>
                  Kits e brindes que acompanham a compra devem ser devolvidos
                  junto ao produto principal.
                </li>
              </ul>
            ),
          },
          {
            title: "Produto com defeito",
            body: (
              <p>
                Identificou um defeito (vazamento, válvula com falha, avaria no
                frasco)? Entre em contato em até 90 dias. Analisamos e, se
                confirmado, realizamos a troca por um novo produto ou a devolução
                integral do valor.
              </p>
            ),
          },
          {
            title: "Como solicitar",
            body: (
              <ol className="list-decimal space-y-1.5 pl-5">
                <li>
                  Chame nosso atendimento no WhatsApp {brand.phoneDisplay} ou pela
                  página de{" "}
                  <Link
                    href="/institucional/contato"
                    className="font-semibold text-ink underline"
                  >
                    Contato
                  </Link>
                  .
                </li>
                <li>Informe o número do pedido e o motivo da solicitação.</li>
                <li>
                  Enviamos as instruções e, quando aplicável, o código de
                  postagem gratuito.
                </li>
              </ol>
            ),
          },
          {
            title: "Reembolso",
            body: (
              <p>
                Após recebermos e conferirmos o produto, o reembolso é feito em
                até 7 dias úteis, pelo mesmo meio de pagamento. Em compras no
                cartão, o estorno aparece em até duas faturas, conforme o prazo da
                operadora.
              </p>
            ),
          },
          {
            title: "Trocas na loja física",
            body: (
              <p>
                Se preferir, você pode fazer a troca presencialmente na nossa
                loja em {brand.address.city}, levando o produto e o comprovante da
                compra.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
