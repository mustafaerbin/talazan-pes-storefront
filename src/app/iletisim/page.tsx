import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "@/modules/content/contact-form";
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
  const firmaId = resolveFirmaId(sp);
  const config = await getStoreConfig(firmaId).catch(() => null);
  return buildStoreMetadata(config, { title: LABELS.contact, path: ROUTES.contact });
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const sp = await searchParams;
  const firmaId = resolveFirmaId(sp);
  const config = await getStoreConfig(firmaId).catch(() => null);
  let page = null;
  try {
    page = await storeService.getPage(firmaId, PAGE_SLUGS.contact);
  } catch {
    // fallback
  }

  return (
    <StoreLayoutShell searchParams={searchParams}>
      <div className="mx-auto max-w-4xl space-y-8">
        <Breadcrumbs items={[{ label: LABELS.contact }]} />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{LABELS.contactUs}</h1>
          {config?.ayarlar?.iletisimEmail && (
            <p className="text-muted-foreground">{config.ayarlar.iletisimEmail}</p>
          )}
        </div>
        {page && <ContentPage page={page} />}
        <ContactForm />
      </div>
    </StoreLayoutShell>
  );
}
