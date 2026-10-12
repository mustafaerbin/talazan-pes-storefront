import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { FavoritesView } from "@/modules/account/account-views";
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
  return await buildStoreMetadata(config, { title: LABELS.favorites, path: "/favoriler", noIndex: true });
}

export default function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  return (
    <StoreLayoutShell searchParams={searchParams}>
      <FavoritesView />
    </StoreLayoutShell>
  );
}
