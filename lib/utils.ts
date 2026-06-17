export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Real emoji per garment category, shown on cards/slots before a photo is added. */
export function getCategoryEmoji(category: string) {
  const map: Record<string, string> = {
    "Shirt/Top": "👔",
    "T-Shirt": "👕",
    Kurta: "👘",
    Saree: "🥻",
    Lehenga: "👗",
    Jeans: "👖",
    Pants: "👖",
    Skirt: "👗",
    Dress: "👗",
    Shoes: "👟",
    Accessories: "👜",
    Jacket: "🧥",
    Sweater: "👚",
    Shorts: "🩳",
  };
  return map[category] || "👕";
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return "122, 36, 56";
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/** Soft tactile gradient derived from a garment's own colour. */
export function tileGradient(hex?: string | null): string {
  const rgb = hexToRgb(hex || "#7A2438");
  return `radial-gradient(120% 120% at 28% 22%, rgba(${rgb}, 0.30), rgba(${rgb}, 0.08) 58%, #FFFDF8 100%)`;
}

export function hexToName(hex: string) {
  const colors: Record<string, string> = {
    "#1a1410": "Black",
    "#FFFFFF": "White",
    "#2563EB": "Blue",
    "#DC2626": "Red",
    "#16A34A": "Green",
    "#EAB308": "Yellow",
    "#EC4899": "Pink",
    "#8B5CF6": "Purple",
    "#000000": "Black",
    "#F97316": "Orange",
    "#6B7280": "Grey",
    "#78350F": "Brown",
    "#0891B2": "Cyan",
    "#7A2438": "Maroon",
    "#D69A2D": "Gold",
    "#264D46": "Emerald",
    "#1E4F8A": "Indigo",
    "#C74328": "Rust",
    "#7A5C9E": "Lavender",
    "#E7D9C8": "Beige",
  };
  return colors[hex.toUpperCase()] || colors[hex.toLowerCase()] || "Unknown";
}
