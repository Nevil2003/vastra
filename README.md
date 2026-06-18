# Vastra

Vastra is a clean wardrobe utility for outfits, occasions, stitching, measurements, wear logs, and wishlist planning.

No AI is required. The app is built around manual control, fast entry, and the real workflows people have around clothes: planning outfits, remembering measurements, tracking tailor work, and wearing more of what they already own.

## Stack

- Next.js App Router
- React + TypeScript
- Firebase Auth
- Firestore
- Firebase Storage
- Tailwind CSS

## Screens

- `/login` and `/signup`: email/password and Google auth
- `/home`: dashboard, stats, stitching tasks, upcoming occasion
- `/wardrobe`: garment/fabric grid, filters, image upload, stitching details
- `/outfits`: manual outfit builder and lookbook
- `/occasions`: event planning with saved looks
- `/log`: daily wear logging and streaks
- `/wishlist`: shopping wishlist with price, URL, image, and priority
- `/profile`: sizes, measurements, colors, style words, preferred tailor

## Setup

1. Create a Firebase project.
2. Enable Email/Password and Google sign-in in Firebase Auth.
3. Create a Firestore database.
4. Enable Firebase Storage.
5. Copy `.env.example` to `.env.local` and fill the Firebase web app keys.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Firestore Collections

The app writes these top-level collections:

- `garments`
- `outfits`
- `occasions`
- `wearLogs`
- `wishlist`
- `profiles`

Every document includes `userId`, so security rules should require `request.auth.uid == resource.data.userId` for reads/writes.

## Suggested Firestore Rules

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{docId} {
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Suggested Storage Rules

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
