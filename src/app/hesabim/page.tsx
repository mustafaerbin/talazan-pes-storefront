import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { AccountProfile } from "@/modules/account/account-views";
import { LABELS } from "@/config/constants";
import { resolveFirmaId } from "@/lib/tenant";
import { getStoreConfig } from "@/modules/store/store.server";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata() {
  const config = await getStoreConfig(await resolveFirmaId()).catch(() => null);
  return await buildStoreMetadata(config, { title: LABELS.account, path: "/hesabim", noIndex: true });
}

export default function AccountPage() {
  return (
    <StoreLayoutShell>
      <AccountProfile />
    </StoreLayoutShell>
  );
}
