import { chf, intervalLabel, priceOrder, totals, type Line } from "@/lib/catalog";
import { formatDate, type BookingInput } from "@/lib/booking";

export function lineText(l: Line) {
  const q = l.qtyText ? ` (${l.qtyText})` : "";
  return `${l.name}${q}: ${chf(l.amount)}`;
}

/** Plain-text summary of a booking – used for e-mails, WhatsApp and Stripe. */
export function bookingText(b: BookingInput, payment: "online" | "cash") {
  const de = b.lang === "de";
  const lines = priceOrder(b.order, b.lang);
  const t = totals(lines, payment === "online" ? (b.order.tip ?? 0) : 0);
  const c = b.contact;
  const out = [
    de ? "Neue Buchung – Serevo" : "New booking – Serevo",
    "",
    `${de ? "Termin" : "Date"}: ${formatDate(b.date, b.lang)}, ${b.time}`,
    `${de ? "Name" : "Name"}: ${c.name}`,
    `${de ? "Telefon" : "Phone"}: ${c.phone}`,
    `E-Mail: ${c.email}`,
    `${de ? "Adresse" : "Address"}: ${c.street}, ${c.zip} ${c.city}`,
    "",
    de ? "Leistungen:" : "Services:",
    ...lines.map(
      (l) => `• ${lineText(l)}${l.recurring ? ` ${intervalLabel(l.recurring, b.lang)}` : ""}`,
    ),
  ];
  if (t.tip > 0) out.push(`• ${de ? "Trinkgeld" : "Tip"}: ${chf(t.tip)}`);
  out.push(
    "",
    `Total: ${chf(t.dueToday)} CHF`,
    `${de ? "Zahlung" : "Payment"}: ${payment === "online" ? (de ? "online (Stripe)" : "online (Stripe)") : de ? "bar vor Ort" : "cash on site"}`,
  );
  if (c.notes) out.push("", `${de ? "Bemerkungen" : "Notes"}: ${c.notes}`);
  return out.join("\n");
}

export function itemsShort(b: BookingInput) {
  return priceOrder(b.order, b.lang)
    .map((l) => `${l.name}${l.qtyText ? ` ${l.qtyText}` : ""}`)
    .join(", ");
}
