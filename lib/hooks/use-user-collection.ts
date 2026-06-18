"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { CollectionName, subscribeToUserCollection } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";

export function useUserCollection<T>(name: CollectionName) {
  const { user } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    return subscribeToUserCollection<T>(
      name,
      user.uid,
      (nextItems) => {
        setItems(nextItems);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [name, user]);

  return { items, loading, error };
}
