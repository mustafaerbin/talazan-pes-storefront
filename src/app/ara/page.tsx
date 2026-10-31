import { Suspense } from "react";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { ProductListing } from "@/modules/catalog/product-listing";
import { ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { LABELS } from "@/config/constants";
import { resolveFirmaId } from "@/lib/tenant";
import { getStoreConfig } from "@/modules/store/store.server";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const firmaId = await resolveFirmaId();
  const config = await getStoreConfig(firmaId).catch(() => null);
  const q = sp.q ? `"${sp.q}"` : "";
  return await buildStoreMetadata(config, {
    title: q ? `${q} - ${LABELS.search}` : LABELS.search,
    path: "/ara",
  });
}

export default function SearchPage() {
  return (
    <StoreLayoutShell>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing title={LABELS.search} />
      </Suspense>
    </StoreLayoutShell>
  );
}
