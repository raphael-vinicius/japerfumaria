"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setDone(true);
  };

  return (
    <section className="bg-ink text-ivory">
      <div className="container-wrap py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-champagne-light">Clube JA</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            Receba lançamentos e ofertas exclusivas
          </h2>
          <p className="mt-3 text-sm text-ivory/70">
            Entre para o Clube JA e ganhe{" "}
            <strong className="text-champagne-light">10% de desconto</strong> na
            primeira compra, além de acesso antecipado às novidades árabes e
            importadas.
          </p>

          {done ? (
            <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-full border border-champagne/40 bg-ivory-50/5 px-6 py-4">
              <Check size={20} className="text-champagne-light" />
              <span className="text-sm">
                Tudo certo! Enviamos seu cupom{" "}
                <strong className="text-champagne-light">BEMVINDO10</strong> para
                o e-mail.
              </span>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-2 rounded-full border border-ivory/20 bg-ivory-50/5 px-5">
                <Mail size={17} className="text-ivory/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  className="flex-1 bg-transparent py-3.5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
                />
              </div>
              <button type="submit" className="btn-gold shrink-0">
                Quero meu cupom
              </button>
            </form>
          )}
          <p className="mt-4 text-xs text-ivory/40">
            Ao assinar, você concorda com nossa Política de Privacidade. Cancele
            quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
}
