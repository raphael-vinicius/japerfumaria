"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { formatPhone } from "@/lib/format";

export function ContactForm() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "Dúvida sobre produto",
    mensagem: "",
  });
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xs border border-sage/40 bg-sage/5 p-10 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-sage/15">
          <Check size={26} className="text-sage" />
        </div>
        <p className="font-display text-xl text-ink">Mensagem enviada!</p>
        <p className="max-w-sm text-sm text-ink-600">
          Recebemos sua mensagem e responderemos em breve. Para atendimento
          imediato, chame a gente no WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="grid gap-4 rounded-xs border border-ink/10 bg-ivory-50 p-6 shadow-card sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome"
          value={form.nome}
          onChange={(v) => setForm((f) => ({ ...f, nome: v }))}
          required
        />
        <Field
          label="Telefone"
          value={form.telefone}
          onChange={(v) => setForm((f) => ({ ...f, telefone: formatPhone(v) }))}
          inputMode="tel"
        />
      </div>
      <Field
        label="E-mail"
        type="email"
        value={form.email}
        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
        inputMode="email"
        required
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-ink-700">Assunto</span>
        <select
          value={form.assunto}
          onChange={(e) => setForm((f) => ({ ...f, assunto: e.target.value }))}
          className="rounded-xs border border-ink/15 bg-ivory-50 px-4 py-3 text-sm focus:border-ink focus:outline-none"
        >
          <option>Dúvida sobre produto</option>
          <option>Recomendação de fragrância</option>
          <option>Status do meu pedido</option>
          <option>Troca ou devolução</option>
          <option>Parcerias / atacado</option>
        </select>
      </label>
      <Field
        label="Mensagem"
        as="textarea"
        value={form.mensagem}
        onChange={(v) => setForm((f) => ({ ...f, mensagem: v }))}
        required
      />
      <button type="submit" className="btn-primary">
        <Send size={16} /> Enviar mensagem
      </button>
    </form>
  );
}
