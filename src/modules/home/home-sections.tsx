"use client";

import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { PromotionBanner } from "@/components/home/promotion-banner";
import { FeaturesSection } from "@/components/home/features-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { SectionHeader } from "@/components/home/section-header";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { LABELS, ROUTES } from "@/config/constants";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type {
  FirmaKategoriDto,
  FirmaMarkaDto,
  FirmaUrunDto,
  HomeProductPools,
  HomeSection,
  ProductCarouselSource,
  PromotionCard,
  StoreConfigDto,
} from "@/types/api";

interface HomeSectionsProps {
  firmaId: number;
  config: StoreConfigDto;
  sections: HomeSection[];
  productPools: HomeProductPools;
  categories: FirmaKategoriDto[];
  brands: FirmaMarkaDto[];
  loading?: boolean;
}

function HomeProductFeed({
  title,
  subtitle,
  viewAllHref,
  products,
  loading = false,
}: {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  products: FirmaUrunDto[];
  loading?: boolean;
}) {
  const { addProduct } = useAddToCart();
  if (!loading && products.length === 0) return null;

  return (
    <section className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} href={viewAllHref} linkLabel="Tüm ürünleri gör" />
      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addProduct} />
          ))}
        </div>
      )}
    </section>
  );
}

function resolveProducts(
  source: ProductCarouselSource | undefined,
  pools: HomeProductPools,
  limit = 12,
): FirmaUrunDto[] {
  const pool = source ? pools[mapSourceToPoolKey(source)] : pools.featured;
  return pool.slice(0, limit);
}

function mapSourceToPoolKey(source: ProductCarouselSource): keyof HomeProductPools {
  const map: Record<ProductCarouselSource, keyof HomeProductPools> = {
    featured: "featured",
    new_arrivals: "newArrivals",
    best_sellers: "bestSellers",
    discounted: "discounted",
    trending: "trending",
    recommended: "recommended",
    flash_sale: "flashSale",
  };
  return map[source];
}

function viewAllForSource(source?: ProductCarouselSource): string {
  switch (source) {
    case "new_arrivals":
      return ROUTES.catalog("yeni");
    case "best_sellers":
      return ROUTES.catalog("cok-satan");
    case "discounted":
    case "flash_sale":
      return ROUTES.catalog("indirimli");
    default:
      return ROUTES.search;
  }
}

export function HomeSections({
  config,
  sections,
  productPools,
  categories,
  brands,
  loading,
}: HomeSectionsProps) {
  const activeSections = sections.filter((section) => section.aktif);
  const hasHero = activeSections.some((section) => section.type === "hero");

  return (
    <div className="pb-16">
      {activeSections.map((section) => {
          switch (section.type) {
            case "hero":
              return (
                <div key={section.id}>
                  <HeroSection
                    section={section}
                    config={config}
                    categories={categories}
                    featured={productPools.featured}
                  />
                  <CategoryGrid categories={categories} />
                </div>
              );

            case "featured":
            case "product_carousel": {
              const source = section.ayarlar?.source ?? "featured";
              const limit = Number(section.ayarlar?.limit ?? 12);
              return (
                <div key={section.id} className="container mx-auto px-4 py-12">
                  <HomeProductFeed
                    title={section.baslik ?? "Ürünleri keşfedin"}
                    subtitle={section.altBaslik}
                    viewAllHref={viewAllForSource(source)}
                    products={resolveProducts(source, productPools, limit)}
                    loading={loading}
                  />
                </div>
              );
            }

            case "categories":
              return hasHero ? null : (
                <CategoryGrid
                  key={section.id}
                  categories={categories}
                  title={section.baslik ?? LABELS.categories}
                  subtitle={section.altBaslik}
                />
              );

            case "brands":
              return brands.length > 0 ? (
                <section key={section.id} className="container mx-auto space-y-6 px-4 py-12">
                  <SectionHeader
                    title={section.baslik ?? LABELS.brands}
                    subtitle={section.altBaslik}
                    href={ROUTES.catalog("markalar")}
                  />
                  <div className="flex gap-6 overflow-x-auto py-2 scrollbar-hide md:flex-wrap md:justify-center md:overflow-visible">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`${ROUTES.search}?markaId=${brand.id}`}
                        className="shrink-0 text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {brand.isim}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null;

            case "banner":
            case "promotion": {
              const promotions = ((section.ayarlar?.promotions ?? []) as PromotionCard[]).filter(
                (item) => item.resimUrl,
              );
              return promotions.length ? (
                <div key={section.id} className="container mx-auto px-4 py-8">
                  <PromotionBanner promotions={promotions} />
                </div>
              ) : null;
            }

            case "features":
              return (
                <div key={section.id} className="container mx-auto px-4">
                  <FeaturesSection />
                </div>
              );

            case "newsletter":
              return (
                <div key={section.id} className="container mx-auto px-4 py-8">
                  <NewsletterSection
                    title={section.baslik}
                    subtitle={section.altBaslik}
                  />
                </div>
              );

            default:
              return null;
          }
        })}

      {!activeSections.some((s) => s.type === "featured" || s.type === "product_carousel") && (
        <div className="container mx-auto px-4 py-12">
          <HomeProductFeed
            title="Ürünleri keşfedin"
            viewAllHref={ROUTES.search}
            products={productPools.featured.slice(0, 8)}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
