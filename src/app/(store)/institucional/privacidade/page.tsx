import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegalDocument } from "@/components/ui/LegalSection";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como a JA Store Perfumaria coleta, usa e protege seus dados.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transparência"
        title="Política de privacidade"
        description="Seus dados são seus. Aqui explicamos, em linguagem clara, o que coletamos e por quê — em conformidade com a LGPD."
        crumbs={[{ label: "Política de privacidade" }]}
      />
      <LegalDocument
        updated="21 de julho de 2026"
        sections={[
          {
            title: "Quem somos",
            body: (
              <p>
                A {brand.name}, com loja em {brand.address.full}, é a responsável
                pelo tratamento dos dados pessoais coletados neste site, na
                condição de controladora, nos termos da Lei nº 13.709/2018
                (LGPD).
              </p>
            ),
          },
          {
            title: "Dados que coletamos",
            body: (
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Dados de identificação: nome, CPF, e-mail e telefone,
                  informados no cadastro e no checkout.
                </li>
                <li>
                  Dados de entrega: endereço completo e CEP, para envio dos
                  pedidos.
                </li>
                <li>
                  Dados de navegação: páginas visitadas e produtos favoritados,
                  para melhorar sua experiência.
                </li>
              </ul>
            ),
          },
          {
            title: "Como usamos seus dados",
            body: (
              <p>
                Utilizamos seus dados para processar pedidos, emitir nota fiscal,
                realizar entregas, oferecer atendimento e, mediante seu
                consentimento, enviar ofertas e novidades. Não vendemos nem
                compartilhamos seus dados com terceiros para fins publicitários.
              </p>
            ),
          },
          {
            title: "Compartilhamento",
            body: (
              <p>
                Compartilhamos dados apenas com parceiros essenciais à operação —
                como transportadoras e meios de pagamento — e somente na medida
                necessária para concluir o seu pedido.
              </p>
            ),
          },
          {
            title: "Seus direitos",
            body: (
              <p>
                Você pode solicitar a qualquer momento o acesso, a correção, a
                portabilidade ou a exclusão dos seus dados, além de revogar
                consentimentos. Basta entrar em contato pelo e-mail{" "}
                <a href={`mailto:${brand.email}`} className="font-semibold text-ink underline">
                  {brand.email}
                </a>
                .
              </p>
            ),
          },
          {
            title: "Cookies",
            body: (
              <p>
                Usamos cookies para lembrar sua sacola, seus favoritos e suas
                preferências. Você pode gerenciar os cookies nas configurações do
                seu navegador.
              </p>
            ),
          },
          {
            title: "Segurança",
            body: (
              <p>
                Adotamos medidas técnicas e organizacionais para proteger seus
                dados, incluindo conexão criptografada (SSL) e acesso restrito às
                informações.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
