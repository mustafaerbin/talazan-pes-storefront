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
  return buildStoreMetadata(config, { title: LABELS.terms, path: ROUTES.terms });
}

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const firmaId = resolveFirmaId(sp);
  let page = null;
  try {
    page = await storeService.getPage(firmaId, PAGE_SLUGS.terms);
  } catch {
    // fallback
  }

  return (
    <StoreLayoutShell searchParams={searchParams}>
      <div className="mx-auto max-w-4xl space-y-6">
        <Breadcrumbs items={[{ label: LABELS.terms }]} />
        {page ? (
          <ContentPage page={page} />
        ) : (
          <article className="space-y-4">
            <h1 className="text-3xl font-bold">{LABELS.terms}</h1>
            <p className="leading-relaxed text-muted-foreground">
              Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Siparişler,
              teslimat ve iade süreçleri ilgili mevzuata uygun şekilde yürütülür.
            </p>
          </article>
        )}
      </div>
    </StoreLayoutShell>
  );
}
