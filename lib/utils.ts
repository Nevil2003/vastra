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

export function getCategoryEmoji(category: string) {
  const map: Record<string, string> = {
    "Shirt/Top": "Sh",
    "T-Shirt": "T",
    Jeans: "Jn",
    Pants: "Pn",
    Skirt: "Sk",
    Dress: "Dr",
    Shoes: "So",
    Accessories: "Ac",
    Jacket: "Jk",
    Sweater: "Sw",
    Shorts: "St",
    Saree: "Sa",
    Kurta: "Ku",
    Lehenga: "Le",
  };
  return map[category] || "Va";
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
  };
  return colors[hex.toUpperCase()] || colors[hex.toLowerCase()] || "Unknown";
}
