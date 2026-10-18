import type { HomeSection } from "@/types/api";

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  {
    id: "hero",
    type: "hero",
    aktif: true,
    siraNo: 1,
  },
  {
    id: "categories",
    type: "categories",
    aktif: true,
    siraNo: 2,
  },
  {
    id: "featured",
    type: "product_carousel",
    baslik: "Ürünleri keşfedin",
    altBaslik: "Mağaza seçkisi.",
    aktif: true,
    siraNo: 3,
    ayarlar: { source: "featured", limit: 8 },
  },
  {
    id: "features",
    type: "features",
    aktif: true,
    siraNo: 4,
  },
];

export function parseHomeSectionsFromConfig(ekAyarlar?: string): HomeSection[] {
  if (!ekAyarlar) return DEFAULT_HOME_SECTIONS;
  try {
    const parsed = JSON.parse(ekAyarlar) as { anasayfaBolumleri?: HomeSection[] };
    if (parsed.anasayfaBolumleri?.length) {
      return [...parsed.anasayfaBolumleri].sort((a, b) => a.siraNo - b.siraNo);
    }
  } catch {
    // ignore
  }
  return DEFAULT_HOME_SECTIONS;
}
