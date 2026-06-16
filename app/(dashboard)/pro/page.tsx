"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, ShieldCheck, TrendingUp } from "lucide-react";

const features = [
  "Unlimited closet items",
  "AI wardrobe audits",
  "Resale valuation updates",
  "Advanced color science matching",
  "Seasonal trend reports",
  "Priority AI recommendations",
];

export default function ProPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  async function checkout() {
    setLoading(true);
    const res = await fetch("/api/subscription/checkout", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Checkout not configured. Add Stripe keys in Vercel.");
    }
  }

  const isPro = user?.plan === "pro" && user?.status === "active";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#1A1410]">Vastra Pro</h1>
        <p className="mt-2 text-[#2D2D2D]/70">Unlock the full power of your AI stylist.</p>
      </div>

      <Card className="overflow-hidden border-[#D4A574]">
        <div className="bg-[#1A1410] p-6 text-center text-white">
          <Crown className="mx-auto h-10 w-10 text-[#D4A574]" />
          <div className="mt-4 text-4xl font-bold">₹99<span className="text-lg font-normal text-white/70">/month</span></div>
          <div className="text-sm text-white/60">or ₹899/year (25% off)</div>
        </div>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-[#2D2D2D]">
                <Check className="h-5 w-5 text-green-600" /> {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="rounded-lg bg-green-50 p-4 text-center font-semibold text-green-700">
              You are on Vastra Pro 🎉
            </div>
          ) : (
            <Button onClick={checkout} isLoading={loading} className="w-full gap-2">
              <Crown className="h-4 w-4" /> Upgrade Now
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[#D4A574]" />
            <div className="mt-2 font-semibold">AI Stylist</div>
            <p className="text-sm text-gray-500">Personalized daily picks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <TrendingUp className="mx-auto h-8 w-8 text-[#D4A574]" />
            <div className="mt-2 font-semibold">Valuation</div>
            <p className="text-sm text-gray-500">Track wardrobe worth</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-[#D4A574]" />
            <div className="mt-2 font-semibold">Insurance Ready</div>
            <p className="text-sm text-gray-500">Export value reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
