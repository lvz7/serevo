import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { content, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/cancel")({
  head: () => ({
    meta: [
      { title: "Zahlung abgebrochen – Serevo" },
      { name: "description", content: "Die Zahlung wurde abgebrochen. Sie können die Buchung jederzeit erneut starten." },
      { property: "og:title", content: "Zahlung abgebrochen – Serevo" },
      { property: "og:description", content: "Keine Belastung erfolgt – Buchung jederzeit erneut möglich." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { lang: Lang } => ({
    lang: s["lang"] === "en" ? "en" : "de",
  }),
  component: Cancel,
});

function Cancel() {
  const { lang } = Route.useSearch();
  const t = content[lang].cancel;
  return (
    <div className="grid min-h-screen place-items-center bg-background px-5 text-center">
      <div className="max-w-md">
        <XCircle className="mx-auto size-14 text-muted-foreground" />
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
