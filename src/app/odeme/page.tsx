import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { CheckoutView } from "@/modules/checkout/checkout-view";
import { LABELS } from "@/config/constants";
import { resolveFirmaId } from "@/config/env";
import { getStoreConfig } from "@/modules/store/store.server";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const config = await getStoreConfig(resolveFirmaId(sp)).catch(() => null);
  return buildStoreMetadata(config, { title: LABELS.checkout, path: "/odeme" });
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  return (
    <StoreLayoutShell searchParams={searchParams}>
      <CheckoutView />
    </StoreLayoutShell>
  );
}
