"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CloudSun,
  Download,
  ImageUp,
  Send,
  Shirt,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type Weather = {
  high: number;
  low: number;
};

type Outfit = {
  occasion: string;
  warm: string;
  cold: string;
  image: string;
  tone: string;
  tags: string[];
};

type SavedLook = {
  occasion: string;
  recommendation: string;
  savedAt: string;
};

const user = { name: "Nevil" };
const weather: Weather = { high: 35, low: 26 };

const outfits: Outfit[] = [
  {
    occasion: "Dinner Plans",
    warm: "Linen shirt with relaxed chinos",
    cold: "Fine-knit sweater with tailored trousers",
    image: "https://placehold.co/640x820/F4EFE7/111111?text=Dinner+Plans",
    tone: "Polished and breezy",
    tags: ["linen", "chinos", "evening"],
  },
  {
    occasion: "Office Work",
    warm: "Cotton overshirt with lightweight trousers",
    cold: "Blazer layered over a merino sweater",
    image: "https://placehold.co/640x820/EAF0F2/111111?text=Office+Work",
    tone: "Clean workday uniform",
    tags: ["professional", "breathable", "light"],
  },
  {
    occasion: "Dinner Date",
    warm: "Open-collar shirt with tapered chinos",
    cold: "Soft blazer with a warm crewneck",
    image: "https://placehold.co/640x820/F1E7EA/111111?text=Dinner+Date",
    tone: "Smart casual",
    tags: ["date night", "sharp", "comfortable"],
  },
  {
    occasion: "Client Presentation",
    warm: "Linen-blend shirt with structured trousers",
    cold: "Classic blazer with wool trousers",
    image: "https://placehold.co/640x820/E9ECE7/111111?text=Client+Presentation",
    tone: "Crisp and composed",
    tags: ["presentation", "tailored", "light"],
  },
  {
    occasion: "Casual Dinner",
    warm: "Breathable camp collar shirt with chinos",
    cold: "Overshirt with a textured sweater",
    image: "https://placehold.co/640x820/EEF0F6/111111?text=Casual+Dinner",
    tone: "Easy evening fit",
    tags: ["casual", "dinner", "warm weather"],
  },
];

function getRecommendation(outfit: Outfit, currentWeather: Weather) {
  if (currentWeather.low < 20) return outfit.cold;
  if (currentWeather.high > 30) return outfit.warm;
  return "Light layers with breathable cotton separates";
}

function getTemperatureNote(currentWeather: Weather) {
  if (currentWeather.high > 30) return "Warm-weather picks selected for the 26-35 C range.";
  if (currentWeather.low < 20) return "Layered outfits selected for cooler weather.";
  return "Balanced outfits selected for mild weather.";
}

export default function RecommendedPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);
    const storedAvatar = window.localStorage.getItem("local-lookbook-avatar");
    const storedLooks = window.localStorage.getItem("local-lookbook-saved-looks");

    if (storedAvatar) setAvatarPreview(storedAvatar);
    if (storedLooks) setSavedLooks(JSON.parse(storedLooks) as SavedLook[]);

    return () => window.clearTimeout(timer);
  }, []);

  const recommendedOutfits = useMemo(
    () =>
      outfits.map((outfit) => ({
        ...outfit,
        recommendation: getRecommendation(outfit, weather),
      })),
    []
  );

  const limitReached = savedLooks.length >= 3;

  function saveLook(occasion: string, recommendation: string) {
    if (limitReached) return;

    const nextLooks = [
      ...savedLooks,
      { occasion, recommendation, savedAt: new Date().toISOString() },
    ];

    setSavedLooks(nextLooks);
    window.localStorage.setItem("local-lookbook-saved-looks", JSON.stringify(nextLooks));
  }

  function saveFirstLook() {
    const firstUnsaved = recommendedOutfits.find(
      (outfit) => !savedLooks.some((look) => look.occasion === outfit.occasion)
    );

    if (firstUnsaved) saveLook(firstUnsaved.occasion, firstUnsaved.recommendation);
  }

  function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      setAvatarPreview(result);
      window.localStorage.setItem("local-lookbook-avatar", result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[8px] border border-[#E8E8E8] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[#888888]">Good afternoon, {user.name}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#111111]">
                Weather-Based Outfit Recommender
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F5] px-3 py-1.5 font-medium text-[#111111]">
                <CloudSun className="h-4 w-4" />
                High {weather.high} C / Low {weather.low} C
              </span>
              <a href="#weather" className="text-sm font-semibold text-[#111111] underline-offset-4 hover:underline">
                Weather details
              </a>
            </div>
          </div>

          <Button className="w-full md:w-auto">
            <Download className="h-4 w-4" />
            Get The iPhone App
          </Button>
        </div>
      </section>

      {isLoading ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[8px] border border-dashed border-[#DADADA] bg-white text-center">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-[#111111]">Considering weather...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div id="weather">
              <h2 className="text-lg font-semibold text-[#111111]">Recommended looks</h2>
              <p className="text-sm text-[#888888]">{getTemperatureNote(weather)}</p>
            </div>
            <p className="text-sm font-medium text-[#888888]">{savedLooks.length}/3 looks saved</p>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedOutfits.map((outfit) => {
              const saved = savedLooks.some((look) => look.occasion === outfit.occasion);

              return (
                <article
                  key={outfit.occasion}
                  className="overflow-hidden rounded-[8px] border border-[#E8E8E8] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F5F5]">
                    <img
                      src={outfit.image}
                      alt={`${outfit.occasion} outfit`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#111111] shadow-sm">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {limitReached ? "Outfit limit reached" : "Unlock premium"}
                    </span>
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#111111]">{outfit.occasion}</h3>
                      <p className="mt-1 text-sm text-[#666666]">{outfit.recommendation}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#AAAAAA]">
                        {outfit.tone}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {outfit.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#E8E8E8] px-2.5 py-1 text-xs text-[#666666]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="secondary" size="sm">
                        <SlidersHorizontal className="h-4 w-4" />
                        Customize outfit
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setAvatarOpen(true)}>
                        <ImageUp className="h-4 w-4" />
                        Avatar
                      </Button>
                      <Button
                        variant={saved ? "secondary" : "outline"}
                        size="sm"
                        disabled={saved || limitReached}
                        onClick={() => saveLook(outfit.occasion, outfit.recommendation)}
                      >
                        <Shirt className="h-4 w-4" />
                        {saved ? "Saved" : "Save look"}
                      </Button>
                      <Button size="sm">
                        <Send className="h-4 w-4" />
                        Send look
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="flex flex-col gap-3 rounded-[8px] border border-[#E8E8E8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#111111]">Avatar photo upload</p>
              <p className="text-sm text-[#888888]">
                Upload a profile photo to preview outfits against your own look.
              </p>
            </div>
            <Button variant="outline" onClick={() => setAvatarOpen(true)}>
              <ImageUp className="h-4 w-4" />
              Upload avatar
            </Button>
          </div>

          <div className="flex justify-center">
            <Button size="lg" disabled={limitReached} onClick={saveFirstLook}>
              Save look
            </Button>
          </div>
        </>
      )}

      <div className="rounded-[8px] border border-[#F3D3A8] bg-[#FFF8EC] px-4 py-3 text-sm text-[#7A4B14]">
        Service Maintenance: Outfit sharing and avatar previews may be temporarily limited while updates are completed.
      </div>

      <Modal open={avatarOpen} onClose={() => setAvatarOpen(false)} title="Avatar photo upload">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#E8E8E8] bg-[#F5F5F5]">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <ImageUp className="h-7 w-7 text-[#AAAAAA]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#111111]">Profile photo</p>
              <p className="mt-1 text-sm text-[#888888]">Stored locally in this browser.</p>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-[#111111]">Choose image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="mt-2 block w-full rounded-[8px] border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-[#111111] file:mr-3 file:rounded-full file:border-0 file:bg-[#111111] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
