"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Info, Lock } from "lucide-react";
import { brand } from "@/lib/brand";
import { currentUser } from "@/lib/admin/seed";
import { Button } from "../ui/Button";
import { Checkbox, Input } from "../ui/Field";

/**
 * Entrada do painel.
 *
 * Protótipo sem back-end: não há autenticação real e nenhuma
 * credencial é enviada ou guardada. A validação de formato existe
 * para exercitar os estados do formulário — e para que a tela se
 * comporte como a definitiva quando o back-end chegar.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const next: typeof errors = {};
    if (!email.trim()) next.email = "Informe o e-mail de acesso.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "E-mail em formato inválido.";
    if (password.length < 6)
      next.password = "A senha precisa ter ao menos 6 caracteres.";

    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    router.push("/admin/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      {/* Painel de marca — só no desktop, onde há espaço de sobra. */}
      <aside className="relative hidden w-[46%] max-w-2xl flex-col justify-between bg-adm-nav p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-adm border border-champagne/35 font-display text-sm font-semibold text-champagne-light"
          >
            JA
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-medium">JA Store</span>
            <span className="block text-micro text-white/40">
              Painel administrativo
            </span>
          </span>
        </div>

        <div className="max-w-md">
          <p className="text-[26px] font-light leading-snug tracking-[-0.01em] text-white/95">
            A operação da perfumaria em um lugar só — pedidos, estoque,
            clientes e resultado do dia.
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-white/45">
            {brand.address.city} · {brand.address.state} — desde {brand.founded}
          </p>
        </div>

        <p className="text-micro text-white/30">
          © {brand.founded}–2026 {brand.name}. Acesso restrito à equipe.
        </p>
      </aside>

      {/* Formulário */}
      <main className="flex flex-1 flex-col justify-center bg-adm-canvas px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-[22rem]">
          <div className="lg:hidden">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-adm border border-champagne/50 font-display text-sm font-semibold text-champagne-dark"
            >
              JA
            </span>
          </div>

          <h1 className="mt-6 text-[22px] font-medium tracking-[-0.015em] text-adm-ink lg:mt-0">
            Entrar no painel
          </h1>
          <p className="mt-1.5 text-[13px] text-adm-ink-3">
            Use as credenciais da equipe para acessar a gestão da loja.
          </p>

          <form onSubmit={submit} noValidate className="mt-7 flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              autoComplete="username"
              value={email}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@jastoreparfum.com.br"
            />

            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              error={errors.password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              aside={
                <Link
                  href="/admin/login"
                  className="text-micro text-adm-accent hover:underline"
                >
                  Esqueci a senha
                </Link>
              }
            />

            <Checkbox label="Manter conectado neste computador" defaultChecked />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              iconRight={ArrowRight}
              className="mt-1"
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 flex gap-2.5 rounded-adm border border-adm-line bg-adm-surface p-3">
            <Info size={14} className="mt-px shrink-0 text-adm-ink-3" />
            <p className="text-micro leading-relaxed text-adm-ink-3">
              <span className="font-medium text-adm-ink-2">
                Protótipo de demonstração.
              </span>{" "}
              Não há autenticação real: qualquer senha com 6 ou mais
              caracteres abre o painel, e nenhum dado é enviado.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 text-micro">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-adm-ink-3 transition-colors hover:text-adm-ink"
            >
              <ArrowLeft size={12} />
              Voltar para a loja
            </Link>
            <span className="inline-flex items-center gap-1 text-adm-ink-3">
              <Lock size={11} />
              Conexão segura
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
