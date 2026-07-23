"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  CreditCard,
  QrCode,
  Lock,
  ShieldCheck,
  Store,
  Truck,
  Copy,
} from "lucide-react";
import clsx from "clsx";
import {
  useCart,
  SHIPPING_RATES,
  type ShippingMethod,
} from "@/store/CartContext";
import { brand } from "@/lib/brand";
import {
  formatBRL,
  formatCPF,
  formatPhone,
  formatCEP,
  formatCardNumber,
  formatCardExpiry,
} from "@/lib/format";
import { Field } from "@/components/ui/Field";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { CouponInput } from "@/components/cart/CouponInput";

type Step = 0 | 1 | 2 | 3;
type Payment = "pix" | "cartao";

interface CardForm {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
}

const steps = ["Identificação", "Entrega", "Pagamento", "Revisão"];

const ufs = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface Form {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const empty: Form = {
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "SP",
};

export function CheckoutFlow() {
  const router = useRouter();
  const {
    items,
    total,
    subtotal,
    clear,
    shippingMethod,
    setShippingMethod,
  } = useCart();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [payment, setPayment] = useState<Payment>("pix");
  const [card, setCard] = useState<CardForm>({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState<
    Partial<Record<keyof CardForm, string>>
  >({});
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setCardField = (k: keyof CardForm) => (v: string) => {
    let value = v;
    if (k === "numero") value = formatCardNumber(v);
    if (k === "validade") value = formatCardExpiry(v);
    if (k === "cvv") value = v.replace(/\D/g, "").slice(0, 4);
    setCard((c) => ({ ...c, [k]: value }));
    setCardErrors((e) => ({ ...e, [k]: undefined }));
  };

  const set = (k: keyof Form) => (v: string) => {
    let value = v;
    if (k === "cpf") value = formatCPF(v);
    if (k === "telefone") value = formatPhone(v);
    if (k === "cep") value = formatCEP(v);
    setForm((f) => ({ ...f, [k]: value }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xs border border-dashed border-ink/20 py-24 text-center">
        <p className="font-display text-2xl text-ink">Sua sacola está vazia</p>
        <p className="mt-2 text-sm text-ink-500">
          Adicione produtos antes de finalizar a compra.
        </p>
        <button
          onClick={() => router.push("/busca")}
          className="btn-primary mt-6"
        >
          Explorar perfumes
        </button>
      </div>
    );
  }

  const validateStep = (): boolean => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (step === 0) {
      if (form.nome.trim().length < 3) e.nome = "Informe seu nome completo.";
      if (form.cpf.replace(/\D/g, "").length !== 11)
        e.cpf = "CPF inválido.";
      if (!form.email.includes("@")) e.email = "E-mail inválido.";
      if (form.telefone.replace(/\D/g, "").length < 10)
        e.telefone = "Telefone inválido.";
    }
    if (step === 1 && shippingMethod !== "retirada") {
      if (form.cep.replace(/\D/g, "").length !== 8) e.cep = "CEP inválido.";
      if (!form.endereco.trim()) e.endereco = "Informe o endereço.";
      if (!form.numero.trim()) e.numero = "Nº";
      if (!form.bairro.trim()) e.bairro = "Informe o bairro.";
      if (!form.cidade.trim()) e.cidade = "Informe a cidade.";
    }
    if (step === 2 && payment === "cartao") {
      const ce: Partial<Record<keyof CardForm, string>> = {};
      if (card.numero.replace(/\D/g, "").length !== 16)
        ce.numero = "Número incompleto.";
      if (card.nome.trim().length < 3) ce.nome = "Informe o nome do titular.";
      if (card.validade.replace(/\D/g, "").length !== 4)
        ce.validade = "MM/AA";
      if (card.cvv.length < 3) ce.cvv = "CVV";
      setCardErrors(ce);
      if (Object.keys(ce).length > 0) return false;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(3, s + 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  const finalize = () => {
    setSubmitting(true);
    const order = {
      number: `JA-${Math.floor(100000 + Math.random() * 899999)}`,
      date: new Date().toLocaleDateString("pt-BR"),
      total,
      payment,
      shippingMethod,
      email: form.email,
      nome: form.nome.split(" ")[0],
      items: items.map((i) => ({
        name: i.product.name,
        qty: i.quantity,
      })),
    };
    setTimeout(() => {
      try {
        sessionStorage.setItem("ja-last-order", JSON.stringify(order));
      } catch {
        /* noop */
      }
      clear();
      router.push("/checkout/sucesso");
    }, 1400);
  };

  const copyPix = () => {
    navigator.clipboard
      ?.writeText(
        "00020126580014BR.GOV.BCB.PIX0136ja-store-parfum-cabreuva-5204000053039865802BR",
      )
      .catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pixTotal = total * 0.95; // 5% desconto no Pix (simulado)

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        {/* Stepper */}
        <ol className="mb-8 flex items-center">
          {steps.map((label, i) => (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={clsx(
                    "grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold transition",
                    i < step
                      ? "border-ink bg-ink text-ivory"
                      : i === step
                        ? "border-champagne bg-champagne text-ivory-50"
                        : "border-ink/20 text-ink-400",
                  )}
                >
                  {i < step ? <Check size={16} /> : i + 1}
                </span>
                <span
                  className={clsx(
                    "hidden text-[11px] font-medium sm:block",
                    i <= step ? "text-ink" : "text-ink-400",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={clsx(
                    "mx-2 h-px flex-1 sm:mx-3",
                    i < step ? "bg-ink" : "bg-ink/15",
                  )}
                />
              )}
            </li>
          ))}
        </ol>

        <div className="rounded-xs border border-ink/10 bg-ivory-50 p-6 shadow-card sm:p-8">
          {/* Etapa 0 — Identificação */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-2xl text-ink">Identificação</h2>
              <p className="mt-1 text-sm text-ink-500">
                Precisamos dos seus dados para emitir a nota e o pedido.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nome completo"
                  value={form.nome}
                  onChange={set("nome")}
                  placeholder="Como no documento"
                  autoComplete="name"
                  required
                  error={errors.nome}
                  className="sm:col-span-2"
                />
                <Field
                  label="CPF"
                  value={form.cpf}
                  onChange={set("cpf")}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  required
                  error={errors.cpf}
                />
                <Field
                  label="Telefone / WhatsApp"
                  value={form.telefone}
                  onChange={set("telefone")}
                  placeholder="(11) 90000-0000"
                  inputMode="tel"
                  required
                  error={errors.telefone}
                />
                <Field
                  label="E-mail"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="voce@email.com"
                  type="email"
                  inputMode="email"
                  required
                  error={errors.email}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          )}

          {/* Etapa 1 — Entrega */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl text-ink">Entrega</h2>
              <p className="mt-1 text-sm text-ink-500">
                Escolha como quer receber o seu pedido.
              </p>

              <div className="mt-5 grid gap-3">
                {[
                  {
                    id: "expressa" as ShippingMethod,
                    icon: Truck,
                    title: "Entrega expressa",
                    desc: "Cabreúva e região · 1 a 2 dias úteis",
                    price:
                      subtotal >= brand.shipping.freeThreshold
                        ? "Grátis"
                        : formatBRL(SHIPPING_RATES.expressa.price),
                  },
                  {
                    id: "economica" as ShippingMethod,
                    icon: Truck,
                    title: "Econômica (Correios)",
                    desc: "Todo o Brasil · 4 a 9 dias úteis",
                    price:
                      subtotal >= brand.shipping.freeThreshold
                        ? "Grátis"
                        : formatBRL(SHIPPING_RATES.economica.price),
                  },
                  {
                    id: "retirada" as ShippingMethod,
                    icon: Store,
                    title: "Retirar na loja",
                    desc: `${brand.address.street} · pronto em 2h`,
                    price: "Grátis",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setShippingMethod(opt.id)}
                    aria-pressed={shippingMethod === opt.id}
                    className={clsx(
                      "flex items-center gap-4 rounded-xs border p-4 text-left transition",
                      shippingMethod === opt.id
                        ? "border-champagne bg-champagne-soft/20 ring-1 ring-champagne"
                        : "border-ink/15 hover:border-ink/30",
                    )}
                  >
                    <opt.icon size={20} className="shrink-0 text-champagne-dark" />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink">
                        {opt.title}
                      </span>
                      <span className="block text-xs text-ink-500">
                        {opt.desc}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {opt.price}
                    </span>
                  </button>
                ))}
              </div>

              {shippingMethod !== "retirada" && (
                <div className="mt-6 grid gap-4 sm:grid-cols-6">
                  <Field
                    label="CEP"
                    value={form.cep}
                    onChange={set("cep")}
                    placeholder="00000-000"
                    inputMode="numeric"
                    required
                    error={errors.cep}
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Endereço"
                    value={form.endereco}
                    onChange={set("endereco")}
                    placeholder="Rua, avenida…"
                    autoComplete="address-line1"
                    required
                    error={errors.endereco}
                    className="sm:col-span-4"
                  />
                  <Field
                    label="Número"
                    value={form.numero}
                    onChange={set("numero")}
                    placeholder="Nº"
                    inputMode="numeric"
                    required
                    error={errors.numero}
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Complemento"
                    value={form.complemento}
                    onChange={set("complemento")}
                    placeholder="Apto, bloco (opcional)"
                    className="sm:col-span-4"
                  />
                  <Field
                    label="Bairro"
                    value={form.bairro}
                    onChange={set("bairro")}
                    required
                    error={errors.bairro}
                    className="sm:col-span-3"
                  />
                  <Field
                    label="Cidade"
                    value={form.cidade}
                    onChange={set("cidade")}
                    required
                    error={errors.cidade}
                    className="sm:col-span-2"
                  />
                  <label className="flex flex-col gap-1.5 sm:col-span-1">
                    <span className="text-xs font-medium text-ink-700">UF</span>
                    <select
                      value={form.estado}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, estado: e.target.value }))
                      }
                      className="rounded-xs border border-ink/15 bg-ivory-50 px-3 py-3 text-sm focus:border-ink focus:outline-none"
                    >
                      {ufs.map((uf) => (
                        <option key={uf}>{uf}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {shippingMethod === "retirada" && (
                <div className="mt-6 rounded-xs bg-ivory-100 p-5 text-sm text-ink-700">
                  <p className="font-semibold text-ink">Retirada na loja JA</p>
                  <p className="mt-1">{brand.address.full}</p>
                  <p className="mt-1 text-ink-500">
                    Avisaremos pelo WhatsApp assim que o pedido estiver separado.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Etapa 2 — Pagamento */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl text-ink">Pagamento</h2>
              <p className="mt-1 text-sm text-ink-500">
                Escolha a forma de pagamento. Este é um ambiente de demonstração
                — nenhuma cobrança é feita.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPayment("pix")}
                  aria-pressed={payment === "pix"}
                  className={clsx(
                    "flex flex-col items-center gap-2 rounded-xs border p-5 transition",
                    payment === "pix"
                      ? "border-champagne bg-champagne-soft/20 ring-1 ring-champagne"
                      : "border-ink/15 hover:border-ink/30",
                  )}
                >
                  <QrCode size={22} className="text-champagne-dark" />
                  <span className="text-sm font-semibold text-ink">Pix</span>
                  <span className="text-xs text-sage">5% de desconto</span>
                </button>
                <button
                  onClick={() => setPayment("cartao")}
                  aria-pressed={payment === "cartao"}
                  className={clsx(
                    "flex flex-col items-center gap-2 rounded-xs border p-5 transition",
                    payment === "cartao"
                      ? "border-champagne bg-champagne-soft/20 ring-1 ring-champagne"
                      : "border-ink/15 hover:border-ink/30",
                  )}
                >
                  <CreditCard size={22} className="text-champagne-dark" />
                  <span className="text-sm font-semibold text-ink">
                    Cartão de crédito
                  </span>
                  <span className="text-xs text-ink-500">até 10x sem juros</span>
                </button>
              </div>

              {payment === "pix" ? (
                <div className="mt-6 flex flex-col items-center rounded-xs border border-ink/10 bg-ivory-50 p-6 text-center">
                  <PixCode />
                  <p className="mt-4 text-sm text-ink-700">
                    Escaneie o QR Code ou copie o código para pagar
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-ink">
                    {formatBRL(pixTotal)}
                  </p>
                  <button
                    onClick={copyPix}
                    className="btn-outline mt-4"
                  >
                    {copied ? (
                      <>
                        <Check size={15} /> Código copiado
                      </>
                    ) : (
                      <>
                        <Copy size={15} /> Copiar código Pix
                      </>
                    )}
                  </button>
                  <p className="mt-3 text-xs text-ink-500">
                    Pagamento confirmado em instantes após a transferência.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Número do cartão"
                    value={card.numero}
                    onChange={setCardField("numero")}
                    placeholder="0000 0000 0000 0000"
                    inputMode="numeric"
                    required
                    error={cardErrors.numero}
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Nome impresso no cartão"
                    value={card.nome}
                    onChange={setCardField("nome")}
                    placeholder="Como está no cartão"
                    autoComplete="cc-name"
                    required
                    error={cardErrors.nome}
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Validade"
                    value={card.validade}
                    onChange={setCardField("validade")}
                    placeholder="MM/AA"
                    inputMode="numeric"
                    required
                    error={cardErrors.validade}
                  />
                  <Field
                    label="CVV"
                    value={card.cvv}
                    onChange={setCardField("cvv")}
                    placeholder="000"
                    inputMode="numeric"
                    required
                    error={cardErrors.cvv}
                  />
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="text-xs font-medium text-ink-700">
                      Parcelas
                    </span>
                    <select className="rounded-xs border border-ink/15 bg-ivory-50 px-4 py-3 text-sm focus:border-ink focus:outline-none">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <option key={i}>
                          {i + 1}x de {formatBRL(total / (i + 1))} sem juros
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="sm:col-span-2 flex items-center gap-2 rounded-xs bg-ivory-100 p-3 text-xs text-ink-500">
                    <Lock size={13} /> Simulação — não digite dados reais de
                    cartão.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Etapa 3 — Revisão */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl text-ink">
                Revise seu pedido
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Confira tudo antes de finalizar.
              </p>

              <div className="mt-6 grid gap-4">
                <ReviewBlock
                  title="Identificação"
                  onEdit={() => setStep(0)}
                  lines={[form.nome, form.cpf, form.email, form.telefone]}
                />
                <ReviewBlock
                  title="Entrega"
                  onEdit={() => setStep(1)}
                  lines={
                    shippingMethod === "retirada"
                      ? ["Retirada na loja", brand.address.full]
                      : [
                          `${form.endereco}, ${form.numero} ${form.complemento}`,
                          `${form.bairro} — ${form.cidade}/${form.estado}`,
                          `CEP ${form.cep}`,
                          shippingMethod === "expressa"
                            ? "Entrega expressa (1-2 dias)"
                            : "Econômica (4-9 dias)",
                        ]
                  }
                />
                <ReviewBlock
                  title="Pagamento"
                  onEdit={() => setStep(2)}
                  lines={[
                    payment === "pix"
                      ? `Pix — ${formatBRL(pixTotal)} (5% de desconto)`
                      : `Cartão de crédito — até 10x`,
                  ]}
                />
              </div>

              <div className="mt-6 flex items-start gap-2 rounded-xs bg-ivory-100 p-4 text-xs text-ink-500">
                <ShieldCheck size={15} className="mt-0.5 text-champagne-dark" />
                Ao finalizar, você concorda com os termos de compra. Este é um
                protótipo demonstrativo: nenhum pagamento é processado e nenhum
                dado é enviado.
              </div>
            </div>
          )}

          {/* Navegação */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                onClick={back}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink"
              >
                <ChevronLeft size={16} /> Voltar
              </button>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <button onClick={next} className="btn-primary">
                Continuar
              </button>
            ) : (
              <button
                onClick={finalize}
                disabled={submitting}
                className="btn-gold min-w-[200px]"
              >
                {submitting ? "Processando…" : "Finalizar compra"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary showItems />
        <div className="mt-4">
          <CouponInput />
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-500">
          <Lock size={12} /> Ambiente seguro · dados protegidos
        </p>
      </div>
    </div>
  );
}

function ReviewBlock({
  title,
  lines,
  onEdit,
}: {
  title: string;
  lines: string[];
  onEdit: () => void;
}) {
  return (
    <div className="rounded-xs border border-ink/10 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <button
          onClick={onEdit}
          className="text-xs font-medium text-champagne-dark hover:underline"
        >
          Editar
        </button>
      </div>
      <div className="mt-2 grid gap-0.5">
        {lines.filter(Boolean).map((l, i) => (
          <p key={i} className="text-sm text-ink-600">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

/** QR Code decorativo (padrão determinístico) — apenas visual. */
function PixCode() {
  const cells = 21;
  const seed = 7;
  const isFilled = (r: number, c: number) => {
    // cantos de posicionamento
    const inCorner = (rr: number, cc: number) =>
      (rr < 7 && cc < 7) ||
      (rr < 7 && cc >= cells - 7) ||
      (rr >= cells - 7 && cc < 7);
    if (inCorner(r, c)) {
      const lr = r % (cells - 7);
      const lc = c % (cells - 7);
      const ring =
        lr === 0 || lr === 6 || lc === 0 || lc === 6 ||
        (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      return ring;
    }
    return (r * cells + c * seed + ((r * c) % 5)) % 3 === 0;
  };
  return (
    <div className="rounded-xs bg-ivory-50 p-4 shadow-card">
      <svg viewBox={`0 0 ${cells} ${cells}`} className="h-44 w-44">
        {Array.from({ length: cells }).map((_, r) =>
          Array.from({ length: cells }).map((_, c) =>
            isFilled(r, c) ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width="1"
                height="1"
                fill="#3E2D33"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}
