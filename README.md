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

## Stripe

- The packages and their Stripe price IDs are in `src/lib/checkout.functions.ts`.
- The prices shown on the page are in `src/lib/i18n.ts` (`plans`) and `planAmounts` – keep them the same as in Stripe.
- The secret key and the price IDs must be from the same mode: a live key (`sk_live_…`) only works with live prices, a test key (`sk_test_…`) only with test prices.
- If a checkout fails, the page shows a short message and the real Stripe error appears in the server logs (Vercel: **Logs** tab).

## Where things are

| What | File |
| --- | --- |
| Page layout and sections | `src/routes/index.tsx` |
| All texts (German / English) | `src/lib/i18n.ts` |
| Colours and fonts | `src/styles.css` |
| Ad video, logo, favicon | `public/` |
| Thank-you / cancelled pages | `src/routes/success.tsx`, `src/routes/cancel.tsx` |
