import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { HomeSections } from "@/modules/home/home-sections";
import { parseHomeSectionsFromConfig } from "@/modules/home/home-sections.config";
import { getStoreData } from "@/modules/store/store.server";
import { resolveFirmaId } from "@/config/env";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationJsonLd, buildStoreMetadata } from "@/utils/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const params = await searchParams;
  const firmaId = resolveFirmaId(params);
  try {
    const { config } = await getStoreData(firmaId);
    return buildStoreMetadata(config);
  } catch {
    return buildStoreMetadata(null);
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const params = await searchParams;
  const firmaId = resolveFirmaId(params);
  const { config, categories, brands, productPools } = await getStoreData(firmaId);
  const sections = parseHomeSectionsFromConfig(config.header?.ekAyarlar);

  return (
    <StoreLayoutShell searchParams={searchParams} categories={categories} fullWidth>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <JsonLd data={buildOrganizationJsonLd(config)} />
        <HomeSections
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
