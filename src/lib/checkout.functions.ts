import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["once", "monthly", "sixmonth", "yearly"]),
  tip: z.number().int().min(0).max(100000),
  origin: z.string().url(),
  lang: z.enum(["de", "en"]),
});

type PlanConfig = {
  price: string;
  mode: "payment" | "subscription";
  interval?: "month" | "year";
  intervalCount?: number;
};

const PLANS: Record<string, PlanConfig> = {
  once: { price: "price_1U6EOx2MoWzQ2xTgijwozpHe", mode: "payment" },
  monthly: {
    price: "price_1U6EQe2MoWzQ2xTgrMIqaF2X",
    mode: "subscription",
    interval: "month",
    intervalCount: 1,
  },
  sixmonth: {
    price: "price_1U6ERi2MoWzQ2xTgkH2kL9KY",
    mode: "subscription",
    interval: "month",
    intervalCount: 6,
  },
  yearly: {
    price: "price_1U6ESc2MoWzQ2xTg4Yy3VH87",
    mode: "subscription",
    interval: "year",
    intervalCount: 1,
  },
};

const MESSAGES = {
  de: {
    notConfigured:
      "Online-Zahlung ist gerade nicht verfügbar. Bitte kontaktieren Sie uns per WhatsApp oder Telefon.",
    unreachable:
      "Stripe ist gerade nicht erreichbar. Bitte versuchen Sie es in einer Minute nochmals.",
    priceMissing:
      "Dieses Paket ist bei Stripe nicht eingerichtet. Bitte kontaktieren Sie uns per WhatsApp oder Telefon.",
    generic: "Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es nochmals.",
  },
  en: {
    notConfigured:
      "Online payment is unavailable right now. Please contact us via WhatsApp or phone.",
    unreachable: "Stripe can't be reached right now. Please try again in a minute.",
    priceMissing: "This package isn't set up in Stripe. Please contact us via WhatsApp or phone.",
    generic: "The payment couldn't be started. Please try again.",
  },
} as const;

function msg(lang: "de" | "en", k: keyof (typeof MESSAGES)["de"]) {
  return MESSAGES[lang][k];
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["STRIPE_SECRET_KEY"]?.trim();
    if (!key) {
      console.error("[checkout] STRIPE_SECRET_KEY is missing in this environment");
      throw new Error(msg(data.lang, "notConfigured"));
    }
    if (!/^(sk|rk)_(test|live)_/.test(key)) {
      console.error(
        "[checkout] STRIPE_SECRET_KEY does not look like a Stripe secret key (must start with sk_live_ or sk_test_)",
      );
      throw new Error(msg(data.lang, "notConfigured"));
    }

    const plan = PLANS[data.plan]!;
    const params: Record<string, string> = {
      mode: plan.mode,
      success_url: `${data.origin}/success?lang=${data.lang}`,
      cancel_url: `${data.origin}/cancel?lang=${data.lang}`,
      locale: data.lang,
      "line_items[0][price]": plan.price,
      "line_items[0][quantity]": "1",
      billing_address_collection: "required",
    };
    if (plan.mode === "payment") params["phone_number_collection[enabled]"] = "true";

    if (data.tip > 0) {
      // The tip is always a one-time charge. In subscription mode Stripe adds one-time
      // line items to the first invoice only. Making it recurring (as before) required its
      // interval to match the plan's Stripe price exactly, and any mismatch made Stripe
      // reject the whole checkout ("different billing intervals").
      params["line_items[1][quantity]"] = "1";
      params["line_items[1][price_data][currency]"] = "chf";
      params["line_items[1][price_data][unit_amount]"] = String(data.tip);
      params["line_items[1][price_data][product_data][name]"] =
        data.lang === "de" ? "Trinkgeld für das Team" : "Tip for the team";
    }

    let res: Response;
    try {
      res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version": "2024-06-20",
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
      // non-JSON response, handled below
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
      if (e?.code === "resource_missing" && e.param?.includes("price")) {
        // Price IDs belong to either test or live mode. Using live price IDs with a
        // test key (or the other way round) produces exactly this error.
        throw new Error(msg(data.lang, "priceMissing"));
      }
      if (res.status === 401) throw new Error(msg(data.lang, "notConfigured"));
      throw new Error(e?.message ?? msg(data.lang, "generic"));
    }
    return { url: json.url };
  });
