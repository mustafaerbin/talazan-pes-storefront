import { cache } from "react";
import { unstable_cache } from "next/cache";
import { storeService } from "@/services/store.service";
import { resolveFirmaId } from "@/lib/tenant";
import type { FirmaUrunDto, HomeProductPools, StoreConfigDto } from "@/types/api";

const STORE_CACHE_TTL_SECONDS = 60;

function withDiscount(products: FirmaUrunDto[]): FirmaUrunDto[] {
  return products.filter(
    (p) =>
      p.listeTutari != null &&
      p.satisTutari != null &&
      p.listeTutari > p.satisTutari,
  );
}

function buildProductPools(
  featured: FirmaUrunDto[],
  catalog: FirmaUrunDto[],
): HomeProductPools {
  const discounted = withDiscount([...featured, ...catalog]);
  const unique = (items: FirmaUrunDto[]) =>
    Array.from(new Map(items.map((item) => [item.id, item])).values());

  return {
    featured: unique(featured),
    newArrivals: unique(catalog),
    bestSellers: unique([...featured, ...catalog]),
    discounted: unique(discounted),
    trending: unique(catalog).slice(0, 12),
    recommended: unique([...featured].reverse()),
    flashSale: unique(discounted).slice(0, 10),
  };
}

function fallbackConfig(firmaId: number): StoreConfigDto {
  return {
    firmaId,
    firmaIsim: "Talazan Mağaza",
    aktifTemaKodu: "modern",
  };
}

const loadStoreConfig = unstable_cache(
  async (firmaId: number) => storeService.getConfig(firmaId),
  ["store-config"],
  { revalidate: STORE_CACHE_TTL_SECONDS },
);

const loadStoreCategories = unstable_cache(
  async (firmaId: number) => storeService.getCategories(firmaId),
  ["store-categories"],
  { revalidate: STORE_CACHE_TTL_SECONDS },
);

const loadStoreBrands = unstable_cache(
  async (firmaId: number) => storeService.getBrands(firmaId),
  ["store-brands"],
  { revalidate: STORE_CACHE_TTL_SECONDS },
);

const loadFeaturedProducts = unstable_cache(
  async (firmaId: number, limit: number) => storeService.getFeaturedProducts(firmaId, limit),
  ["store-featured"],
  { revalidate: STORE_CACHE_TTL_SECONDS },
);

const loadHomeCatalog = unstable_cache(
  async (firmaId: number) =>
    storeService
      .getProducts(firmaId, { page: 0, size: 24, siralama: "id,desc" })
      .then((result) => result.items),
  ["store-home-catalog"],
  { revalidate: STORE_CACHE_TTL_SECONDS },
);

const loadProductBySlug = unstable_cache(
  async (firmaId: number, slug: string) => storeService.getProductBySlug(firmaId, slug),
  ["store-product-slug"],
  { revalidate: STORE_CACHE_TTL_SECONDS },
);

const loadFaviconDataUrl = unstable_cache(
  async (src: string) => {
    const response = await fetch(src);
    if (!response.ok) return null;

    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i] ?? 0);
    const type = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
    return `data:${type};base64,${btoa(binary)}`;
  },
  ["store-favicon"],
  { revalidate: STORE_CACHE_TTL_SECONDS },
);

export const getStoreConfig = cache(async (firmaId?: number) => {
  const id = firmaId ?? (await resolveFirmaId());
  return loadStoreConfig(id);
});

export const getStoreCategories = cache(async (firmaId?: number) => {
  const id = firmaId ?? (await resolveFirmaId());
  return loadStoreCategories(id);
});

export const getStoreBrands = cache(async (firmaId?: number) => {
  const id = firmaId ?? (await resolveFirmaId());
  return loadStoreBrands(id);
});

export const getFeaturedProducts = cache(async (firmaId: number, limit = 16) => {
  return loadFeaturedProducts(firmaId, limit);
});

export const getHomeCatalog = cache(async (firmaId: number) => {
  return loadHomeCatalog(firmaId);
});

export const getProductBySlug = cache(async (firmaId: number, slug: string) => {
  return loadProductBySlug(firmaId, slug);
});

export const getFaviconDataUrl = cache(async (src: string) => {
  return loadFaviconDataUrl(src);
});

export const getStoreData = cache(async (firmaId?: number) => {
  const id = firmaId ?? (await resolveFirmaId());
  const [config, categories, brands, featured, catalog] = await Promise.all([
    getStoreConfig(id).catch(() => fallbackConfig(id)),
    getStoreCategories(id).catch(() => []),
    getStoreBrands(id).catch(() => []),
    getFeaturedProducts(id, 16).catch(() => []),
    getHomeCatalog(id).catch(() => []),
  ]);

  const productPools = buildProductPools(featured, catalog);

  return { config, categories, brands, featured, productPools, firmaId: id };
});
