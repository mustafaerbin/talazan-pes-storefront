import type { FirmaUrunDto } from "@/types/api";

export interface ProductReviewItem {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  helpfulCount: number;
}

/** API bağlanana kadar ürün detay değerlendirme alanı için örnek veri. */
export function getProductReviewsMock(product: FirmaUrunDto): ProductReviewItem[] {
  const seed = product.id % 3;
  const base: ProductReviewItem[] = [
    {
      id: `${product.id}-r1`,
      userName: "Ayşe K.",
      date: "12 Mart 2026",
      rating: 5,
      comment: "Ürün beklentimi karşıladı, paketleme özenliydi. Hızlı kargo için teşekkürler.",
      helpfulCount: 18 + seed,
    },
    {
      id: `${product.id}-r2`,
      userName: "Mehmet T.",
      date: "3 Şubat 2026",
      rating: 4,
      comment: "Kalite fiyatına göre iyi. Kurulum / kullanım tarafında küçük bir detay dışında sorunsuz.",
      helpfulCount: 9,
    },
    {
      id: `${product.id}-r3`,
      userName: "Zeynep A.",
      date: "20 Ocak 2026",
      rating: 5,
      comment: `${product.isim.slice(0, 40)}… tam ihtiyacım olan üründü. Tekrar alırım.`,
      helpfulCount: 5,
    },
  ];
  return base;
}

export function getReviewSummary(reviews: ProductReviewItem[]) {
  if (!reviews.length) {
    return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] as number[] };
  }
  const distribution = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const r of reviews) {
    const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    distribution[idx]++;
    sum += r.rating;
  }
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
    distribution,
  };
}

