# AB Groceries — Web App

React + Vite + Tailwind CSS web version of AB Groceries, using the same Firebase backend as the Android app.

---

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

---

## Setup (required before running)

### 1 — Firebase config
Open `src/firebase.js` and replace the placeholder values with your project's config from **Firebase Console → Project Settings → Your apps → Web app → SDK setup**.

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 2 — Enable Firebase Phone Auth
Firebase Console → Authentication → Sign-in method → Phone → Enable.
Add your domain (e.g. `localhost`) to the **Authorised domains** list.

### 3 — Razorpay key
Open `src/config/PaymentConfig.js` and replace the key:
```js
export const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_HERE'
```
Use `rzp_test_` for testing, `rzp_live_` before going live.

---

## Features

| Screen | Description |
|---|---|
| Login | Firebase Phone OTP auth |
| Home | Product grid with category filter & search |
| Cart | Quantity controls, bill summary, free delivery threshold |
| Wishlist | Save products for later |
| Checkout | Address selection, serviceability check, Razorpay payment |
| Orders | Full order history from Firestore |
| Order Tracking | Timeline view per order |
| Profile | Stats, account info, nav to all sections |
| Addresses | Add / delete saved addresses with serviceability badge |
| Settings | Links and logout |
| Admin Panel | Add/edit/delete products, update order status, manage users (admin-only) |

---

## Firestore Collections

Same collections as the Android app — the web and Android apps share a single database.

```
users/{uid}
  name, phone, email, isAdmin, createdAt

users/{uid}/orders/{orderId}
  orderId, items[], total, address, status, paymentId, date, createdAt

users/{uid}/addresses/{addressId}
  name, phone, flat, area, pincode, city, state, fullAddress, label, createdAt

products/{productId}
  name, description, price, category, unit, stock, imageUrl, createdAt
```

---

## Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Deploy to Firebase Hosting, Vercel, or Netlify.

---

## Firestore Security Rules (recommended)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /users/{uid}/orders/{orderId} {
      allow read, write: if request.auth.uid == uid;
    }
    match /users/{uid}/addresses/{addressId} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```
