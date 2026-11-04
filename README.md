# Forma Living — "Shape Your Space."
React + TypeScript + Vite + Tailwind + Firebase (Auth, Firestore, Storage, Functions) + Razorpay.

**Status: working foundation (MVP), not the full spec.** Dependencies were NOT installed and the build was NOT run when this zip was made (no network in the build sandbox). Run the steps below first and fix any compile errors.

## Run locally
1. `npm install`, then `cd functions && npm install && cd ..`
2. `cp .env.example .env` and fill the Firebase web-app values (Firebase console, Project settings).
3. `npm run dev` / `npm run build`

## Firebase setup
Enable Email/Password auth, Firestore and Storage (Blaze plan needed for Functions). Deploy with `firebase deploy --only firestore,storage,functions`.
Seed `products` in Firestore from `src/data/products.ts` (sample data), then switch the UI to read from Firestore.
Admin: set custom claim `{admin:true}` on a user via the Admin SDK; rules and the /admin route check it.

## Razorpay (test mode)
Set secrets: `firebase functions:secrets:set RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. Deploy, then add the `razorpayWebhook` URL in the Razorpay dashboard (event `payment.captured`). Prices are recomputed server-side, signatures verified server-side, orders marked paid only after verification, processing is idempotent. Untested without credentials.

## Implemented
Home, shop (search, category, sort, in-stock filter), product page, cart and wishlist (local plus Firestore sync), email/password auth with verification and reset, claim-protected admin route, Firestore and Storage rules, Cloud Functions for order creation, payment verification and webhook.

## Still to build
Category landing pages with photos, remaining homepage sections, image gallery/zoom, reviews, room/style/colour/material filters, address book, coupons, invoices, order tracking, customer dashboard, full admin dashboard, mood boards, dimension visualizer, decor matcher, makeover estimator, shopping assistant, tests, product images (`public/images/<product-id>.jpg`). Visual reference: `docs/reference-screenshot.jpg`.
