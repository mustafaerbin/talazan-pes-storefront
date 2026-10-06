import type { Metadata } from "next";
import type { FirmaUrunDto, SiteSayfaDto, StoreConfigDto } from "@/types/api";
import { env } from "@/config/env";

export function buildStoreMetadata(
  config: StoreConfigDto | null,
  overrides?: {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    noIndex?: boolean;
  },
): Metadata {
  const seo = config?.seo;
  const ayarlar = config?.ayarlar;
  const title = overrides?.title ?? seo?.metaTitle ?? ayarlar?.siteBaslik ?? config?.firmaIsim ?? "Talazan Mağaza";
  const description =
    overrides?.description ?? seo?.metaDescription ?? ayarlar?.siteAciklama ?? "Premium e-ticaret mağazası";
  const url = `${env.siteUrl}${overrides?.path ?? ""}`;
  const image = overrides?.image ?? seo?.ogImageUrl ?? ayarlar?.logoUrl;
  const favicon = ayarlar?.faviconUrl;

  return {
    title,
    description,
    keywords: seo?.metaKeywords?.split(",").map((k) => k.trim()),
    metadataBase: new URL(env.siteUrl),
    icons: favicon
      ? {
          icon: favicon,
          shortcut: favicon,
          apple: favicon,
        }
      : undefined,
    alternates: {
      canonical: seo?.canonicalUrl ?? url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: config?.firmaIsim,
      images: image ? [{ url: image }] : undefined,
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: seo?.twitterHandle,
      images: image ? [image] : undefined,
    },
    robots: overrides?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildProductJsonLd(product: FirmaUrunDto) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.isim,
    description: product.aciklama,
    image: product.resim,
    sku: product.stokKodu ?? product.urunKodu,
    brand: product.firmaMarkaIsim
      ? { "@type": "Brand", name: product.firmaMarkaIsim }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: product.paraBirimi ?? "TRY",
      price: product.satisTutari,
      availability:
        (product.stokMiktari ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${env.siteUrl}/urun/${product.slug ?? product.id}`,
    },
  };
}

export function buildOrganizationJsonLd(config: StoreConfigDto) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.firmaIsim,
    url: env.siteUrl,
    logo: config.ayarlar?.logoUrl,
    contactPoint: config.ayarlar?.iletisimTelefon
      ? {
          "@type": "ContactPoint",
          telephone: config.ayarlar.iletisimTelefon,
          contactType: "customer service",
          email: config.ayarlar.iletisimEmail,
        }
      : undefined,
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; item?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function buildWebPageJsonLd(page: SiteSayfaDto, config: StoreConfigDto) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.baslik,
    description: page.metaDescription,
    url: `${env.siteUrl}/${page.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: config.firmaIsim,
      url: env.siteUrl,
    },
  };
}
