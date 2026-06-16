"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

const defaultBrands = ["H&M", "Zara", "Uniqlo", "Forever 21", "Mango", "Levis", "Nike", "Adidas"];

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");

  async function load() {
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(data.brands || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category }),
    });
    setName("");
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#1A1410]">Favorite Brands</h1>
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-[#D4A574]" /> Add Brand
        </CardTitle>
        <CardContent>
          <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand name" list="brand-suggestions" required />
            <datalist id="brand-suggestions">
              {defaultBrands.map((b) => <option key={b} value={b} />)}
            </datalist>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-40">
              <option value="general">General</option>
              <option value="premium">Premium</option>
              <option value="fast-fashion">Fast Fashion</option>
              <option value="luxury">Luxury</option>
              <option value="local">Local</option>
            </Select>
            <Button type="submit" className="sm:w-auto">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {brands.map((brand) => (
          <Card key={brand.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#1A1410]">{brand.name}</div>
              <div className="text-xs uppercase text-gray-500">{brand.category}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
