"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value && typeof window !== "undefined") {
    console.warn(`Missing Firebase environment variable: ${name}`);
  }
  return value || "";
}

const firebaseConfig = {
  apiKey: requiredEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: requiredEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requiredEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: requiredEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requiredEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requiredEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const analyticsPromise =
  typeof window === "undefined" ? Promise.resolve(null) : isSupported().then((supported) => (supported ? getAnalytics(app) : null));
