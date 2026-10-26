import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  Check,
  CreditCard,
  Loader2,
  Mail,
  MessageCircle,
  Minus,
  Plus,
  Wallet,
} from "lucide-react";
import { EMAIL, SiteFooter, SiteHeader, whatsappUrl } from "@/components/site";
import {
  BIN_MAX,
  BIN_PLANS,
  CATEGORIES,
  SERVICES,
  TIP_MAX,
  chf,
  intervalLabel,
  priceOrder,
  qtyText,
  totals,
  type BinPlanId,
  type CategoryId,
  type Order,
  type Service,
} from "@/lib/catalog";
import {
  SLOTS,
  availableDates,
  contactSchema,
  formatDate,
  weekday,
  type BookingInput,
} from "@/lib/booking";
import { createCheckoutSession, submitBooking } from "@/lib/checkout.functions";
import { content, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/lang";
import { bookingText } from "@/lib/summary";

type Search = {
  add?: string | undefined;
  bin?: BinPlanId | undefined;
  cancelled?: boolean | undefined;
};
const PLAN_IDS = BIN_PLANS.map((p) => p.id) as string[];

export const Route = createFileRoute("/buchen")({
  head: () => ({
    meta: [
      { title: "Termin buchen – Serevo" },
      {
        name: "description",
        content:
          "Leistungen wählen, Termin aussuchen und online oder bar bezahlen. Serevo, Rüschlikon & Region Zürich.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    add: typeof s["add"] === "string" ? s["add"] : undefined,
    bin:
      typeof s["bin"] === "string" && PLAN_IDS.includes(s["bin"])
        ? (s["bin"] as BinPlanId)
        : undefined,
    cancelled:
      s["cancelled"] === "1" || s["cancelled"] === 1 || s["cancelled"] === true ? true : undefined,
  }),
  component: Booking,
});

type Contact = {
  name: string;
  phone: string;
  email: string;
  street: string;
  zip: string;
  city: string;
  notes: string;
};
const EMPTY_CONTACT: Contact = {
  name: "",
  phone: "",
  email: "",
  street: "",
  zip: "",
  city: "",
  notes: "",
};
const STORE = "serevo-booking";
const TIPS = [0, 200, 500, 1000];

type Saved = { items: Record<string, number>; bin: Order["bin"]; contact: Contact };

function Booking() {
  const { lang } = useLang();
  const t = content[lang].book;
  const search = Route.useSearch();
  const navigate = useNavigate();
  const checkout = useServerFn(createCheckoutSession);
  const sendCash = useServerFn(submitBooking);

  const [items, setItems] = useState<Record<string, number>>({});
  const [bin, setBin] = useState<Order["bin"]>(null);
  const [tab, setTab] = useState<CategoryId>("packages");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [payment, setPayment] = useState<"online" | "cash">("online");
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const dates = useMemo(() => availableDates(), []);

  // restore an earlier selection, then apply ?add= / ?bin= from the link that brought us here
  useEffect(() => {
    let saved: Saved | null = null;
    try {
      const raw = window.sessionStorage.getItem(STORE);
      if (raw) saved = JSON.parse(raw) as Saved;
    } catch {
      // ignore
    }
    const nextItems = { ...(saved?.items ?? {}) };
    let nextBin = saved?.bin ?? null;
    if (saved?.contact) setContact({ ...EMPTY_CONTACT, ...saved.contact });
    const svc = SERVICES.find((s) => s.id === search.add);
    if (svc) {
      nextItems[svc.id] = Math.max(nextItems[svc.id] ?? 0, 1);
      setTab(svc.category);
    }
    if (search.bin) nextBin = { plan: search.bin, qty: Math.max(nextBin?.qty ?? 0, 1) };
    setItems(nextItems);
    setBin(nextBin);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.sessionStorage.setItem(STORE, JSON.stringify({ items, bin, contact } satisfies Saved));
    } catch {
      // ignore
    }
  }, [items, bin, contact, ready]);

  const order: Order = { items, bin, tip: payment === "online" ? tip : 0 };
  const lines = priceOrder(order, lang);
  const sum = totals(lines, order.tip);
  const hasPlan = !!sum.recurring;
  const pay = hasPlan ? "online" : payment;

  function setQty(id: string, qty: number) {
    setItems((prev) => ({ ...prev, [id]: qty }));
    setErrors((e) => ({ ...e, items: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (lines.length === 0) e["items"] = t.errors.items;
    if (!date || !time) e["date"] = t.errors.date;
    const parsed = contactSchema.safeParse(contact);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (k in t.errors) e[k] = t.errors[k as keyof typeof t.errors];
      }
    }
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document
        .getElementById(first === "items" ? "step-1" : first === "date" ? "step-2" : `f-${first}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setServerError(null);
    if (!validate()) return;
    const data: BookingInput = {
      order: { items, bin, tip: pay === "online" ? tip : 0 },
      date,
      time,
      contact,
      lang,
      origin: window.location.origin,
    };
    setBusy(true);
    try {
      if (pay === "online") {
        const { url } = await checkout({ data });
        window.location.href = url;
        return;
      }
      const { emailed } = await sendCash({ data });
      if (emailed) {
        clearSaved();
        await navigate({ to: "/success", search: { lang, type: "cash" } });
      } else {
        setFallback(bookingText(data, "cash"));
        setBusy(false);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error");
      setBusy(false);
    }
  }

  const field = (k: keyof Contact) => ({
    id: `f-${k}`,
    value: contact[k],
    onChange: (ev: { target: { value: string } }) => {
      setContact((c) => ({ ...c, [k]: ev.target.value }));
      if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
    },
  });

  const countIn = (c: CategoryId) =>
    SERVICES.filter((s) => s.category === c).reduce(
      (a, s) => a + ((items[s.id] ?? 0) > 0 ? 1 : 0),
      0,
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader showBook={false} />

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-5 md:pt-12 lg:pb-20">
        <h1 className="text-4xl md:text-5xl">{t.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.sub}</p>
        {search.cancelled && (
          <p className="mt-4 rounded-2xl bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
            {t.cancelled}
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-6">
            {/* 1 services */}
            <Step n={1} title={t.step1} id="step-1" error={errors["items"]}>
              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
                {CATEGORIES.map((c) => {
                  const n = countIn(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="tab"
                      aria-selected={tab === c.id}
                      onClick={() => setTab(c.id)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        tab === c.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-accent"
                      }`}
                    >
                      {c.name[lang]}
                      {n > 0 && (
                        <span
                          className={`grid size-5 place-items-center rounded-full text-[11px] ${
                            tab === c.id
                              ? "bg-accent text-accent-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {n}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <ul className="mt-4 divide-y divide-border">
                {SERVICES.filter((s) => s.category === tab).map((s) => (
                  <ServiceRow
                    key={s.id}
                    s={s}
                    lang={lang}
                    qty={items[s.id] ?? 0}
                    onChange={(q) => setQty(s.id, q)}
                  />
                ))}
              </ul>

              {/* compost bin */}
              <div className="mt-6 rounded-2xl bg-secondary p-5">
                <p className="font-display text-lg">{t.binTitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip active={!bin} onClick={() => setBin(null)}>
                    {t.binNone}
                  </Chip>
                  {BIN_PLANS.map((p) => (
                    <Chip
                      key={p.id}
                      active={bin?.plan === p.id}
                      onClick={() => {
                        setBin({ plan: p.id, qty: Math.max(bin?.qty ?? 0, 1) });
                        setErrors((e) => ({ ...e, items: "" }));
                      }}
                    >
                      {p.name[lang]} · {chf(p.price)}
                    </Chip>
                  ))}
                </div>
                {bin && (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      {BIN_PLANS.find((p) => p.id === bin.plan)?.note[lang]}
                    </p>
                    <Stepper
                      value={bin.qty}
                      max={BIN_MAX}
                      label={`${bin.qty} ${t.bins}`}
                      onChange={(q) => setBin(q === 0 ? null : { ...bin, qty: q })}
                    />
                  </div>
                )}
              </div>
            </Step>

            {/* 2 date */}
            <Step n={2} title={t.step2} id="step-2" error={errors["date"]}>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                {dates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDate(d);
                      if (!(SLOTS[weekday(d)] ?? []).includes(time)) setTime("");
                      setErrors((e) => ({ ...e, date: "" }));
                    }}
                    className={`flex w-[4.5rem] shrink-0 flex-col items-center rounded-2xl border px-2 py-3 text-center transition-colors ${
                      date === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-secondary"
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase opacity-70">
                      {formatDate(d, lang, "short").split(/[ ,.]+/)[0]}
                    </span>
                    <span className="font-display text-2xl">{Number(d.slice(8))}</span>
                    <span className="text-[11px] opacity-70">
                      {new Intl.DateTimeFormat(lang === "de" ? "de-CH" : "en-GB", {
                        month: "short",
                        timeZone: "UTC",
                      }).format(new Date(`${d}T12:00:00Z`))}
                    </span>
                  </button>
                ))}
              </div>
              {date ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold">
                    {t.timeFor} · {formatDate(date, lang)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(SLOTS[weekday(date)] ?? []).map((s) => (
                      <Chip
                        key={s}
                        active={time === s}
                        onClick={() => {
                          setTime(s);
                          setErrors((e) => ({ ...e, date: "" }));
                        }}
                      >
                        {s}
                      </Chip>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  {t.noDates}
                </p>
              )}
            </Step>

            {/* 3 details */}
            <Step n={3} title={t.step3}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.fields.name} error={errors["name"]} className="sm:col-span-2">
                  <input
                    {...field("name")}
                    autoComplete="name"
                    className={inputCls(errors["name"])}
                  />
                </Field>
                <Field label={t.fields.phone} error={errors["phone"]}>
                  <input
                    {...field("phone")}
                    type="tel"
                    autoComplete="tel"
                    className={inputCls(errors["phone"])}
                  />
                </Field>
                <Field label={t.fields.email} error={errors["email"]}>
                  <input
                    {...field("email")}
                    type="email"
                    autoComplete="email"
                    className={inputCls(errors["email"])}
                  />
                </Field>
                <Field label={t.fields.street} error={errors["street"]} className="sm:col-span-2">
                  <input
                    {...field("street")}
                    autoComplete="street-address"
                    className={inputCls(errors["street"])}
                  />
                </Field>
                <Field label={t.fields.zip} error={errors["zip"]}>
                  <input
                    {...field("zip")}
                    inputMode="numeric"
                    maxLength={4}
                    autoComplete="postal-code"
                    className={inputCls(errors["zip"])}
                  />
                </Field>
                <Field label={t.fields.city} error={errors["city"]}>
                  <input
                    {...field("city")}
                    autoComplete="address-level2"
                    className={inputCls(errors["city"])}
                  />
                </Field>
                <Field label={t.fields.notes} className="sm:col-span-2">
                  <textarea
                    {...field("notes")}
                    rows={3}
                    placeholder={t.fields.notesPh}
                    className={inputCls()}
                  />
                </Field>
              </div>
            </Step>

            {/* 4 payment */}
            <Step n={4} title={t.step4}>
              <div className="grid gap-3 sm:grid-cols-2">
                <PayOption
                  active={pay === "online"}
                  onClick={() => setPayment("online")}
                  icon={<CreditCard className="size-5" />}
                  title={t.online}
                  sub={t.onlineSub}
                />
                <PayOption
                  active={pay === "cash"}
                  disabled={hasPlan}
                  onClick={() => setPayment("cash")}
                  icon={<Wallet className="size-5" />}
                  title={t.cash}
                  sub={hasPlan ? t.subNote : t.cashSub}
                />
              </div>
              {pay === "online" && (
                <div className="mt-5">
                  <p className="text-sm font-semibold">{t.tipTitle}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {TIPS.map((a) => (
                      <Chip
                        key={a}
                        active={tip === a && customTip === ""}
                        onClick={() => {
                          setTip(a);
                          setCustomTip("");
                        }}
                      >
                        {a === 0 ? "0" : chf(a)}
                      </Chip>
                    ))}
                    <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5">
                      <input
                        inputMode="decimal"
                        value={customTip}
                        placeholder={t.custom}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9.]/g, "");
                          setCustomTip(v);
                          const num = Math.round(Number(v) * 100);
                          setTip(Number.isFinite(num) && num > 0 ? Math.min(num, TIP_MAX) : 0);
                        }}
                        className="w-28 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                      <span className="text-sm font-semibold text-muted-foreground">CHF</span>
                    </div>
                  </div>
                </div>
              )}
            </Step>
          </div>

          {/* summary */}
          <aside id="summary" className="lg:sticky lg:top-24">
            <div className="rounded-[1.75rem] surface-forest p-6">
              <p className="font-display text-xl">{t.summary}</p>
              {lines.length === 0 ? (
                <p className="mt-3 text-sm opacity-75">{t.empty}</p>
              ) : (
                <ul className="mt-4 space-y-3 text-sm">
                  {lines.map((l) => (
                    <li key={l.key} className="flex justify-between gap-3">
                      <span>
                        {l.name}
                        {l.qtyText && <span className="block text-xs opacity-70">{l.qtyText}</span>}
                      </span>
                      <span className="shrink-0 font-semibold">
                        {chf(l.amount)}
                        {l.recurring && (
                          <span className="block text-right text-[11px] font-normal opacity-70">
                            {intervalLabel(l.recurring, lang)}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                  {sum.tip > 0 && (
                    <li className="flex justify-between gap-3">
                      <span>{lang === "de" ? "Trinkgeld" : "Tip"}</span>
                      <span className="font-semibold">{chf(sum.tip)}</span>
                    </li>
                  )}
                </ul>
              )}
              {date && time && (
                <p className="mt-4 flex items-center gap-2 border-t border-primary-foreground/15 pt-4 text-sm">
                  <CalendarDays className="size-4 opacity-80" />
                  {formatDate(date, lang)}, {time}
                </p>
              )}
              <div className="mt-4 border-t border-primary-foreground/15 pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                    {hasPlan ? t.dueToday : t.total}
                  </span>
                  <span className="font-display text-3xl">{chf(sum.dueToday)} CHF</span>
                </div>
                {hasPlan && (
                  <p className="mt-1 text-right text-xs opacity-75">
                    {t.thenRecurring} {chf(sum.recurringSum)} {intervalLabel(sum.recurring, lang)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy
                  ? t.loading
                  : pay === "online"
                    ? `${t.payNow} · ${chf(sum.dueToday)}`
                    : t.request}
              </button>
              {serverError && (
                <p className="mt-3 rounded-xl bg-destructive/15 px-3 py-2 text-xs font-medium text-red-200">
                  {serverError}
                </p>
              )}
              <p className="mt-3 text-center text-[11px] opacity-60">{t.secure}</p>
            </div>

            {fallback && (
              <div className="mt-4 rounded-[1.75rem] border border-border bg-card p-6">
                <p className="font-display text-lg">{t.fallbackTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.fallbackBody}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={whatsappUrl(fallback)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={clearSaved}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
                  >
                    <MessageCircle className="size-4" />
                    {t.sendWhatsapp}
                  </a>
                  <a
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Buchung ${date} ${time} – ${contact.name}`)}&body=${encodeURIComponent(fallback)}`}
                    onClick={clearSaved}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold"
                  >
                    <Mail className="size-4" />
                    {t.sendEmail}
                  </a>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* mobile total bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {hasPlan ? t.dueToday : t.total}
            </p>
            <p className="font-display text-2xl leading-none">{chf(sum.dueToday)} CHF</p>
          </div>
          <a
            href="#summary"
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            {t.next}
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function clearSaved() {
  try {
    window.sessionStorage.removeItem(STORE);
  } catch {
    // ignore
  }
}

const inputCls = (err?: string) =>
  `w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary ${
    err ? "border-destructive" : "border-border"
  }`;

function Step({
  n,
  title,
  id,
  error,
  children,
}: {
  n: number;
  title: string;
  id?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <section id={id} className="rounded-[1.75rem] border border-border bg-card p-5 sm:p-7">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-primary font-display text-primary-foreground">
          {n}
        </span>
        <h2 className="text-2xl">{title}</h2>
      </div>
      {children}
      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
    </section>
  );
}

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-destructive">{error}</span>}
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-background hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({
  value,
  max,
  label,
  onChange,
}: {
  value: number;
  max: number;
  label: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="−"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="grid size-9 place-items-center rounded-full border border-border bg-background hover:bg-secondary"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-[4.5rem] text-center text-sm font-semibold tabular-nums">{label}</span>
      <button
        type="button"
        aria-label="+"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function ServiceRow({
  s,
  lang,
  qty,
  onChange,
}: {
  s: Service;
  lang: Lang;
  qty: number;
  onChange: (q: number) => void;
}) {
  const on = qty > 0;
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {s.name[lang]}
          {s.seasonal && (
            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {s.seasonal[lang]}
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          {chf(s.price)} {s.unit[lang]}
        </p>
        {s.desc && <p className="mt-1 text-xs text-muted-foreground">{s.desc[lang]}</p>}
      </div>
      {s.max === 1 ? (
        <button
          type="button"
          onClick={() => onChange(on ? 0 : 1)}
          aria-pressed={on}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            on
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background hover:bg-secondary"
          }`}
        >
          {on ? <Check className="size-4" /> : <Plus className="size-4" />}
          {on ? (lang === "de" ? "Gewählt" : "Added") : lang === "de" ? "Hinzufügen" : "Add"}
        </button>
      ) : (
        <Stepper
          value={qty}
          max={s.max}
          label={qty === 0 ? "0" : qtyText(s, qty, lang)}
          onChange={onChange}
        />
      )}
    </li>
  );
}

function PayOption({
  active,
  disabled,
  onClick,
  icon,
  title,
  sub,
}: {
  active: boolean;
  disabled?: boolean | undefined;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-primary bg-secondary ring-1 ring-primary"
          : "border-border bg-background hover:bg-secondary"
      }`}
    >
      <span className="mt-0.5 text-primary">{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
    </button>
  );
}
