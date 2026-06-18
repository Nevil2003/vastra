"use client";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadUserImage(userId: string, folder: string, file: File) {
  const safeName = file.name.replace(/[^a-z0-9.-]/gi, "-").toLowerCase();
  const path = `${userId}/${folder}/${Date.now()}-${safeName}`;
  const imageRef = ref(storage, path);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}
