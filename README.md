# The Stan Co.

Vite storefront for The Stan Co. Run `pnpm install` and `pnpm dev` locally. Run `pnpm build` to create the static site in `dist`.

## Maintaining this preview

- The product list is in `src/shop.js`. The Forest green and Black tee photos and the pendant photo are the images supplied by The Stan Co. The pendant's ordering status depends on confirmed pricing and stock.
- The Rebel tee price and sizes are examples. Replace them with the approved price, measurements and stock by colour/size before opening orders. The current sizes do not represent inventory.
- Main sections can be shared with `/#upcoming` and `/#oct23ed`. Product links are `/#product/rebel-classic` and `/#product/king-of-the-sea`.
- Contact and drop-update forms prepare an email draft for the customer to send. Use a consent-aware mailing service for automated subscriptions, code emails, launch alerts and unsubscribes.
- The product PIN checker gives a timing estimate from dispatch PIN 500075. Add a carrier serviceability check before accepting orders.

## Firebase and live orders

The storefront uses the `motionbeatz-new` Firebase web app. Enable Google and Email Link sign-in under Firebase Authentication, and add `thestanco.vercel.app` and any future customer domain to Authorized domains. Google Analytics loads after visitors opt in through Analytics preferences.

Checkout demonstrates the guest flow, free India shipping, the 10% first-purchase offer and a printable sample receipt. Live operation needs server-side orders, stock and eligibility checks, a verified prepaid UPI payment workflow, and an authenticated admin for catalog and fulfilment. Transactional emails and order tracking depend on those services. Upload the confirmed invoice template before replacing the sample receipt.
