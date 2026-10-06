import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContentPage } from "@/modules/content/content-page";
import { FaqAccordion } from "@/modules/content/faq-accordion";
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
  return buildStoreMetadata(config, { title: LABELS.faq, path: ROUTES.faq });
}

export default async function FaqPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const firmaId = resolveFirmaId(sp);
  let page = null;
  try {
    page = await storeService.getPage(firmaId, PAGE_SLUGS.faq);
  } catch {
    // fallback
  }

  return (
    <StoreLayoutShell searchParams={searchParams}>
      <div className="mx-auto max-w-3xl space-y-8">
        <Breadcrumbs items={[{ label: LABELS.faq }]} />
        <h1 className="text-3xl font-bold">{LABELS.faq}</h1>
        {page?.icerik && !page.icerik.startsWith("[") ? (
          <ContentPage page={page} />
        ) : (
          <FaqAccordion content={page?.icerik} />
        )}
      </div>
    </StoreLayoutShell>
  );
}
