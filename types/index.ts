export type GarmentCategory =
  | "Top"
  | "Bottom"
  | "Dress"
  | "Saree"
  | "Kurta"
  | "Lehenga"
  | "Suit"
  | "Outerwear"
  | "Shoes"
  | "Accessory"
  | "Fabric"
  | "Beauty";

export type OutfitSlotKey = "top" | "bottom" | "dress" | "shoes" | "outerwear" | "bag" | "accessory";

export type WeatherTag = "hot" | "cold" | "rain" | "wind";

export type GarmentTag =
  | "favorite"
  | "donate-maybe"
  | "needs-alteration"
  | "rarely-worn"
  | "sentimental";

export type GarmentCondition = "new" | "excellent" | "good" | "fair" | "poor";

export type StitchingStatus =
  | "not-needed"
  | "to-stitch"
  | "with-tailor"
  | "trial"
  | "ready"
  | "delivered";

export type Garment = {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  subcategory?: string;
  color: string;
  colorName: string;
  imageUrl?: string;
  brand?: string;
  size?: string;
  fabric?: string;
  occasion?: string;
  season?: string;
  weatherTags?: WeatherTag[];
  price?: number;
  purchaseDate?: string;
  condition?: GarmentCondition;
  tags?: GarmentTag[];
  wearCount: number;
  lastWorn?: string;
  notes?: string;
  stitchingStatus: StitchingStatus;
  measurements?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type Outfit = {
  id: string;
  userId: string;
  name: string;
  garmentIds: string[];
  slots?: Partial<Record<OutfitSlotKey, string>>;
  occasion?: string;
  season?: string;
  weatherTags?: WeatherTag[];
  tags?: string[];
  notes?: string;
  favorite?: boolean;
  wornCount: number;
  lastWorn?: string;
  createdAt: string;
  updatedAt: string;
};

export type WearLog = {
  id: string;
  userId: string;
  date: string;
  garmentIds: string[];
  outfitId?: string;
  occasion?: string;
  notes?: string;
  createdAt: string;
};

export type OutfitPlan = {
  id: string;
  userId: string;
  date: string;
  outfitId?: string;
  garmentIds: string[];
  occasion?: string;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  notes?: string;
  worn: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Occasion = {
  id: string;
  userId: string;
  title: string;
  date: string;
  type: "wedding" | "work" | "travel" | "festival" | "party" | "casual" | "other";
  location?: string;
  outfitId?: string;
  garmentIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type WishlistItem = {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  brand?: string;
  imageUrl?: string;
  url?: string;
  price?: number;
  originalPrice?: number;
  saleStatus?: "watching" | "sale" | "price-drop" | "restocked";
  lastCheckedAt?: string;
  priority: "low" | "medium" | "high";
  notes?: string;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StyleProfile = {
  id: string;
  userId: string;
  displayName?: string;
  city?: string;
  styleWords: string[];
  favoriteColors: string[];
  sizes: Record<string, string>;
  measurements: Record<string, string>;
  preferredTailor?: string;
  updatedAt: string;
};

export interface ImageResult {
  imageUrl: string;
  title: string;
  brand: string;
  site: string;
  link: string;
}
