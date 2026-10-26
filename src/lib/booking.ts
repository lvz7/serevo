// Opening days and time slots (from the flyers):
// Wednesday 13:00–20:00, Saturday & Sunday 8:00–20:00.
import { z } from "zod";
import type { Lang } from "@/lib/i18n";

export const SLOTS: Record<number, string[]> = {
  3: ["13:00", "15:00", "17:00"], // Wednesday
  6: ["08:00", "10:00", "13:00", "15:00", "17:00"], // Saturday
  0: ["08:00", "10:00", "13:00", "15:00", "17:00"], // Sunday
};

export const BOOKING_DAYS_AHEAD = 42;

/** Today's date in Zurich as YYYY-MM-DD. */
export function todayZurich(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(now);
}

function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekday(iso: string) {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

/** Bookable days: from tomorrow, only Wed/Sat/Sun, within the window. */
export function availableDates(now = new Date()) {
  const today = todayZurich(now);
  const out: string[] = [];
  for (let i = 1; i <= BOOKING_DAYS_AHEAD; i++) {
    const d = addDays(today, i);
    if (SLOTS[weekday(d)]) out.push(d);
  }
  return out;
}

export function isValidSlot(date: string, time: string, now = new Date()) {
  return availableDates(now).includes(date) && (SLOTS[weekday(date)] ?? []).includes(time);
}

export function formatDate(iso: string, lang: Lang, style: "short" | "long" = "long") {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(lang === "de" ? "de-CH" : "en-GB", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
  }).format(d);
}

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(25)
    .regex(/^[+0-9 ()/-]+$/),
  email: z.string().trim().email().max(120),
  street: z.string().trim().min(3).max(100),
  zip: z
    .string()
    .trim()
    .regex(/^\d{4}$/),
  city: z.string().trim().min(2).max(60),
  notes: z.string().trim().max(500).optional().default(""),
});

export type Contact = z.infer<typeof contactSchema>;

export const orderSchema = z.object({
  items: z.record(z.string().max(30), z.number().int().min(0).max(100)),
  bin: z
    .object({
      plan: z.enum(["once", "monthly", "sixmonth", "yearly"]),
      qty: z.number().int().min(0).max(10),
    })
    .nullable()
    .optional(),
  tip: z.number().int().min(0).max(100000).optional(),
});

export const bookingSchema = z.object({
  order: orderSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  contact: contactSchema,
  lang: z.enum(["de", "en"]),
  origin: z.string().url(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
