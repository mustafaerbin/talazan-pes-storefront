import { notFound } from "next/navigation";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { ProductDetailView } from "@/modules/catalog/product-detail";
import { getRequestSiteUrl, resolveFirmaId } from "@/lib/tenant";
import { getProductBySlug, getStoreConfig } from "@/modules/store/store.server";
import { storeService } from "@/services/store.service";
import { JsonLd } from "@/components/seo/json-ld";
import { buildProductJsonLd, buildStoreMetadata } from "@/utils/seo";

function plainDescription(html?: string): string | undefined {
  if (!html) return undefined;
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.slice(0, 180) : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const firmaId = await resolveFirmaId();
  try {
    const [config, product] = await Promise.all([
      getStoreConfig(firmaId),
      getProductBySlug(firmaId, slug),
    ]);
    return await buildStoreMetadata(config, {
      title: product.isim,
      description: plainDescription(product.aciklama),
      path: `/urun/${slug}`,
      image: product.resim,
    });
  } catch {
    return { title: "Ürün Bulunamadı" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const firmaId = await resolveFirmaId();

  let product;
  try {
    product = await getProductBySlug(firmaId, slug);
  } catch {
    notFound();
  }

  const related = product.firmaKategoriId
    ? (
        await storeService
          .getProducts(firmaId, { kategoriId: product.firmaKategoriId, size: 4 })
          .catch(() => ({ items: [] }))
      ).items.filter((p) => p.id !== product.id)
    : [];

  const siteUrl = await getRequestSiteUrl();

  return (
    <StoreLayoutShell>
      <JsonLd data={await buildProductJsonLd(product, siteUrl)} />
      <ProductDetailView product={product} related={related} />
    </StoreLayoutShell>
  );
}
