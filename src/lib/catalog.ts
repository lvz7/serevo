// Single source of truth for every price on the site.
// The booking page shows these, and the server recomputes the total from them before
// creating the Stripe checkout – so what a customer selects is exactly what they pay.
// All amounts are in Rappen (1.– CHF = 100).

import type { Lang } from "@/lib/i18n";

type L = Record<Lang, string>;

export type CategoryId = "packages" | "indoor" | "outdoor";

export type Service = {
  id: string;
  category: CategoryId;
  price: number;
  name: L;
  unit: L; // shown after the price, e.g. "pro Etage"
  qtyLabel?: L; // shown next to the quantity, e.g. "Etagen"
  desc?: L;
  max: number; // highest quantity a customer can pick
  step?: number; // display multiplier for the quantity (sweeping is sold per 10 m)
  seasonal?: L;
  highlight?: L;
};

export const SERVICES: Service[] = [
  {
    id: "pkg_indoor",
    category: "packages",
    price: 3500,
    name: { de: "Paket Drinnen", en: "Indoor package" },
    unit: { de: "pro Paket", en: "per package" },
    desc: {
      de: "2 Etagen staubsaugen & Staub wischen, 2 Badezimmer, 3 Betten, 7 Fenster, 4 Abfalleimer",
      en: "Hoover & dust 2 floors, 2 bathrooms, 3 beds, 7 windows, 4 bins",
    },
    max: 1,
    highlight: { de: "Spart über 10.–", en: "Save over 10.–" },
  },
  {
    id: "pkg_outdoor",
    category: "packages",
    price: 2800,
    name: { de: "Paket Draussen", en: "Outdoor package" },
    unit: { de: "pro Paket", en: "per package" },
    desc: {
      de: "Jäten, 10 m wischen, einfacher Heckenschnitt, Zaun & Gartenmöbel abwischen",
      en: "Weeding, 10 m sweeping, basic hedge trim, fence & furniture wipe",
    },
    max: 1,
  },

  // Indoor
  {
    id: "vacuum",
    category: "indoor",
    price: 500,
    name: { de: "Staubsaugen", en: "Hoovering" },
    unit: { de: "pro Etage", en: "per floor" },
    qtyLabel: { de: "Etagen", en: "floors" },
    max: 5,
  },
  {
    id: "bathroom",
    category: "indoor",
    price: 400,
    name: { de: "Badezimmer", en: "Bathroom" },
    unit: { de: "pro Bad", en: "per bathroom" },
    qtyLabel: { de: "Bäder", en: "bathrooms" },
    max: 5,
  },
  {
    id: "dusting",
    category: "indoor",
    price: 250,
    name: { de: "Staub wischen", en: "Dusting" },
    unit: { de: "pro Etage", en: "per floor" },
    qtyLabel: { de: "Etagen", en: "floors" },
    max: 5,
  },
  {
    id: "beds",
    category: "indoor",
    price: 300,
    name: { de: "Betten machen & Bettwäsche", en: "Sheets & bed making" },
    unit: { de: "pro Bett", en: "per bed" },
    qtyLabel: { de: "Betten", en: "beds" },
    max: 10,
  },
  {
    id: "windows",
    category: "indoor",
    price: 100,
    name: { de: "Fenster putzen", en: "Window cleaning" },
    unit: { de: "pro Fenster", en: "per window" },
    qtyLabel: { de: "Fenster", en: "windows" },
    max: 40,
  },
  {
    id: "bins_indoor",
    category: "indoor",
    price: 200,
    name: { de: "Abfalleimer reinigen", en: "Bin cleaning (indoor)" },
    unit: { de: "pro Eimer", en: "per bin" },
    qtyLabel: { de: "Eimer", en: "bins" },
    max: 10,
  },
  {
    id: "oven",
    category: "indoor",
    price: 600,
    name: { de: "Backofen reinigen", en: "Oven cleaning" },
    unit: { de: "pro Ofen", en: "per oven" },
    qtyLabel: { de: "Öfen", en: "ovens" },
    max: 3,
  },

  // Outdoor
  {
    id: "sweep",
    category: "outdoor",
    price: 500,
    name: { de: "Laub wischen", en: "Leaf sweeping" },
    unit: { de: "pro 10 m", en: "per 10 m" },
    qtyLabel: { de: "m", en: "m" },
    step: 10,
    max: 20,
    highlight: { de: "Herbst-Spezial", en: "Autumn special" },
  },
  {
    id: "weeding",
    category: "outdoor",
    price: 900,
    name: { de: "Jäten", en: "Weeding" },
    unit: { de: "pauschal", en: "flat rate" },
    max: 1,
  },
  {
    id: "hedge",
    category: "outdoor",
    price: 700,
    name: { de: "Einfacher Heckenschnitt", en: "Basic hedge trim" },
    unit: { de: "pauschal", en: "flat rate" },
    max: 1,
  },
  {
    id: "fence",
    category: "outdoor",
    price: 600,
    name: { de: "Zaun & Gartenmöbel abwischen", en: "Fence & furniture wipe" },
    unit: { de: "pauschal", en: "flat rate" },
    max: 1,
  },
  {
    id: "snow",
    category: "outdoor",
    price: 500,
    name: { de: "Schnee schaufeln", en: "Snow shoveling" },
    unit: { de: "pro 10 m", en: "per 10 m" },
    qtyLabel: { de: "m", en: "m" },
    step: 10,
    max: 20,
    seasonal: { de: "Winter", en: "Winter" },
  },
];

// Komposttonne pressure washing: once, or as a plan.
export type BinPlanId = "once" | "monthly" | "sixmonth" | "yearly";

export type BinPlan = {
  id: BinPlanId;
  price: number;
  name: L;
  note: L;
  recurring?: { interval: "month" | "year"; count: number };
  perMonth?: number;
};

export const BIN_PLANS: BinPlan[] = [
  {
    id: "once",
    price: 3000,
    name: { de: "Einmalig", en: "One-time" },
    note: { de: "einmalig pro Tonne", en: "one-time per bin" },
  },
  {
    id: "monthly",
    price: 2000,
    name: { de: "Monats-Abo", en: "Monthly plan" },
    note: { de: "pro Monat und Tonne", en: "per month and bin" },
    recurring: { interval: "month", count: 1 },
    perMonth: 2000,
  },
  {
    id: "sixmonth",
    price: 10800,
    name: { de: "Halbjahres-Abo", en: "6-month plan" },
    note: { de: "alle 6 Monate · 18.–/Monat", en: "every 6 months · 18.–/month" },
    recurring: { interval: "month", count: 6 },
    perMonth: 1800,
  },
  {
    id: "yearly",
    price: 19200,
    name: { de: "Jahres-Abo", en: "Yearly plan" },
    note: { de: "pro Jahr · 16.–/Monat", en: "per year · 16.–/month" },
    recurring: { interval: "year", count: 1 },
    perMonth: 1600,
  },
];

export const BIN_NAME: L = {
  de: "Komposttonne Hochdruckreinigung",
  en: "Compost bin pressure wash",
};
export const BIN_MAX = 5;

export const CATEGORIES: { id: CategoryId; name: L }[] = [
  { id: "packages", name: { de: "Pakete", en: "Packages" } },
  { id: "indoor", name: { de: "Drinnen", en: "Indoor" } },
  { id: "outdoor", name: { de: "Draussen", en: "Outdoor" } },
];

export const TIP_MAX = 10000;

// ---------- order maths (used by both the page and the server) ----------

export type Order = {
  items: Record<string, number>; // service id -> quantity
  bin?: { plan: BinPlanId; qty: number } | null | undefined;
  tip?: number | undefined;
};

export type Line = {
  key: string;
  name: string;
  qty: number;
  qtyText: string;
  unitAmount: number;
  amount: number;
  recurring?: BinPlan["recurring"] | undefined;
};

export const serviceById = new Map(SERVICES.map((s) => [s.id, s]));
export const binPlanById = new Map(BIN_PLANS.map((p) => [p.id, p]));

export function qtyText(s: Service, qty: number, lang: Lang) {
  if (s.step) return `${qty * s.step} ${s.qtyLabel?.[lang] ?? ""}`.trim();
  if (s.max === 1) return "";
  return `${qty} ${s.qtyLabel?.[lang] ?? ""}`.trim();
}

/** Turns a raw order into priced lines. Unknown ids and out-of-range quantities are dropped. */
export function priceOrder(order: Order, lang: Lang): Line[] {
  const lines: Line[] = [];
  for (const s of SERVICES) {
    const raw = order.items[s.id] ?? 0;
    const qty = Math.min(Math.max(0, Math.floor(raw)), s.max);
    if (qty <= 0) continue;
    lines.push({
      key: s.id,
      name: s.name[lang],
      qty,
      qtyText: qtyText(s, qty, lang),
      unitAmount: s.price,
      amount: s.price * qty,
    });
  }
  if (order.bin) {
    const plan = binPlanById.get(order.bin.plan);
    const qty = Math.min(Math.max(0, Math.floor(order.bin.qty)), BIN_MAX);
    if (plan && qty > 0) {
      lines.push({
        key: `bin_${plan.id}`,
        name: `${BIN_NAME[lang]} – ${plan.name[lang]}`,
        qty,
        qtyText:
          lang === "de"
            ? `${qty} ${qty === 1 ? "Tonne" : "Tonnen"}`
            : `${qty} ${qty === 1 ? "bin" : "bins"}`,
        unitAmount: plan.price,
        amount: plan.price * qty,
        recurring: plan.recurring,
      });
    }
  }
  return lines;
}

export function totals(lines: Line[], tip = 0) {
  const recurring = lines.filter((l) => l.recurring);
  const oneTime = lines.filter((l) => !l.recurring);
  const oneTimeSum = oneTime.reduce((a, l) => a + l.amount, 0);
  const recurringSum = recurring.reduce((a, l) => a + l.amount, 0);
  const tipSafe = Math.min(Math.max(0, Math.round(tip)), TIP_MAX);
  return {
    oneTimeSum,
    recurringSum,
    recurring: recurring[0]?.recurring,
    tip: tipSafe,
    dueToday: oneTimeSum + recurringSum + tipSafe,
  };
}

export function chf(rappen: number) {
  const fr = Math.floor(rappen / 100);
  const rp = rappen % 100;
  return rp === 0 ? `${fr}.–` : `${fr}.${String(rp).padStart(2, "0")}`;
}

export function intervalLabel(r: BinPlan["recurring"] | undefined, lang: Lang) {
  if (!r) return "";
  if (r.interval === "year") return lang === "de" ? "pro Jahr" : "per year";
  if (r.count === 6) return lang === "de" ? "alle 6 Monate" : "every 6 months";
  return lang === "de" ? "pro Monat" : "per month";
}
