import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  Leaf,
  ListChecks,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Truck,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteFooter, SiteHeader, WhatsAppButton, whatsappUrl } from "@/components/site";
import { BIN_PLANS, CATEGORIES, SERVICES, chf, type Service } from "@/lib/catalog";
import { content, type Copy, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { lang } = useLang();
  const t = content[lang];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <MapPin className="size-3.5" />
              {t.hero.badge}
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] md:text-6xl">{t.hero.title}</h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">{t.hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/buchen"
                className="inline-flex items-center gap-2 rounded-full surface-forest px-6 py-3.5 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5"
              >
                {t.hero.cta}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#preise"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                {t.hero.secondary}
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
              {t.hero.trust.map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <HeroVideo lang={lang} badge={t.hero.videoBadge} />
        </section>

        {/* Benefits */}
        <section id="leistungen" className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <h2 className="text-3xl md:text-4xl">{t.benefits.title}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {t.benefits.items.map((item, i) => {
              const Icon = [Sparkles, ShieldCheck, Clock][i] ?? Sparkles;
              return (
                <div key={item.t} className="rounded-[1.75rem] border border-border bg-card p-7">
                  <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-xl">{item.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <h2 className="text-3xl md:text-4xl">{t.steps.title}</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {t.steps.items.map((s, i) => {
              const Icon = [ListChecks, CalendarCheck, Truck][i] ?? ListChecks;
              return (
                <li key={s.t} className="relative rounded-[1.75rem] bg-secondary p-7">
                  <span className="font-display text-5xl text-primary/15">{i + 1}</span>
                  <Icon className="absolute right-7 top-7 size-6 text-primary" />
                  <h3 className="mt-2 text-xl">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <LeafSection t={t.leaves} />

        <PriceList lang={lang} t={t} />

        {/* Hours & region */}
        <section className="mx-auto max-w-6xl px-5 py-8 md:py-12">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[1.75rem] bg-accent p-8 text-accent-foreground">
              <MapPin className="size-6" />
              <p className="mt-4 text-xl font-display">{t.hours.region}</p>
              <p className="mt-2 text-sm opacity-80">{t.hours.regionSub}</p>
            </div>
            <div className="rounded-[1.75rem] border border-border bg-card p-8">
              <Clock className="size-6 text-primary" />
              <p className="mt-4 text-xl font-display">{t.hours.title}</p>
              <dl className="mt-3 space-y-2 text-sm">
                {t.hours.rows.map((r) => (
                  <div
                    key={r.d}
                    className="flex justify-between gap-4 border-b border-border pb-2 last:border-0"
                  >
                    <dt className="font-semibold">{r.d}</dt>
                    <dd className="text-muted-foreground">{r.h}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Story */}
        <section
          id="ueber-uns"
          className="relative mx-auto max-w-3xl overflow-hidden px-5 py-14 text-center md:py-24"
        >
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[26rem] max-w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
          >
            <rect width="32" height="32" fill="#D52B1E" />
            <rect x="13" y="6" width="6" height="20" fill="#fff" />
            <rect x="6" y="13" width="20" height="6" fill="#fff" />
          </svg>
          <span className="relative inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
            {t.story.goal}
          </span>
          <h2 className="relative mt-5 text-3xl md:text-4xl">{t.story.title}</h2>
          <p className="relative mt-5 text-lg leading-relaxed text-muted-foreground">
            {t.story.body}
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-5 pb-16 md:pb-24">
          <h2 className="text-3xl md:text-4xl">{t.faq.title}</h2>
          <Accordion type="single" collapsible className="mt-6">
            {t.faq.items.map((f, i) => (
              <AccordionItem key={f.q} value={`f${i}`}>
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

// ---------- price list ----------

function PriceRow({ s, lang }: { s: Service; lang: Lang }) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-semibold">
          {s.name[lang]}
          {s.seasonal && (
            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {s.seasonal[lang]}
            </span>
          )}
          {s.highlight && (
            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
              {s.highlight[lang]}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{s.unit[lang]}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-display text-lg">{chf(s.price)}</span>
        <Link
          to="/buchen"
          search={{ add: s.id }}
          aria-label={`${s.name[lang]} ${lang === "de" ? "buchen" : "book"}`}
          className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          +
        </Link>
      </div>
    </li>
  );
}

function PriceList({ lang, t }: { lang: Lang; t: Copy }) {
  const packages = SERVICES.filter((s) => s.category === "packages");
  return (
    <section id="preise" className="mx-auto max-w-6xl px-5 py-12 md:py-20">
      <h2 className="text-3xl md:text-4xl">{t.prices.title}</h2>
      <p className="mt-2 text-muted-foreground">{t.prices.sub}</p>

      {/* packages */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {packages.map((p, i) => (
          <div
            key={p.id}
            className={`flex flex-col rounded-[1.75rem] p-7 ${i === 0 ? "surface-forest" : "bg-accent text-accent-foreground"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-2xl">{p.name[lang]}</h3>
              {p.highlight && (
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                  {p.highlight[lang]}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm opacity-80">{p.desc?.[lang]}</p>
            <p className="mt-5 font-display text-4xl">
              <span className="text-base font-sans font-semibold opacity-70">
                {lang === "de" ? "ab " : "from "}
              </span>
              {chf(p.price)}
            </p>
            <Link
              to="/buchen"
              search={{ add: p.id }}
              className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${
                i === 0 ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
              }`}
            >
              {t.prices.book}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{t.prices.packageNote}</p>

      {/* single services */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {CATEGORIES.filter((c) => c.id !== "packages").map((c) => (
          <div key={c.id} className="rounded-[1.75rem] border border-border bg-card p-7">
            <h3 className="text-xl">{c.name[lang]}</h3>
            <ul className="mt-2 divide-y divide-border">
              {SERVICES.filter((s) => s.category === c.id).map((s) => (
                <PriceRow key={s.id} s={s} lang={lang} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* compost bin */}
      <div className="mt-5 rounded-[1.75rem] border border-border bg-card p-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-xl">{t.prices.binTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.prices.binSub}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BIN_PLANS.map((p) => (
            <Link
              key={p.id}
              to="/buchen"
              search={{ bin: p.id }}
              className="group rounded-2xl bg-secondary p-5 transition-colors hover:bg-accent"
            >
              <p className="text-sm font-semibold">{p.name[lang]}</p>
              <p className="mt-2 font-display text-3xl">{chf(p.price)}</p>
              <p className="text-xs text-muted-foreground">{p.note[lang]}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/buchen"
          className="inline-flex items-center gap-2 rounded-full surface-forest px-7 py-3.5 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5"
        >
          {t.prices.bookAll}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

// ---------- hero video ----------

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
    <div className="relative mx-auto w-full max-w-[21rem]">
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

// ---------- leaf special ----------

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

function LeafSection({ t }: { t: Copy["leaves"] }) {
  const sweep = SERVICES.find((s) => s.id === "sweep");
  return (
    <section id="laub" className="mx-auto max-w-6xl px-5 py-12 md:py-16">
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
            <h2 className="mt-5 text-4xl md:text-5xl">{t.title}</h2>
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
            <p className="mt-1 font-display text-4xl">
              {chf(sweep?.price ?? 500)}{" "}
              <span className="text-base font-sans font-semibold text-muted-foreground">
                {t.unit}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t.example}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/buchen"
                search={{ add: "sweep" }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <CalendarCheck className="size-4" />
                {t.cta}
              </Link>
              <a
                href={whatsappUrl(t.whatsappText)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                <MessageCircle className="size-4" />
                {t.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
