import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { OrderConfirmation } from "@/modules/checkout/order-confirmation";
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
  return await buildStoreMetadata(config, { title: "Sipariş onayı", path: "/siparis-onay", noIndex: true });
}

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  return (
    <StoreLayoutShell searchParams={searchParams}>
      <OrderConfirmation />
    </StoreLayoutShell>
  );
}
