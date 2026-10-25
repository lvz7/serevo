import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import {
  Volume2,
  VolumeX,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Leaf,
  MapPin,
  Mail,
  Phone,
  Check,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { content, planAmounts, type Lang, type PlanId } from "@/lib/i18n";
import { createCheckoutSession } from "@/lib/checkout.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Serevo – Kübelreinigung Region Zürich" },
      {
        name: "description",
        content:
          "Kompost- und Abfallkübel professionell reinigen lassen – hygienisch, vor Ort, in der Region Zürich. Einmalig ab 30.– CHF oder im Abo ab 16.– CHF pro Monat.",
      },
      { property: "og:title", content: "Serevo – Kübelreinigung Region Zürich" },
      {
        property: "og:description",
        content: "Gründliche & hygienische Kübelreinigung vor Ort in der Region Zürich.",
      },
    ],
  }),
  component: Index,
});

const TIPS = [0, 200, 500];
const icons = [Sparkles, ShieldCheck, Leaf];

function chf(cents: number) {
  return (cents / 100).toFixed(2).replace(".00", ".–");
}

function Index() {
  const [lang, setLang] = useState<Lang>("de");
  const [plan, setPlan] = useState<PlanId>("once");
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = content[lang];
  const checkout = useServerFn(createCheckoutSession);

  const total = useMemo(() => planAmounts[plan] + tip, [plan, tip]);
  const intervalLabel =
    plan === "monthly"
      ? t.pricing.perMonth
      : plan === "sixmonth"
        ? lang === "de"
          ? "/6 Monate"
          : "/6 months"
        : plan === "yearly"
          ? lang === "de"
            ? "/Jahr"
            : "/year"
          : null;

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await checkout({
        data: { plan, tip, origin: window.location.origin, lang },
      });
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-2 font-extrabold tracking-tight">
            <img src="/serevo-logo.png" alt="Serevo Logo" className="size-9 object-contain" />
            Serevo
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a className="transition-colors hover:text-foreground" href="#services">
              {t.nav.services}
            </a>
            <a className="transition-colors hover:text-foreground" href="#laub">
              {t.nav.leaves}
            </a>
            <a className="transition-colors hover:text-foreground" href="#pricing">
              {t.nav.prices}
            </a>
            <a className="transition-colors hover:text-foreground" href="#story">
              {t.nav.story}
            </a>
            <a className="transition-colors hover:text-foreground" href="#contact">
              {t.nav.contact}
            </a>
          </nav>
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs font-semibold">
            {(["de", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 transition-colors ${
                  lang === l
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <MapPin className="size-3.5" />
              {t.hero.badge}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] md:text-5xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">{t.hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full surface-forest px-6 py-3.5 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5"
              >
                {t.hero.cta}
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#story"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                {t.hero.secondary}
              </a>
            </div>
          </div>
          <HeroVideo lang={lang} badge={t.hero.priceBadge} />
        </section>

        {/* Benefits */}
        <section id="services" className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <h2 className="text-3xl font-extrabold md:text-4xl">{t.benefits.title}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {t.benefits.items.map((item, i) => {
              const Icon = icons[i] ?? Sparkles;
              return (
                <div
                  key={item.t}
                  className="rounded-[1.75rem] border border-border bg-card p-7 transition-shadow hover:shadow-soft"
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{item.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        <LeafSection t={t.leaves} />

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <div className="rounded-[2.25rem] surface-forest p-6 md:p-12">
            <h2 className="text-3xl font-extrabold md:text-4xl">{t.pricing.title}</h2>
            <p className="mt-2 opacity-80">{t.pricing.sub}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {t.pricing.plans.map((p) => {
                const active = plan === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id as PlanId)}
                    className={`rounded-[1.5rem] p-6 text-left transition-all ${
                      active
                        ? "bg-accent text-accent-foreground ring-2 ring-accent"
                        : "bg-card text-card-foreground hover:-translate-y-1"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      {active && <Check className="size-4 shrink-0" />}
                    </div>
                    <div className="mt-4 text-3xl font-extrabold">{p.price}</div>
                    <div className="text-xs font-medium opacity-70">CHF · {p.note}</div>
                    <p className="mt-3 text-xs leading-relaxed opacity-80">{p.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Tip */}
            <div className="mt-8 rounded-[1.5rem] bg-card p-6 text-card-foreground md:p-8">
              <h3 className="text-lg font-bold">{t.pricing.tipTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.pricing.tipSub}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {TIPS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setTip(amount);
                      setCustomTip("");
                    }}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                      tip === amount && customTip === ""
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    {amount === 0 ? "0 CHF" : `${amount / 100}.– CHF`}
                  </button>
                ))}
                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5">
                  <input
                    inputMode="decimal"
                    value={customTip}
                    placeholder={t.pricing.custom}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      setCustomTip(v);
                      const num = Math.round(Number(v) * 100);
                      setTip(Number.isFinite(num) && num > 0 ? Math.min(num, 100000) : 0);
                    }}
                    className="w-28 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <span className="text-sm font-semibold text-muted-foreground">CHF</span>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.pricing.total}
                  </div>
                  <div className="text-3xl font-extrabold">
                    {chf(total)} CHF
                    {intervalLabel && (
                      <span className="text-base font-semibold text-muted-foreground">
                        {intervalLabel}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {loading ? t.pricing.loading : t.pricing.checkout}
                </button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{t.pricing.secure}</p>
              {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
            </div>
          </div>
        </section>

        {/* Region */}
        <section className="mx-auto max-w-6xl px-5 py-6 md:py-10">
          <div className="flex flex-col items-start gap-3 rounded-[1.75rem] bg-accent p-8 text-accent-foreground md:flex-row md:items-center md:gap-6">
            <MapPin className="size-6 shrink-0" />
            <div>
              <p className="text-lg font-bold">{t.region.title}</p>
              <p className="mt-1 text-sm opacity-80">{t.region.sub}</p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section
          id="story"
          className="relative mx-auto max-w-3xl overflow-hidden px-5 py-14 text-center md:py-24"
        >
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 w-[26rem] max-w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
          >
            <rect width="32" height="32" fill="#D52B1E" />
            <rect x="13" y="6" width="6" height="20" fill="#fff" />
            <rect x="6" y="13" width="20" height="6" fill="#fff" />
          </svg>
          <span className="relative inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            {t.story.goal}
          </span>
          <h2 className="relative mt-5 text-3xl font-extrabold md:text-4xl">{t.story.title}</h2>
          <p className="relative mt-5 text-lg leading-relaxed text-muted-foreground">
            {t.story.body}
          </p>
        </section>
      </main>

      <footer id="contact" className="surface-forest">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-xl font-extrabold">
              <img src="/serevo-logo.png" alt="Serevo Logo" className="size-9 object-contain" />
              Serevo
            </div>
            <p className="mt-4 max-w-sm text-sm opacity-80">{t.region.title}</p>
            <p className="mt-6 flex items-center gap-2 text-sm opacity-80">
              <svg
                viewBox="0 0 32 32"
                className="size-5 rounded-sm"
                aria-label="Schweiz"
                role="img"
              >
                <rect width="32" height="32" fill="#D52B1E" />
                <rect x="13" y="6" width="6" height="20" fill="#fff" />
                <rect x="6" y="13" width="20" height="6" fill="#fff" />
              </svg>
              {t.footer.made}
            </p>
          </div>
          <div className="md:justify-self-end">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-70">
              {t.footer.contact}
            </h3>
            <a
              href="mailto:serevo.services@gmail.com"
              className="mt-4 flex items-center gap-3 text-sm font-semibold hover:underline"
            >
              <Mail className="size-4" />
              serevo.services@gmail.com
            </a>
            <a
              href="tel:+41797401171"
              className="mt-3 flex items-center gap-3 text-sm font-semibold hover:underline"
            >
              <Phone className="size-4" />
              +41 79 740 11 71
            </a>
            <a
              href="https://wa.me/41797401171"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15 py-5 text-center text-xs opacity-60">
          © {new Date().getFullYear()} Serevo
        </div>
      </footer>
    </div>
  );
}

function HeroVideo({ lang, badge }: { lang: Lang; badge: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) {
      v.currentTime = 0;
      void v.play();
    }
    setMuted(v.muted);
  }

  return (
    <div className="relative mx-auto w-full max-w-[22rem]">
      <div className="overflow-hidden rounded-[2rem] bg-primary shadow-soft">
        <video
          ref={ref}
          src="/serevo-herbst-ad.mp4"
          poster="/serevo-herbst-ad-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          width={1080}
          height={1920}
          aria-label={
            lang === "de"
              ? "Serevo Werbevideo: Herbst-Spezial Laub wischen"
              : "Serevo ad: autumn special leaf sweeping"
          }
          className="block aspect-[9/16] w-full object-cover"
        />
      </div>
      <button
        type="button"
        onClick={toggleSound}
        aria-label={
          muted
            ? lang === "de"
              ? "Ton einschalten"
              : "Turn sound on"
            : lang === "de"
              ? "Ton ausschalten"
              : "Mute"
        }
        className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-3.5 py-2 text-xs font-semibold text-foreground shadow-soft backdrop-blur transition-colors hover:bg-background"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        {muted ? (lang === "de" ? "Ton an" : "Sound on") : lang === "de" ? "Ton aus" : "Mute"}
      </button>
      <div className="absolute -bottom-5 left-5 rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-soft">
        {badge}
      </div>
    </div>
  );
}

type LeafCopy = (typeof content)["de"]["leaves"] | (typeof content)["en"]["leaves"];

const FALLING_LEAVES = [
  { left: "8%", delay: "0s", dur: "9s", size: 22, color: "var(--accent)" },
  { left: "22%", delay: "3.5s", dur: "11s", size: 16, color: "#C4A05C" },
  { left: "41%", delay: "1.2s", dur: "10s", size: 26, color: "var(--accent)" },
  { left: "63%", delay: "5s", dur: "12s", size: 18, color: "#A39B82" },
  { left: "78%", delay: "2.2s", dur: "9.5s", size: 24, color: "#C4A05C" },
  { left: "91%", delay: "6.5s", dur: "11.5s", size: 15, color: "var(--accent)" },
];

function LeafIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 36" width={size} height={size * 1.5} aria-hidden="true">
      <path d="M12 1C20 9 20 25 12 35C4 25 4 9 12 1Z" fill={color} />
      <path
        d="M12 4V34M12 14l5-4M12 14l-5-4M12 22l5-4M12 22l-5-4"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

function LeafSection({ t }: { t: LeafCopy }) {
  return (
    <section id="laub" className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <div className="relative overflow-hidden rounded-[2.25rem] surface-forest p-7 md:p-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {FALLING_LEAVES.map((l, i) => (
            <span
              key={i}
              className="leaf-fall absolute -top-12"
              style={{ left: l.left, animationDelay: l.delay, animationDuration: l.dur }}
            >
              <LeafIcon size={l.size} color={l.color} />
            </span>
          ))}
        </div>

        <div className="relative grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
              <Leaf className="size-3.5" />
              {t.badge}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold md:text-5xl">{t.title}</h2>
            <p className="mt-4 max-w-lg text-lg opacity-85">{t.sub}</p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {t.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm font-medium">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Check className="size-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] bg-card p-7 text-card-foreground shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.priceLabel}
            </p>
            <p className="mt-1 text-3xl font-extrabold">{t.price}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.priceNote}</p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={`https://wa.me/41797401171?text=${encodeURIComponent(t.whatsappText)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="size-4" />
                {t.ctaWhatsapp}
              </a>
              <a
                href="tel:+41797401171"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                <Phone className="size-4" />
                079 740 11 71
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
