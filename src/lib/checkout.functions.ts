import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { bookingSchema, formatDate, isValidSlot, type BookingInput } from "@/lib/booking";
import {
  BIN_NAME,
  binPlanById,
  priceOrder,
  serviceById,
  totals,
  type BinPlanId,
} from "@/lib/catalog";
import { bookingText, itemsShort } from "@/lib/summary";

const STRIPE_VERSION = "2024-06-20";

const MESSAGES = {
  de: {
    notConfigured:
      "Online-Zahlung ist gerade nicht verfügbar. Wählen Sie «Bar vor Ort» oder kontaktieren Sie uns per WhatsApp.",
    unreachable:
      "Stripe ist gerade nicht erreichbar. Bitte versuchen Sie es in einer Minute nochmals.",
    generic: "Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es nochmals.",
    empty: "Bitte wählen Sie mindestens eine Leistung.",
    slot: "Dieser Termin ist nicht mehr verfügbar. Bitte wählen Sie einen anderen.",
  },
  en: {
    notConfigured:
      "Online payment is unavailable right now. Choose “Cash on site” or contact us via WhatsApp.",
    unreachable: "Stripe can't be reached right now. Please try again in a minute.",
    generic: "The payment couldn't be started. Please try again.",
    empty: "Please choose at least one service.",
    slot: "This time slot is no longer available. Please pick another one.",
  },
} as const;

type MsgKey = keyof (typeof MESSAGES)["de"];
const msg = (lang: "de" | "en", k: MsgKey) => MESSAGES[lang][k];

function stripeKey() {
  const key = process.env["STRIPE_SECRET_KEY"]?.trim();
  if (!key) {
    console.error("[checkout] STRIPE_SECRET_KEY is missing in this environment");
    return null;
  }
  if (!/^(sk|rk)_(test|live)_/.test(key)) {
    console.error("[checkout] STRIPE_SECRET_KEY must start with sk_live_ or sk_test_");
    return null;
  }
  return key;
}

function checkBooking(data: BookingInput) {
  const lines = priceOrder(data.order, data.lang);
  if (lines.length === 0) throw new Error(msg(data.lang, "empty"));
  if (!isValidSlot(data.date, data.time)) throw new Error(msg(data.lang, "slot"));
  return lines;
}

// ---------- e-mail (optional, via Resend) ----------

async function sendBookingEmail(subject: string, text: string, replyTo?: string) {
  const key = process.env["RESEND_API_KEY"]?.trim();
  if (!key) return false;
  const to = process.env["BOOKING_NOTIFY_EMAIL"]?.trim() || "serevo.services@gmail.com";
  const from =
    process.env["BOOKING_FROM_EMAIL"]?.trim() || "Serevo Buchungen <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text, reply_to: replyTo }),
    });
    if (!res.ok) {
      console.error("[booking] e-mail failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[booking] e-mail failed", err);
    return false;
  }
}

function subjectFor(b: BookingInput, payment: "online" | "cash") {
  const when = `${formatDate(b.date, "de", "short")} ${b.time}`;
  return `Buchung ${when} – ${b.contact.name} (${payment === "online" ? "bezahlt online" : "bar"})`;
}

// ---------- cash booking ----------

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    checkBooking(data);
    const sent = await sendBookingEmail(
      subjectFor(data, "cash"),
      bookingText(data, "cash"),
      data.contact.email,
    );
    return { emailed: sent };
  });

// ---------- online payment ----------

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    const lines = checkBooking(data);
    const key = stripeKey();
    if (!key) throw new Error(msg(data.lang, "notConfigured"));

    const t = totals(lines, data.order.tip ?? 0);
    const mode = t.recurring ? "subscription" : "payment";
    const c = data.contact;

    const params: Record<string, string> = {
      mode,
      locale: data.lang,
      customer_email: c.email,
      billing_address_collection: "auto",
      success_url: `${data.origin}/success?lang=${data.lang}&type=online&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}/buchen?lang=${data.lang}&cancelled=1`,
    };

    let i = 0;
    for (const l of lines) {
      const p = `line_items[${i}]`;
      const svc = serviceById.get(l.key);
      const plan = l.key.startsWith("bin_")
        ? binPlanById.get(l.key.slice(4) as BinPlanId)
        : undefined;
      const unit = svc ? svc.unit[data.lang] : plan ? plan.note[data.lang] : "";
      params[`${p}[quantity]`] = String(l.qty);
      params[`${p}[price_data][currency]`] = "chf";
      params[`${p}[price_data][unit_amount]`] = String(l.unitAmount);
      params[`${p}[price_data][product_data][name]`] = plan
        ? `${BIN_NAME[data.lang]} – ${plan.name[data.lang]}`
        : l.name;
      if (unit) params[`${p}[price_data][product_data][description]`] = unit;
      if (l.recurring) {
        params[`${p}[price_data][recurring][interval]`] = l.recurring.interval;
        params[`${p}[price_data][recurring][interval_count]`] = String(l.recurring.count);
      }
      i++;
    }
    if (t.tip > 0) {
      // One-time; in subscription mode Stripe adds it to the first invoice only.
      params[`line_items[${i}][quantity]`] = "1";
      params[`line_items[${i}][price_data][currency]`] = "chf";
      params[`line_items[${i}][price_data][unit_amount]`] = String(t.tip);
      params[`line_items[${i}][price_data][product_data][name]`] =
        data.lang === "de" ? "Trinkgeld für das Team" : "Tip for the team";
    }

    // Booking details travel with the payment, so they show up in the Stripe dashboard.
    const meta: Record<string, string> = {
      termin: `${data.date} ${data.time}`,
      name: c.name,
      telefon: c.phone,
      email: c.email,
      adresse: `${c.street}, ${c.zip} ${c.city}`,
      leistungen: itemsShort(data),
      bemerkungen: c.notes ?? "",
      sprache: data.lang,
    };
    const description = `Serevo ${formatDate(data.date, "de", "short")} ${data.time} – ${c.street}, ${c.zip} ${c.city}`;
    const target = mode === "payment" ? "payment_intent_data" : "subscription_data";
    params[`${target}[description]`] = description.slice(0, 500);
    for (const [k, v] of Object.entries(meta)) {
      const val = v.slice(0, 500);
      params[`metadata[${k}]`] = val;
      params[`${target}[metadata][${k}]`] = val;
    }

    let res: Response;
    try {
      res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version": STRIPE_VERSION,
        },
        body: new URLSearchParams(params).toString(),
      });
    } catch (err) {
      console.error("[checkout] could not reach Stripe", err);
      throw new Error(msg(data.lang, "unreachable"));
    }

    let json: { url?: string; error?: { message?: string; code?: string; param?: string } } = {};
    try {
      json = (await res.json()) as typeof json;
    } catch {
      // handled below
    }
    if (!res.ok || !json.url) {
      const e = json.error;
      console.error(
        "[checkout] Stripe rejected the session",
        res.status,
        e?.code,
        e?.param,
        e?.message,
      );
      if (res.status === 401) throw new Error(msg(data.lang, "notConfigured"));
      throw new Error(e?.message ?? msg(data.lang, "generic"));
    }
    return { url: json.url };
  });

// ---------- after a successful online payment ----------

// Called once from the thank-you page: checks with Stripe that the session is really paid
// and e-mails the booking (if RESEND_API_KEY is set).
export const confirmOnlineBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ sessionId: z.string().regex(/^cs_[A-Za-z0-9_]+$/) }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = stripeKey();
    if (!key) return { paid: false, emailed: false };
    try {
      const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${data.sessionId}`, {
        headers: { Authorization: `Bearer ${key}`, "Stripe-Version": STRIPE_VERSION },
      });
      const s = (await res.json()) as {
        status?: string;
        payment_status?: string;
        amount_total?: number;
        metadata?: Record<string, string>;
      };
      const paid =
        s.status === "complete" &&
        (s.payment_status === "paid" || s.payment_status === "no_payment_required");
      if (!paid || !s.metadata) return { paid, emailed: false };
      const m = s.metadata;
      const text = [
        "Neue Online-Buchung – Serevo (bezahlt)",
        "",
        `Termin: ${m["termin"]}`,
        `Name: ${m["name"]}`,
        `Telefon: ${m["telefon"]}`,
        `E-Mail: ${m["email"]}`,
        `Adresse: ${m["adresse"]}`,
        `Leistungen: ${m["leistungen"]}`,
        `Bezahlt: ${((s.amount_total ?? 0) / 100).toFixed(2)} CHF`,
        m["bemerkungen"] ? `Bemerkungen: ${m["bemerkungen"]}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      const emailed = await sendBookingEmail(
        `Buchung ${m["termin"]} – ${m["name"]} (bezahlt online)`,
        text,
        m["email"],
      );
      return { paid, emailed };
    } catch (err) {
      console.error("[checkout] could not confirm session", err);
      return { paid: false, emailed: false };
    }
  });
