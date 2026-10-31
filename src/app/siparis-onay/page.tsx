import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { OrderConfirmation } from "@/modules/checkout/order-confirmation";
import { resolveFirmaId } from "@/lib/tenant";
import { getStoreConfig } from "@/modules/store/store.server";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata() {
  const config = await getStoreConfig(await resolveFirmaId()).catch(() => null);
  return await buildStoreMetadata(config, { title: "Sipariş onayı", path: "/siparis-onay", noIndex: true });
}

export default function OrderConfirmationPage() {
  return (
    <StoreLayoutShell>
      <OrderConfirmation />
    </StoreLayoutShell>
  );
}
