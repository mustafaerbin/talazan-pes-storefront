import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { LoginForm } from "@/modules/auth/auth-forms";
import { LABELS } from "@/config/constants";
import { resolveFirmaId } from "@/lib/tenant";
import { getStoreConfig } from "@/modules/store/store.server";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata() {
  const config = await getStoreConfig(await resolveFirmaId()).catch(() => null);
  return await buildStoreMetadata(config, { title: LABELS.login, path: "/giris" });
}

export default function LoginPage() {
  return (
    <StoreLayoutShell>
      <LoginForm />
    </StoreLayoutShell>
  );
}
