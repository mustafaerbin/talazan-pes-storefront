import { Suspense } from "react";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { ProductListing } from "@/modules/catalog/product-listing";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { LABELS } from "@/config/constants";
import { resolveFirmaId } from "@/config/env";
import { getStoreConfig } from "@/modules/store/store.server";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const firmaId = resolveFirmaId(sp);
  const config = await getStoreConfig(firmaId).catch(() => null);
  const q = sp.q ? `"${sp.q}"` : "";
  return buildStoreMetadata(config, {
    title: q ? `${q} - ${LABELS.search}` : LABELS.search,
    path: "/ara",
  });
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  return (
    <StoreLayoutShell searchParams={searchParams}>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing title={LABELS.search} />
      </Suspense>
    </StoreLayoutShell>
  );
}
