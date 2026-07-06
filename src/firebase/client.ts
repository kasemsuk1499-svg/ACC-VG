import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signOut, type User } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
export const app = firebaseReady ? initializeApp(firebaseConfig) : undefined;
export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;

export async function loginGuest() {
  if (!auth) return undefined;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function logoutGuest() {
  if (!auth) return;
  await signOut(auth);
}

export async function loadProfile(user: User) {
  if (!db) return undefined;
  const ref = doc(db, "players", user.uid);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : undefined;
}

export async function saveProfile(user: User, payload: Record<string, unknown>) {
  if (!db) return;
  await setDoc(doc(db, "players", user.uid), payload, { merge: true });
}
