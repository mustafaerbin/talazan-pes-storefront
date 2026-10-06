import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { AccountProfile } from "@/modules/account/account-views";
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
  return buildStoreMetadata(config, { title: LABELS.account, path: "/hesabim", noIndex: true });
}

export default function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  return (
    <StoreLayoutShell searchParams={searchParams}>
      <AccountProfile />
    </StoreLayoutShell>
  );
}
