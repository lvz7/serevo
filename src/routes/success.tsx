import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { content, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: "Danke für Ihre Buchung – Serevo" },
      { name: "description", content: "Ihre Kübelreinigung ist gebucht. Wir melden uns innerhalb von 24 Stunden." },
      { property: "og:title", content: "Danke für Ihre Buchung – Serevo" },
      { property: "og:description", content: "Ihre Kübelreinigung in der Region Zürich ist bestätigt." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { lang: Lang } => ({
    lang: s["lang"] === "en" ? "en" : "de",
  }),
  component: Success,
});

function Success() {
  const { lang } = Route.useSearch();
  const t = content[lang].success;
  return (
    <div className="grid min-h-screen place-items-center bg-background px-5 text-center">
      <div className="max-w-md">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h1 className="mt-6 text-3xl font-extrabold text-foreground">{t.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.body}</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {t.back}
        </Link>
      </div>
    </div>
  );
}
