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
    id: "categories",
    type: "categories",
    baslik: "Popüler Kategoriler",
    altBaslik: "İhtiyacınıza uygun kategorileri keşfedin",
    aktif: true,
    siraNo: 2,
  },
  {
    id: "featured",
    type: "product_carousel",
    baslik: "Öne Çıkan Ürünler",
    altBaslik: "Editör seçimi ürünler",
    aktif: true,
    siraNo: 3,
    ayarlar: { source: "featured", limit: 12 },
  },
  {
    id: "promo-summer",
    type: "promotion",
    baslik: "Yaz Kampanyası",
    aktif: true,
    siraNo: 4,
    ayarlar: {
      promotions: [
        {
          baslik: "Yaz İndirimleri",
          altBaslik: "%50'ye varan fırsatlar",
          ctaMetin: "Keşfet",
          url: "/ara",
        },
        {
          baslik: "Elektronik Haftası",
          altBaslik: "Seçili ürünlerde özel fiyat",
          ctaMetin: "İncele",
          url: "/ara",
        },
      ],
    },
  },
  {
    id: "new-arrivals",
    type: "product_carousel",
    baslik: "Yeni Gelenler",
    altBaslik: "En son eklenen ürünler",
    aktif: true,
    siraNo: 5,
    ayarlar: { source: "new_arrivals", limit: 12 },
  },
  {
    id: "best-sellers",
    type: "product_carousel",
    baslik: "Çok Satanlar",
    altBaslik: "Müşterilerin favorileri",
    aktif: true,
    siraNo: 6,
    ayarlar: { source: "best_sellers", limit: 12 },
  },
  {
    id: "flash-sale",
    type: "product_carousel",
    baslik: "Flaş İndirim",
    altBaslik: "Sınırlı süre fırsatları",
    aktif: true,
    siraNo: 7,
    ayarlar: { source: "flash_sale", limit: 10 },
  },
  {
    id: "discounted",
    type: "product_carousel",
    baslik: "İndirimli Ürünler",
    altBaslik: "Kaçırılmayacak fiyatlar",
    aktif: true,
    siraNo: 8,
    ayarlar: { source: "discounted", limit: 12 },
  },
  {
    id: "brands",
    type: "brands",
    baslik: "Popüler Markalar",
    aktif: true,
    siraNo: 9,
  },
  {
    id: "features",
    type: "features",
    aktif: true,
    siraNo: 10,
  },
  {
    id: "newsletter",
    type: "newsletter",
    baslik: "Kampanyalardan Haberdar Olun",
    altBaslik: "Özel fırsatlar ve yeni ürünler e-posta kutunuza gelsin.",
    aktif: true,
    siraNo: 11,
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
