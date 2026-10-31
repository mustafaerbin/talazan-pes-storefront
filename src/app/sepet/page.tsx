import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { CartView } from "@/modules/cart/cart-view";
import { LABELS } from "@/config/constants";
import { resolveFirmaId } from "@/lib/tenant";
import { getStoreConfig } from "@/modules/store/store.server";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata() {
  const config = await getStoreConfig(await resolveFirmaId()).catch(() => null);
  return await buildStoreMetadata(config, { title: LABELS.cart, path: "/sepet" });
}

export default function CartPage() {
  return (
    <StoreLayoutShell>
      <CartView />
    </StoreLayoutShell>
  );
}
