import type { CartItem, FirmaUrunDto } from "@/types/api";

export function productToCartPayload(product: FirmaUrunDto): Omit<CartItem, "adet"> {
  return {
    urunId: product.id,
    isim: product.isim,
    slug: product.slug,
    resim: product.resim,
    birimFiyat: product.satisTutari ?? 0,
    stokMiktari: product.stokMiktari,
    listeTutari: product.listeTutari,
    renk: product.renk,
    beden: product.beden,
  };
}
