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

export type StitchingStatus = "not-needed" | "to-stitch" | "with-tailor" | "trial" | "ready" | "delivered";

export type Garment = {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  color: string;
  colorName: string;
  imageUrl?: string;
  brand?: string;
  size?: string;
  fabric?: string;
  occasion?: string;
  season?: string;
  price?: number;
  wearCount: number;
  lastWorn?: string;
  notes?: string;
  tailorName?: string;
  tailorPhone?: string;
  stitchingStatus: StitchingStatus;
  stitchingDueDate?: string;
  stitchingPrice?: number;
  measurements?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type Outfit = {
  id: string;
  userId: string;
  name: string;
  occasion?: string;
  notes?: string;
  garmentIds: string[];
  wornCount: number;
  lastWorn?: string;
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

export type WishlistItem = {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  imageUrl?: string;
  url?: string;
  price?: number;
  priority: "low" | "medium" | "high";
  notes?: string;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface ImageResult {
  imageUrl: string;
  title: string;
  brand: string;
  site: string;
  link: string;
}

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
