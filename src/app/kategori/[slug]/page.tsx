import { Suspense } from "react";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { ProductListing } from "@/modules/catalog/product-listing";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { resolveFirmaId } from "@/lib/tenant";
import { getStoreCategories, getStoreConfig } from "@/modules/store/store.server";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const firmaId = await resolveFirmaId();
  const config = await getStoreConfig(firmaId).catch(() => null);
  const categories = await getStoreCategories(firmaId).catch(() => []);
  const category = categories.find((c) => c.slug === slug || String(c.id) === slug);
  return await buildStoreMetadata(config, {
    title: category?.isim ?? slug,
    path: `/kategori/${slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const firmaId = await resolveFirmaId();
  const categories = await getStoreCategories(firmaId).catch(() => []);
  const category = categories.find((c) => c.slug === slug || String(c.id) === slug);

  return (
    <StoreLayoutShell categories={categories}>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing
          title={category?.isim ?? "Kategori"}
          initialFilters={{ kategoriId: category?.id }}
          initialCategories={categories}
        />
      </Suspense>
    </StoreLayoutShell>
  );
}
