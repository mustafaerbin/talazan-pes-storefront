"use client";

import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductCarousel } from "@/components/home/product-carousel";
import { PromotionBanner } from "@/components/home/promotion-banner";
import { FeaturesSection } from "@/components/home/features-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/home/section-header";
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
  config: StoreConfigDto;
  sections: HomeSection[];
  productPools: HomeProductPools;
  categories: FirmaKategoriDto[];
  brands: FirmaMarkaDto[];
  loading?: boolean;
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
      return `${ROUTES.search}?sort=id,desc`;
    case "discounted":
    case "flash_sale":
      return `${ROUTES.search}?indirimli=true`;
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
  const { addProduct } = useAddToCart();

  const handleAddToCart = (product: FirmaUrunDto) => {
    addProduct(product);
  };

  return (
    <div className="space-y-16 pb-12 md:space-y-20">
      {sections
        .filter((section) => section.aktif)
        .map((section) => {
          switch (section.type) {
            case "hero":
              return (
                <HeroSection
                  key={section.id}
                  section={section}
                  config={config}
                  categories={categories}
                  featured={productPools.featured}
                />
              );

            case "featured":
            case "product_carousel": {
              const source = section.ayarlar?.source ?? "featured";
              const limit = Number(section.ayarlar?.limit ?? 12);
              const products = resolveProducts(source, productPools, limit);
              return (
                <ProductCarousel
                  key={section.id}
                  title={section.baslik ?? LABELS.featuredProducts}
                  subtitle={section.altBaslik}
                  products={products}
                  viewAllHref={viewAllForSource(source)}
                  loading={loading}
                  onAddToCart={handleAddToCart}
                  variant={source === "flash_sale" ? "flash" : "default"}
                />
              );
            }

            case "categories":
              return (
                <CategoryGrid
                  key={section.id}
                  categories={categories}
                  title={section.baslik ?? LABELS.categories}
                  subtitle={section.altBaslik}
                />
              );

            case "brands":
              return brands.length > 0 ? (
                <section key={section.id} className="space-y-6">
                  <SectionHeader
                    title={section.baslik ?? LABELS.brands}
                    subtitle={section.altBaslik}
                    href={ROUTES.search}
                  />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`${ROUTES.search}?markaId=${brand.id}`}
                        className="rounded-[var(--radius-card)] border border-border bg-card px-5 py-6 text-center text-sm font-bold shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:text-primary hover:shadow-hover"
                      >
                        {brand.isim}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null;

            case "banner":
            case "promotion": {
              const promotions = (section.ayarlar?.promotions ?? []) as PromotionCard[];
              return promotions.length ? (
                <PromotionBanner key={section.id} promotions={promotions} />
              ) : null;
            }

            case "features":
              return <FeaturesSection key={section.id} />;

            case "newsletter":
              return (
                <NewsletterSection
                  key={section.id}
                  title={section.baslik}
                  subtitle={section.altBaslik}
                />
              );

            default:
              return null;
          }
        })}

      {!sections.some((s) => s.aktif && (s.type === "featured" || s.type === "product_carousel")) &&
        productPools.featured.length > 0 && (
          <section className="space-y-6">
            <SectionHeader title={LABELS.featuredProducts} href={ROUTES.search} />
            {loading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {productPools.featured.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    showQuickActions
                  />
                ))}
              </div>
            )}
          </section>
        )}
    </div>
  );
}
