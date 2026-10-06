import { Suspense } from "react";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { ProductListing } from "@/modules/catalog/product-listing";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { resolveFirmaId } from "@/config/env";
import { getStoreConfig } from "@/modules/store/store.server";
import { storeService } from "@/services/store.service";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const firmaId = resolveFirmaId(sp);
  const config = await getStoreConfig(firmaId).catch(() => null);
  const categories = await storeService.getCategories(firmaId).catch(() => []);
  const category = categories.find((c) => c.slug === slug || String(c.id) === slug);
  return buildStoreMetadata(config, {
    title: category?.isim ?? slug,
    path: `/kategori/${slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const firmaId = resolveFirmaId(sp);
  const categories = await storeService.getCategories(firmaId).catch(() => []);
  const category = categories.find((c) => c.slug === slug || String(c.id) === slug);

  return (
    <StoreLayoutShell searchParams={searchParams} categories={categories}>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing
          title={category?.isim ?? "Kategori"}
          initialFilters={{ kategoriId: category?.id }}
        />
      </Suspense>
    </StoreLayoutShell>
  );
}
