import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContentPage } from "@/modules/content/content-page";
import { LABELS, PAGE_SLUGS, ROUTES } from "@/config/constants";
import { resolveFirmaId } from "@/config/env";
import { getStoreConfig } from "@/modules/store/store.server";
import { storeService } from "@/services/store.service";
import { buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const config = await getStoreConfig(resolveFirmaId(sp)).catch(() => null);
  return buildStoreMetadata(config, { title: LABELS.privacy, path: ROUTES.privacy });
}

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const firmaId = resolveFirmaId(sp);
  let page = null;
  try {
    page = await storeService.getPage(firmaId, PAGE_SLUGS.privacy);
  } catch {
    // fallback
  }

  return (
    <StoreLayoutShell searchParams={searchParams}>
      <div className="mx-auto max-w-4xl space-y-6">
        <Breadcrumbs items={[{ label: LABELS.privacy }]} />
        {page ? (
          <ContentPage page={page} />
        ) : (
          <article className="space-y-4">
            <h1 className="text-3xl font-bold">{LABELS.privacy}</h1>
            <p className="leading-relaxed text-muted-foreground">
              Kişisel verileriniz 6698 sayılı KVKK kapsamında korunmaktadır. Toplanan veriler yalnızca
              sipariş süreçleri ve müşteri hizmetleri amacıyla kullanılır.
            </p>
          </article>
        )}
      </div>
    </StoreLayoutShell>
  );
}
