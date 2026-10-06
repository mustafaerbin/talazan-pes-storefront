import { notFound } from "next/navigation";
import { StoreLayoutShell } from "@/components/layout/store-layout-shell";
import { ProductDetailView } from "@/modules/catalog/product-detail";
import { resolveFirmaId } from "@/config/env";
import { getStoreConfig } from "@/modules/store/store.server";
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const firmaId = resolveFirmaId(sp);
  try {
    const [config, product] = await Promise.all([
      getStoreConfig(firmaId),
      storeService.getProductBySlug(firmaId, slug),
    ]);
    return buildStoreMetadata(config, {
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ firmaId?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const firmaId = resolveFirmaId(sp);

  let product;
  try {
    product = await storeService.getProductBySlug(firmaId, slug);
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

  return (
    <StoreLayoutShell searchParams={searchParams}>
      <JsonLd data={buildProductJsonLd(product)} />
      <ProductDetailView product={product} related={related} />
    </StoreLayoutShell>
  );
}
