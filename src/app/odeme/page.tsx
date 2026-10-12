import { Suspense } from "react";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { CheckoutView } from "@/modules/checkout/checkout-view";
import { LABELS } from "@/config/constants";
import { resolveFirmaId } from "@/lib/tenant";
import { getStoreConfig } from "@/modules/store/store.server";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const config = await getStoreConfig(await resolveFirmaId(sp)).catch(() => null);
  return await buildStoreMetadata(config, { title: LABELS.checkout, path: "/odeme" });
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  return (
    <StoreLayoutShell searchParams={searchParams}>
      <Suspense fallback={null}>
        <CheckoutView />
      </Suspense>
    </StoreLayoutShell>
  );
}
