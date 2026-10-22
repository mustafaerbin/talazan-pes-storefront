import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { StoreThemeProvider } from "@/themes/provider";
import { getStoreCategories, getStoreConfig } from "@/modules/store/store.server";
import { resolveFirmaId } from "@/lib/tenant";
import type { FirmaKategoriDto } from "@/types/api";

interface StoreLayoutShellProps {
  children: React.ReactNode;
  searchParams?: Promise<{ firmaId?: string }>;
  categories?: FirmaKategoriDto[];
  fullWidth?: boolean;
}

export async function StoreLayoutShell({
  children,
  searchParams,
  categories: categoriesProp,
  fullWidth = false,
}: StoreLayoutShellProps) {
  const params = searchParams ? await searchParams : undefined;
  const firmaId = await resolveFirmaId(params);
  let config;

  try {
    config = await getStoreConfig(firmaId);
  } catch {
    config = {
      firmaId,
      firmaIsim: "Talazan Mağaza",
      aktifTemaKodu: "modern",
    };
  }

  const categories =
    categoriesProp && categoriesProp.length > 0
      ? categoriesProp
      : await getStoreCategories(firmaId).catch(() => []);

  return (
    <StoreThemeProvider
      initialThemeCode={config.aktifTemaKodu ?? config.ayarlar?.aktifTemaKodu}
      brandColors={{
        primaryColor: config.ayarlar?.primaryColor,
        secondaryColor: config.ayarlar?.secondaryColor,
        accentColor: config.ayarlar?.accentColor,
      }}
    >
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={<div className="h-28 border-b border-border bg-card" />}>
          <SiteHeader config={config} categories={categories} />
        </Suspense>
        <main className={fullWidth ? "flex-1" : "container mx-auto flex-1 px-4 py-8"}>
          {children}
        </main>
        <SiteFooter config={config} />
        <WhatsAppFab phone={config.ayarlar?.whatsappNo} storeName={config.firmaIsim} />
      </div>
    </StoreThemeProvider>
  );
}
