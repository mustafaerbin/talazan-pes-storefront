import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { HomeSections } from "@/modules/home/home-sections";
import { parseHomeSectionsFromConfig } from "@/modules/home/home-sections.config";
import { getStoreData } from "@/modules/store/store.server";
import { getRequestSiteUrl, resolveFirmaId } from "@/lib/tenant";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationJsonLd, buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const params = await searchParams;
  const firmaId = await resolveFirmaId(params);
  try {
    const { config } = await getStoreData(firmaId);
    return await buildStoreMetadata(config);
  } catch {
    return await buildStoreMetadata(null);
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const params = await searchParams;
  const firmaId = await resolveFirmaId(params);
  const { config, categories, brands, productPools } = await getStoreData(firmaId);
  const sections = parseHomeSectionsFromConfig(config.header?.ekAyarlar);
  const siteUrl = await getRequestSiteUrl();

  return (
    <StoreLayoutShell searchParams={searchParams} categories={categories} fullWidth>
      <div className="container mx-auto px-4 py-6">
        <JsonLd data={buildOrganizationJsonLd(config, siteUrl)} />
        <HomeSections
          firmaId={firmaId}
          config={config}
          sections={sections}
          productPools={productPools}
          categories={categories}
          brands={brands}
        />
      </div>
    </StoreLayoutShell>
  );
}
