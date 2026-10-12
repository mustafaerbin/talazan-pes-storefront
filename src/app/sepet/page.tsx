import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { CartView } from "@/modules/cart/cart-view";
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
  return await buildStoreMetadata(config, { title: LABELS.cart, path: "/sepet" });
}

export default function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  return (
    <StoreLayoutShell searchParams={searchParams}>
      <CartView />
    </StoreLayoutShell>
  );
}
