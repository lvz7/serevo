# Serevo – Website

Website for Serevo Cleaning Services (Rüschlikon / Region Zürich): bin cleaning, the autumn leaf-sweeping special, Stripe checkout, German and English.

Built with React, TanStack Start, Tailwind CSS and Vite. Payments go through Stripe Checkout.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```sh
npm install
cp .env.example .env     # then put your Stripe secret key in .env
npm run dev              # http://localhost:5173
```

## Put it online (Vercel, free)

1. Go to [vercel.com](https://vercel.com), sign in with GitHub and click **Add New → Project**.
2. Pick the `lvz7/serevo` repo. Vercel detects everything automatically – just click **Deploy**.
3. In the project, open **Settings → Environment Variables** and add
   `STRIPE_SECRET_KEY` = your secret key from Stripe (Dashboard → Developers → API keys).
   Then go to **Deployments** and click **Redeploy** so the key is used.
4. To use your own domain, open **Settings → Domains**, add `serevo-services.com` and
   `www.serevo-services.com`, and set the DNS records Vercel shows you at your domain provider.

Every push to `main` deploys automatically after that.

Netlify and Cloudflare also work without changes. On any other server: `npm run build`, then `npm start`.

## Prices, Stripe and bookings

- **All prices live in one file: `src/lib/catalog.ts`.** Change a price there and the price list,
  the booking page and the Stripe checkout all update together. The server recalculates the total
  from this file, so nobody can change the price in their browser.
- Stripe products are **not** needed – each checkout is created with exactly the services,
  quantities and tip the customer picked. A Komposttonne plan becomes a Stripe subscription.
- Every online payment carries the booking (date, time, address, phone, services, notes) in its
  **metadata** – open the payment in the Stripe dashboard to see it.
- Opening days and time slots are in `src/lib/booking.ts` (`SLOTS`).

### Booking e-mails (optional, free)

Without this, cash bookings ask the customer to send the booking via WhatsApp or e-mail
(the message is pre-written). To get every booking straight to your inbox instead:

1. Create a free account at [resend.com](https://resend.com) **with serevo.services@gmail.com**.
2. Create an API key and add it on Vercel as `RESEND_API_KEY`, then redeploy.

You then get an e-mail for every cash booking and for every paid online booking.

### Environment variables

| Name | Required | What |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | for online payment | `sk_live_…` from Stripe → Developers → API keys |
| `RESEND_API_KEY` | optional | booking e-mails (see above) |
| `BOOKING_NOTIFY_EMAIL` | optional | where booking e-mails go (default serevo.services@gmail.com) |
| `BOOKING_FROM_EMAIL` | optional | sender, once you verify your own domain in Resend |

## Where things are

| What | File |
| --- | --- |
| Homepage | `src/routes/index.tsx` |
| Booking page | `src/routes/buchen.tsx` |
| Prices | `src/lib/catalog.ts` |
| Header & footer | `src/components/site.tsx` |
| All texts (German / English) | `src/lib/i18n.ts` |
| Colours and fonts | `src/styles.css` |
| Ad video, logo, favicon | `public/` |
| Thank-you / cancelled pages | `src/routes/success.tsx`, `src/routes/cancel.tsx` |
