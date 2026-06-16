"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getCategoryEmoji, hexToName } from "@/lib/utils";
import { Camera, Plus, Search, Trash2, Sparkles } from "lucide-react";

const categories = ["Shirt/Top", "T-Shirt", "Jeans", "Pants", "Skirt", "Dress", "Shoes", "Accessories", "Jacket", "Sweater", "Shorts"];
const colors = ["#1a1410", "#FFFFFF", "#2563EB", "#DC2626", "#16A34A", "#EAB308", "#EC4899", "#8B5CF6", "#F97316", "#6B7280", "#78350F", "#0891B2"];

export default function ClosetPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Shirt/Top",
    brand: "",
    color: "#1a1410",
    size: "",
    material: "",
    occasion: "casual",
    season: "all-season",
    imageUrl: "",
    estimatedValue: "",
  });

  async function loadItems() {
    const res = await fetch("/api/closet");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      setAnalyzing(false);

      if (res.ok) {
        const data = await res.json();
        const item = data.item;
        setForm({
          name: item.name,
          category: item.category,
          brand: item.brand || "",
          color: item.color,
          size: item.size || "",
          material: item.material || "",
          occasion: item.occasion || "casual",
          season: item.season || "all-season",
          imageUrl: item.imageUrl || "",
          estimatedValue: item.estimatedValue ? String(item.estimatedValue) : "",
        });
        setModalOpen(true);
        loadItems();
      } else {
        alert("AI analysis failed. Try manual upload.");
      }
    };
    reader.readAsDataURL(file);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/closet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        colorName: hexToName(form.color),
        estimatedValue: Number(form.estimatedValue) || 0,
      }),
    });
    if (res.ok) {
      setModalOpen(false);
      resetForm();
      loadItems();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to add item");
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/closet/${id}`, { method: "DELETE" });
    loadItems();
  }

  function resetForm() {
    setForm({
      name: "",
      category: "Shirt/Top",
      brand: "",
      color: "#1a1410",
      size: "",
      material: "",
      occasion: "casual",
      season: "all-season",
      imageUrl: "",
      estimatedValue: "",
    });
  }

  const filtered = items.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? i.category === filter || i.occasion === filter || i.season === filter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-[#1A1410]">My Digital Closet</h1>
        <div className="flex gap-3">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button asSpan variant="secondary" className="gap-2" isLoading={analyzing}>
              <Camera className="h-4 w-4" /> AI Scan
            </Button>
          </label>
          <Button onClick={() => { resetForm(); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items, brands..." className="pl-10" />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="sm:w-48">
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="casual">Casual</option>
          <option value="formal">Formal</option>
          <option value="wedding">Wedding</option>
          <option value="summer">Summer</option>
          <option value="winter">Winter</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading closet...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8DDD5] bg-white p-12 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-[#D4A574]" />
          <h3 className="mt-4 text-lg font-semibold text-[#1A1410]">Your closet is empty</h3>
          <p className="text-gray-500">Upload a photo and let AI auto-tag your first item.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <div className="flex h-48 items-center justify-center bg-[#F5F1ED] text-5xl">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  getCategoryEmoji(item.category)
                )}
              </div>
              <CardContent className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#C1440E]">{item.category}</div>
                <div className="font-semibold text-[#1A1410]">{item.name}</div>
                <div className="text-sm text-gray-500">{item.brand} {item.size && `• Size ${item.size}`}</div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border border-gray-200" style={{ background: item.color }} />
                  <span className="text-xs text-gray-500">{item.colorName || hexToName(item.color)}</span>
                </div>
                <Button variant="danger" size="sm" className="w-full gap-2 opacity-0 transition group-hover:opacity-100" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.name ? "Review AI Tags" : "Add Clothing Item"}>
        <form onSubmit={addItem} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Category</label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Brand</label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full border-2 ${form.color === c ? "border-[#C1440E]" : "border-transparent"}`}
                  style={{ background: c, boxShadow: c === "#FFFFFF" ? "inset 0 0 0 1px #ddd" : undefined }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Size</label>
              <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Value (₹)</label>
              <Input type="number" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Occasion</label>
              <Select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="office">Office</option>
                <option value="party">Party</option>
                <option value="wedding">Wedding</option>
                <option value="sports">Sports</option>
                <option value="ethnic">Ethnic</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Season</label>
              <Select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })}>
                <option value="all-season">All Season</option>
                <option value="summer">Summer</option>
                <option value="winter">Winter</option>
                <option value="monsoon">Monsoon</option>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">Save Item</Button>
        </form>
      </Modal>
    </div>
  );
}
