"use client";

import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, googleProvider } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      router.push("/closet");
    } catch {
      setError("Could not create your account. Try a stronger password or another email.");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignIn() {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/closet");
    } catch {
      setError("Google sign up was not completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create AI Closet</h1>
        <p className="mt-1 text-sm text-white/58">Fashion intelligence by Mastical</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/78">Name</label>
          <Input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/78">Email</label>
          <Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/78">Password</label>
          <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" isLoading={loading}>Get started</Button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E8E8E8]" />
        <span className="text-xs text-[#AAAAAA]">or</span>
        <div className="h-px flex-1 bg-[#E8E8E8]" />
      </div>

      <Button variant="secondary" className="w-full" onClick={googleSignIn} isLoading={loading}>
        Continue with Google
      </Button>

      <p className="text-center text-sm text-[#888888]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-cyan-100 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
