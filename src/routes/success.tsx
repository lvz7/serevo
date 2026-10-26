import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { confirmOnlineBooking } from "@/lib/checkout.functions";
import { content, type Lang } from "@/lib/i18n";

type Search = { lang: Lang; type: "online" | "cash"; session_id?: string | undefined };

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [{ title: "Danke für Ihre Buchung – Serevo" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    lang: s["lang"] === "en" ? "en" : "de",
    type: s["type"] === "cash" ? "cash" : "online",
    session_id: typeof s["session_id"] === "string" ? s["session_id"] : undefined,
  }),
  component: Success,
});

function Success() {
  const { lang, type, session_id } = Route.useSearch();
  const t = content[lang].success;
  const confirm = useServerFn(confirmOnlineBooking);

  useEffect(() => {
    try {
      window.sessionStorage.removeItem("serevo-booking");
    } catch {
      // ignore
    }
    if (type !== "online" || !session_id) return;
    // only once per payment, even if the page is reloaded
    const key = `serevo-confirmed-${session_id}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // ignore
    }
    void confirm({ data: { sessionId: session_id } }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5 text-center">
      <div className="max-w-md">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h1 className="mt-6 text-4xl text-foreground">{type === "cash" ? t.cashTitle : t.title}</h1>
        <p className="mt-3 text-muted-foreground">{type === "cash" ? t.cashBody : t.body}</p>
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
