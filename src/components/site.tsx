import { Link } from "@tanstack/react-router";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { content, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/lang";

export const PHONE_DISPLAY = "079 740 11 71";
export const PHONE_TEL = "+41797401171";
export const EMAIL = "serevo.services@gmail.com";
export const whatsappUrl = (text?: string) =>
  `https://wa.me/41797401171${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export function SwissFlag({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`${className} rounded-[22%]`}
      aria-label="Schweiz"
      role="img"
    >
      <rect width="32" height="32" fill="#D52B1E" />
      <rect x="13" y="6" width="6" height="20" fill="#fff" />
      <rect x="6" y="13" width="20" height="6" fill="#fff" />
    </svg>
  );
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs font-semibold">
      {(["de", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
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
  );
}

export function SiteHeader({ showBook = true }: { showBook?: boolean }) {
  const { lang } = useLang();
  const t = content[lang].nav;
  const links = [
    ["#leistungen", t.services],
    ["#preise", t.prices],
    ["#laub", t.leaves],
    ["#ueber-uns", t.story],
    ["#faq", t.faq],
  ] as const;
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <Link to="/" className="flex items-center gap-2 text-lg font-display">
          <img src="/serevo-logo.png" alt="" className="size-9 object-contain" />
          Serevo
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          {links.map(([href, label]) => (
            <a key={href} className="transition-colors hover:text-foreground" href={`/${href}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle />
          {showBook && (
            <Link
              to="/buchen"
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {t.book}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { lang } = useLang();
  const c = content[lang];
  return (
    <footer id="kontakt" className="surface-forest">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-xl font-display">
            <img
              src="/serevo-logo.png"
              alt=""
              className="size-9 rounded-lg bg-cream object-contain p-1"
            />
            Serevo
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-80">{c.hours.region}</p>
          <p className="mt-5 flex items-center gap-2 text-sm opacity-80">
            <SwissFlag />
            {c.footer.made}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide opacity-70">{c.footer.hours}</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {c.hours.rows.map((r) => (
              <li key={r.d} className="flex items-center gap-3">
                <Clock className="size-4 opacity-70" />
                <span className="font-semibold">{r.d}</span>
                <span className="opacity-80">{r.h}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide opacity-70">
            {c.footer.contact}
          </h3>
          <a
            href={`tel:${PHONE_TEL}`}
            className="mt-4 flex items-center gap-3 text-sm font-semibold hover:underline"
          >
            <Phone className="size-4" />
            {PHONE_DISPLAY}
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-3 flex items-center gap-3 text-sm font-semibold hover:underline"
          >
            <Mail className="size-4" />
            {EMAIL}
          </a>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/buchen"
              className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
            >
              {c.footer.book}
            </Link>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-primary-foreground/30 px-5 py-2.5 text-sm font-semibold"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Serevo · Rüschlikon
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:scale-105"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
