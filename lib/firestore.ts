"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type CollectionName = "garments" | "outfits" | "occasions" | "wearLogs" | "wishlist" | "profiles";

export function userCollection(name: CollectionName, userId: string) {
  return query(collection(db, name), where("userId", "==", userId), orderBy("createdAt", "desc"));
}

export function subscribeToUserCollection<T>(
  name: CollectionName,
  userId: string,
  onData: (items: T[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    userCollection(name, userId),
    (snapshot) => {
      onData(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as T));
    },
    onError
  );
}

export async function createItem<T extends { userId: string }>(name: CollectionName, data: T) {
  const now = new Date().toISOString();
  return addDoc(collection(db, name), { ...data, createdAt: now, updatedAt: now });
}

export async function updateItem(name: CollectionName, id: string, data: Record<string, unknown>) {
  return updateDoc(doc(db, name, id), { ...data, updatedAt: new Date().toISOString() });
}

export async function upsertItem<T extends object>(name: CollectionName, id: string, data: T) {
  return setDoc(doc(db, name, id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function removeItem(name: CollectionName, id: string) {
  return deleteDoc(doc(db, name, id));
}
