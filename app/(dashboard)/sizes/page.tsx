"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Ruler } from "lucide-react";

export default function SizesPage() {
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((d) => setProfile(d.profile || {}));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setLoading(false);
    alert("Size profile saved!");
  }

  function update(key: string, value: string) {
    setProfile({ ...profile, [key]: value });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-[#1A1410]">Your Size Profile</h1>
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-[#D4A574]" /> Measurements
        </CardTitle>
        <CardContent>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {[ 
              { key: "topSize", label: "Top Size", placeholder: "M, L, XL" },
              { key: "bottomSize", label: "Bottom / Jeans Size", placeholder: "32, 34" },
              { key: "shoeSize", label: "Shoe Size", placeholder: "8, 9, 10" },
              { key: "dressSize", label: "Dress Size", placeholder: "S, M, L" },
              { key: "footWidth", label: "Foot Width", placeholder: "Regular, Wide" },
              { key: "preferredBrand", label: "Best Fitting Brand", placeholder: "H&M, Zara" },
              { key: "location", label: "City", placeholder: "Mumbai, Delhi" },
            ].map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-semibold text-[#1A1410]">{field.label}</label>
                <Input value={profile[field.key] || ""} placeholder={field.placeholder} onChange={(e) => update(field.key, e.target.value)} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <Button type="submit" isLoading={loading} className="w-full">Save Measurements</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
