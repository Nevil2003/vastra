"use client";

import useSWR from "swr";

export type User = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  status: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
  });

  return {
    user: data?.user as User | undefined,
    isLoading,
    error,
    mutate,
  };
}
