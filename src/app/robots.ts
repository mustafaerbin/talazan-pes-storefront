import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { getStoreConfig } from "@/modules/store/store.server";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let robotsTxt: string | undefined;
  try {
    const config = await getStoreConfig(env.firmaId);
    robotsTxt = config.seo?.robotsTxt;
  } catch {
    // default
  }

  if (robotsTxt) {
    const disallow = robotsTxt
      .split("\n")
      .filter((line) => line.startsWith("Disallow:"))
      .map((line) => line.replace("Disallow:", "").trim())
      .filter(Boolean);

    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: disallow.length > 0 ? disallow : ["/hesabim", "/giris", "/kayit", "/odeme"],
      },
      sitemap: `${env.siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/hesabim", "/giris", "/kayit", "/odeme", "/adresler", "/favoriler", "/siparisler"],
    },
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
