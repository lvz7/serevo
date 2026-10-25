export type Lang = "de" | "en";

export const content = {
  de: {
    nav: {
      services: "Leistungen",
      leaves: "Laub wischen",
      prices: "Preise",
      story: "Über uns",
      contact: "Kontakt",
    },
    hero: {
      badge: "Region Zürich",
      title: "Möchten Sie, dass Ihre Kompostkübel wieder wie neu aussehen?",
      sub: "Gründliche & hygienische Reinigung direkt vor Ort in der Region Zürich.",
      cta: "Jetzt Reinigung buchen",
      secondary: "Unsere Geschichte",
      priceBadge: "ab 16.– CHF/Mt.",
    },
    benefits: {
      title: "Warum Serevo",
      items: [
        {
          t: "Gründliche Reinigung",
          d: "Hochdruck und Handarbeit, bis auch der Rand wieder sauber ist.",
        },
        {
          t: "Hygienisch sauber",
          d: "Gegen Gerüche, Keime und Maden. Mit biologisch abbaubaren Mitteln.",
        },
        {
          t: "Sauberes Auftreten",
          d: "Wir kommen pünktlich, arbeiten leise und hinterlassen keinen Schmutz.",
        },
      ],
    },
    leaves: {
      badge: "Herbst-Spezial",
      title: "Laub wischen",
      sub: "Ihr Garten, Ihre Einfahrt oder Ihr Sitzplatz voller Laub? Wir wischen es weg – schnell, gründlich und sauber.",
      points: [
        "Einfahrt, Wege & Sitzplatz",
        "Rasen und Beete von Laub befreit",
        "Laub sauber zusammengetragen",
        "Kombinierbar mit Kübelreinigung",
      ],
      priceLabel: "Preis",
      price: "Auf Anfrage",
      priceNote:
        "Je nach Fläche und Laubmenge. Schreiben Sie uns kurz – wir melden uns mit einem fairen Preis.",
      ctaWhatsapp: "Per WhatsApp anfragen",
      whatsappText: "Hallo Serevo! Ich interessiere mich für das Herbst-Spezial Laub wischen.",
    },
    pricing: {
      title: "Preise & Buchung",
      sub: "Wählen Sie Ihr Paket. Ab 16.– CHF pro Monat.",
      plans: [
        {
          id: "once",
          name: "Einmalige Reinigung",
          price: "30.–",
          note: "einmalig",
          desc: "Perfekt zum Ausprobieren.",
        },
        {
          id: "monthly",
          name: "Monats-Abo",
          price: "25.–",
          note: "pro Monat",
          desc: "Jeden Monat frisch gereinigt.",
        },
        {
          id: "sixmonth",
          name: "Halbjahres-Abo",
          price: "108.–",
          note: "alle 6 Monate · 18.–/Monat",
          desc: "Günstiger als das Monats-Abo.",
        },
        {
          id: "yearly",
          name: "Jahres-Abo",
          price: "192.–",
          note: "pro Jahr · 16.–/Monat",
          desc: "Bestes Preis-Leistungs-Verhältnis.",
        },
      ],
      tipTitle: "Trinkgeld für das Reinigungsteam",
      tipSub: "Freiwillig – kommt zu 100% dem Team zugute.",
      custom: "Eigener Betrag",
      total: "Total",
      checkout: "Sicher bezahlen",
      loading: "Weiterleitung zu Stripe…",
      secure: "Sichere Zahlung über Stripe. Danach melden wir uns für den Termin.",
      perMonth: "/Monat",
    },
    region: {
      title: "Aktuell exklusiv in der Region Zürich verfügbar.",
      sub: "Wir kommen mit Wasser und Ausrüstung zu Ihnen – Sie müssen nichts vorbereiten.",
    },
    story: {
      title: "Zwei Jungs, ein Ziel",
      body: "Wir sind 14 und 15 Jahre alt und haben Serevo gegründet, weil wir lieber anpacken als warten. Wir nehmen unseren Nachbarn eine unangenehme Arbeit ab – und sparen gleichzeitig auf unseren grossen Traum: zwei eigene Surron Light Bee. Jede Reinigung bringt uns ein Stück näher. Danke, dass Sie uns dabei unterstützen.",
      goal: "Sparziel: zwei Surron Light Bee",
    },
    footer: {
      contact: "Kontakt",
      email: "E-Mail",
      phone: "Telefon / WhatsApp",
      made: "Mit Sorgfalt gemacht in der Region Zürich",
    },
    success: {
      title: "Vielen Dank!",
      body: "Ihre Zahlung war erfolgreich. Wir melden uns innerhalb von 24 Stunden für den Termin.",
      back: "Zurück zur Startseite",
    },
    cancel: {
      title: "Zahlung abgebrochen",
      body: "Es wurde nichts belastet. Sie können die Buchung jederzeit erneut starten.",
      back: "Zurück zur Startseite",
    },
  },
  en: {
    nav: {
      services: "Services",
      leaves: "Leaf sweeping",
      prices: "Pricing",
      story: "About us",
      contact: "Contact",
    },
    hero: {
      badge: "Zurich region",
      title: "Would you like your compost bin to look like new again?",
      sub: "Thorough & hygienic cleaning directly on-site in the Zurich region.",
      cta: "Book cleaning now",
      secondary: "Our story",
      priceBadge: "from 16.– CHF/mo.",
    },
    benefits: {
      title: "Why Serevo",
      items: [
        {
          t: "Thorough cleaning",
          d: "Pressure washing plus handwork until every edge is spotless.",
        },
        {
          t: "Hygienically clean",
          d: "Against odours, germs and maggots – with biodegradable products.",
        },
        { t: "Clean appearance", d: "We arrive on time, work quietly and leave no mess behind." },
      ],
    },
    leaves: {
      badge: "Autumn special",
      title: "Leaf sweeping",
      sub: "Garden, driveway or patio covered in leaves? We sweep them away – fast, thorough and clean.",
      points: [
        "Driveway, paths & patio",
        "Lawn and flower beds cleared",
        "Leaves neatly gathered",
        "Combine with bin cleaning",
      ],
      priceLabel: "Price",
      price: "On request",
      priceNote:
        "Depends on the area and amount of leaves. Send us a quick message and we'll get back to you with a fair price.",
      ctaWhatsapp: "Ask via WhatsApp",
      whatsappText: "Hi Serevo! I'm interested in the autumn leaf sweeping special.",
    },
    pricing: {
      title: "Pricing & booking",
      sub: "Choose your package. Starting from 16.– CHF per month.",
      plans: [
        {
          id: "once",
          name: "One-time cleaning",
          price: "30.–",
          note: "one-time",
          desc: "Perfect to try us out.",
        },
        {
          id: "monthly",
          name: "Monthly plan",
          price: "25.–",
          note: "per month",
          desc: "Freshly cleaned every month.",
        },
        {
          id: "sixmonth",
          name: "6-month plan",
          price: "108.–",
          note: "every 6 months · 18.–/month",
          desc: "Cheaper than monthly.",
        },
        {
          id: "yearly",
          name: "Yearly plan",
          price: "192.–",
          note: "per year · 16.–/month",
          desc: "Best value for money.",
        },
      ],
      tipTitle: "Tip for the cleaning team",
      tipSub: "Optional – 100% goes to the team.",
      custom: "Custom amount",
      total: "Total",
      checkout: "Pay securely",
      loading: "Redirecting to Stripe…",
      secure: "Secure payment via Stripe. We'll contact you to schedule.",
      perMonth: "/month",
    },
    region: {
      title: "Currently available exclusively in the Zurich region.",
      sub: "We bring water and equipment to you – nothing to prepare.",
    },
    story: {
      title: "Two teens, one goal",
      body: "We're 14 and 15 years old and we started Serevo because we'd rather get to work than wait around. We take an unpleasant chore off our neighbours' hands – and save up for our big dream at the same time: two Surron Light Bee’s of our own. Every cleaning brings us one step closer. Thank you for supporting us.",
      goal: "Savings goal: two Surron Light Bee’s",
    },
    footer: {
      contact: "Contact",
      email: "Email",
      phone: "Phone / WhatsApp",
      made: "Made with care in the Zurich region",
    },
    success: {
      title: "Thank you!",
      body: "Your payment went through. We'll be in touch within 24 hours to schedule your cleaning.",
      back: "Back to home",
    },
    cancel: {
      title: "Payment cancelled",
      body: "Nothing was charged. You can start the booking again any time.",
      back: "Back to home",
    },
  },
} as const;

export type PlanId = "once" | "monthly" | "sixmonth" | "yearly";

export const planAmounts: Record<PlanId, number> = {
  once: 3000,
  monthly: 2500,
  sixmonth: 10800,
  yearly: 19200,
};
