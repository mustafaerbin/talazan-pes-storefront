import type { MetadataRoute } from "next";
import { ROUTES } from "@/config/constants";
import { getRequestSiteUrl, resolveFirmaId } from "@/lib/tenant";
import { storeService } from "@/services/store.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getRequestSiteUrl();
  const firmaId = await resolveFirmaId();
  const staticRoutes = [
    "",
    ROUTES.search,
    ROUTES.about,
    ROUTES.contact,
    ROUTES.faq,
    ROUTES.blog,
    ROUTES.privacy,
    ROUTES.terms,
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const [products, categories] = await Promise.all([
      storeService.getProducts(firmaId, { size: 100 }),
      storeService.getCategories(firmaId),
    ]);

    productRoutes = products.items
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${base}${ROUTES.product(p.slug!)}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

    categoryRoutes = categories
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${base}${ROUTES.category(c.slug!)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch {
    // API unavailable during build
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
