import type { HomeSection } from "@/types/api";

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  {
    id: "hero",
    type: "hero",
    baslik: "Yeni Sezon Koleksiyonu",
    altBaslik: "Premium kalite, hızlı teslimat ve güvenli alışveriş deneyimi.",
    aktif: true,
    siraNo: 1,
  },
  {
    id: "best-sellers",
    type: "product_carousel",
    baslik: "Çok Satanlar",
    aktif: true,
    siraNo: 2,
    ayarlar: { source: "best_sellers", limit: 8 },
  },
  {
    id: "new-arrivals",
    type: "product_carousel",
    baslik: "Yeni Gelenler",
    aktif: true,
    siraNo: 3,
    ayarlar: { source: "new_arrivals", limit: 8 },
  },
  {
    id: "discounted",
    type: "product_carousel",
    baslik: "İndirimli Ürünler",
    aktif: true,
    siraNo: 4,
    ayarlar: { source: "discounted", limit: 8 },
  },
  {
    id: "categories",
    type: "categories",
    baslik: "Kategoriler",
    aktif: true,
    siraNo: 5,
  },
  {
    id: "brands",
    type: "brands",
    baslik: "Markalar",
    aktif: true,
    siraNo: 6,
  },
  {
    id: "features",
    type: "features",
    aktif: true,
    siraNo: 7,
  },
  {
    id: "newsletter",
    type: "newsletter",
    baslik: "Kampanyalardan Haberdar Olun",
    altBaslik: "Özel fırsatlar ve yeni ürünler e-posta kutunuza gelsin.",
    aktif: true,
    siraNo: 8,
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
