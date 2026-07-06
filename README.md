# Anime Vanguard Lab

Prototype for an anime multi-nation gacha card game with a Vanguard-inspired battle loop, Firebase-ready login/save, AI simulation, and GitHub Pages deployment.

## Run

```bash
npm install
npm run dev
```

## Firebase

Copy `.env.example` to `.env.local` and fill values from your Firebase web app.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Enable Firebase Authentication with Anonymous provider. Firestore currently saves player profiles to:

```text
players/{uid}
```

Recommended Firestore security rules are in `firestore.rules`. Paste them into Firebase Console > Firestore Database > Rules, then publish.

Next multiplayer step:

```text
rooms/{roomId}
  hostUid
  guestUid
  ready
  battleSnapshot
  turnOwner
  updatedAt
```

## Card Data

Cards live in `src/cards`. The folder is intentionally simple:

```text
src/cards/
  index.ts
  card-id/
    index.ts
    art.svg
```

`src/cards/index.ts` imports every card folder and exports the full card list. Each card folder owns one card's data and image. Each card can define:

- grade, power, shield, critical, rarity, trigger
- anime source and custom nation
- art asset
- rare cutscene id
- attack animation key
- skills with both text and engine-readable effects

To add a new card, copy any existing card folder, edit that folder's `index.ts` and `art.svg`, then import it in `src/cards/index.ts`.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds on `main` and deploys `dist` to GitHub Pages. Add the Firebase values as repository secrets with the same names as `.env.example`.

## Current Battle Rules

Implemented systems:

- grade 0 start
- draw phase
- ride grade 1 to 3
- rear-guard calls
- vanguard and rear-guard attacks
- twin drive at grade 3
- trigger checks for critical, draw, heal, front, and over
- damage to 6 loses
- skill hooks for ride, call, attack, boost, drive, damage, and guard timing

This uses original card names and assets. Do not copy official anime/card assets into the project unless you own the rights.
