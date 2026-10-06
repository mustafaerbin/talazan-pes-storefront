import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StoreThemeProvider } from "@/themes/provider";
import { getStoreConfig } from "@/modules/store/store.server";
import { resolveFirmaId } from "@/config/env";
import { storeService } from "@/services/store.service";
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
  const firmaId = resolveFirmaId(params);
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
      : await storeService.getCategories(firmaId).catch(() => []);

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
        <SiteHeader config={config} categories={categories} />
        <main className={fullWidth ? "flex-1" : "container mx-auto flex-1 px-4 py-8"}>
          {children}
        </main>
        <SiteFooter config={config} />
      </div>
    </StoreThemeProvider>
  );
}
