import { storeService } from "@/services/store.service";
import { resolveFirmaId } from "@/config/env";
import type { FirmaUrunDto, HomeProductPools, StoreConfigDto } from "@/types/api";

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

export async function getStoreConfig(firmaId?: number) {
  const id = firmaId ?? resolveFirmaId();
  return storeService.getConfig(id);
}

export async function getStoreData(firmaId?: number) {
  const id = firmaId ?? resolveFirmaId();
  const [config, categories, brands, featured, catalog] = await Promise.all([
    storeService.getConfig(id).catch(() => fallbackConfig(id)),
    storeService.getCategories(id).catch(() => []),
    storeService.getBrands(id).catch(() => []),
    storeService.getFeaturedProducts(id, 16).catch(() => []),
    storeService
      .getProducts(id, { page: 0, size: 24, siralama: "id,desc" })
      .then((r) => r.items)
      .catch(() => []),
  ]);

  const productPools = buildProductPools(featured, catalog);

  return { config, categories, brands, featured, productPools, firmaId: id };
}
