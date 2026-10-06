import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContentPage } from "@/modules/content/content-page";
import { LABELS, PAGE_SLUGS, ROUTES } from "@/config/constants";
import { resolveFirmaId } from "@/config/env";
import { getStoreConfig } from "@/modules/store/store.server";
import { storeService } from "@/services/store.service";
import { JsonLd } from "@/components/seo/json-ld";
import { buildStoreMetadata, buildWebPageJsonLd } from "@/utils/seo";

async function getPageOrNull(firmaId: number, slug: string) {
  try {
    return await storeService.getPage(firmaId, slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const firmaId = resolveFirmaId(sp);
  const [config, page] = await Promise.all([
    getStoreConfig(firmaId).catch(() => null),
    getPageOrNull(firmaId, PAGE_SLUGS.about),
  ]);
  return buildStoreMetadata(config, {
    title: page?.metaTitle ?? page?.baslik ?? LABELS.about,
    description: page?.metaDescription,
    path: ROUTES.about,
  });
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const firmaId = resolveFirmaId(sp);
  const [config, page] = await Promise.all([
    getStoreConfig(firmaId).catch(() => null),
    getPageOrNull(firmaId, PAGE_SLUGS.about),
  ]);

  return (
    <StoreLayoutShell searchParams={searchParams}>
      {page && config && <JsonLd data={buildWebPageJsonLd(page, config)} />}
      <div className="mx-auto max-w-4xl space-y-6">
        <Breadcrumbs items={[{ label: LABELS.about }]} />
        {page ? (
          <ContentPage page={page} />
        ) : (
          <article className="space-y-4">
            <h1 className="text-3xl font-bold">{LABELS.about}</h1>
            <p className="leading-relaxed text-muted-foreground">
              Premium kalite ürünler sunan online mağazamıza hoş geldiniz. Müşteri memnuniyetini
              ön planda tutarak güvenli alışveriş deneyimi sağlıyoruz.
            </p>
          </article>
        )}
      </div>
    </StoreLayoutShell>
  );
}
