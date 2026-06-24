export type BrandSignal = "Sale live" | "New collection" | "Restock" | "Price drop";

export type IndianBrand = {
  id: string;
  name: string;
  category: string;
  signal: BrandSignal;
  signalText: string;
  discount?: string;
  collection: string;
  matchReason: string;
  palette: string;
  url: string;
  image: string;
  tags: string[];
};

export const followedBrandsStorageKey = "local-lookbook-followed-brands";
export const customBrandsStorageKey = "local-lookbook-custom-brands";

export const indianBrands: IndianBrand[] = [
  {
    id: "fabindia",
    name: "Fabindia",
    category: "Everyday ethnic",
    signal: "Sale live",
    signalText: "Cotton edit is on sale",
    discount: "Up to 35% off",
    collection: "Summer cotton kurtas and linen shirts",
    matchReason: "Strong fit for hot office days and casual dinners.",
    palette: "#D9E8D2",
    url: "https://www.fabindia.com",
    image: "https://placehold.co/640x820/D9E8D2/111111?text=Fabindia",
    tags: ["cotton", "kurta", "linen", "office"],
  },
  {
    id: "snitch",
    name: "Snitch",
    category: "Menswear",
    signal: "New collection",
    signalText: "Linen resort shirts dropped",
    collection: "Relaxed shirts, chinos, and co-ords",
    matchReason: "Pairs well with warm-weather dinner and date looks.",
    palette: "#D6E7F5",
    url: "https://www.snitch.co.in",
    image: "https://placehold.co/640x820/D6E7F5/111111?text=Snitch",
    tags: ["linen", "shirts", "date night", "casual"],
  },
  {
    id: "nicobar",
    name: "Nicobar",
    category: "Modern Indian",
    signal: "Restock",
    signalText: "Breezy essentials restocked",
    collection: "Vacation shirts and relaxed separates",
    matchReason: "Good for breathable looks in the 30 C+ weather band.",
    palette: "#EEE1C7",
    url: "https://www.nicobar.com",
    image: "https://placehold.co/640x820/EEE1C7/111111?text=Nicobar",
    tags: ["resort", "minimal", "summer", "travel"],
  },
  {
    id: "jaypore",
    name: "Jaypore",
    category: "Craft-led occasionwear",
    signal: "Sale live",
    signalText: "Festive styles are marked down",
    discount: "Up to 40% off",
    collection: "Handcrafted kurtas, sarees, and jewellery",
    matchReason: "Useful for weddings, festivals, and dinner plans.",
    palette: "#E9D7DA",
    url: "https://www.jaypore.com",
    image: "https://placehold.co/640x820/E9D7DA/111111?text=Jaypore",
    tags: ["festive", "craft", "saree", "jewellery"],
  },
  {
    id: "libas",
    name: "Libas",
    category: "Women ethnic",
    signal: "Price drop",
    signalText: "Kurta sets dropped in price",
    discount: "From Rs. 899",
    collection: "Printed kurtas, co-ords, and occasion sets",
    matchReason: "Quick wins for workwear and everyday ethnic outfits.",
    palette: "#E6E0F5",
    url: "https://www.libas.in",
    image: "https://placehold.co/640x820/E6E0F5/111111?text=Libas",
    tags: ["kurta set", "printed", "workwear", "daily"],
  },
  {
    id: "rare-rabbit",
    name: "Rare Rabbit",
    category: "Smart casual menswear",
    signal: "Sale live",
    signalText: "Sharp casuals are on offer",
    discount: "Up to 50% off",
    collection: "Shirts, trousers, polos, and jackets",
    matchReason: "Best for client presentations and dinner-date outfits.",
    palette: "#E4E8EE",
    url: "https://thehouseofrare.com",
    image: "https://placehold.co/640x820/E4E8EE/111111?text=Rare+Rabbit",
    tags: ["smart casual", "presentation", "shirts", "trousers"],
  },
];

export function getDefaultFollowedBrandIds() {
  return ["fabindia", "snitch", "nicobar"];
}

export function getBrandById(id: string) {
  return indianBrands.find((brand) => brand.id === id);
}
