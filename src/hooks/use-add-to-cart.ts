"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { productToCartPayload } from "@/lib/cart-item";
import type { CartItem, FirmaUrunDto } from "@/types/api";

export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useSidePanelStore((s) => s.openCart);

  const addProduct = (product: FirmaUrunDto, adet = 1) => {
    addItem(productToCartPayload(product), adet);
    openCart();
  };

  const addPayload = (item: Omit<CartItem, "adet">, adet = 1) => {
    addItem(item, adet);
    openCart();
  };

  return { addProduct, addPayload };
}
