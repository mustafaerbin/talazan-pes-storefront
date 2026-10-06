import {
  Baby,
  BookOpen,
  Car,
  Cpu,
  Dumbbell,
  Heart,
  Home,
  PawPrint,
  Shirt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICON_MAP: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["elektronik", "teknoloji", "bilgisayar", "telefon"], icon: Cpu },
  { keywords: ["moda", "giyim", "tekstil", "ayakkabı", "aksesuar"], icon: Shirt },
  { keywords: ["ev", "yaşam", "mobilya", "dekorasyon"], icon: Home },
  { keywords: ["kozmetik", "güzellik", "bakım", "makyaj"], icon: Sparkles },
  { keywords: ["spor", "outdoor", "fitness"], icon: Dumbbell },
  { keywords: ["bebek", "anne", "çocuk"], icon: Baby },
  { keywords: ["pet", "hayvan"], icon: PawPrint },
  { keywords: ["kitap", "kırtasiye", "ofis"], icon: BookOpen },
  { keywords: ["otomotiv", "araç", "oto"], icon: Car },
];

export function getCategoryIcon(name?: string): LucideIcon {
  if (!name) return Heart;
  const lower = name.toLowerCase();
  const match = CATEGORY_ICON_MAP.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword)),
  );
  return match?.icon ?? Heart;
}
