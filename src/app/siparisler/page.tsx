import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { OrdersView } from "@/modules/account/account-views";
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
  return buildStoreMetadata(config, { title: LABELS.orders, path: "/siparisler", noIndex: true });
}

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  return (
    <StoreLayoutShell searchParams={searchParams}>
      <OrdersView />
    </StoreLayoutShell>
  );
}
