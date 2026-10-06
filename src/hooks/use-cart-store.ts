"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/config/constants";
import type { CartItem } from "@/types/api";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "adet">, adet?: number) => void;
  removeItem: (urunId: number) => void;
  updateQuantity: (urunId: number, adet: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, adet = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.urunId === item.urunId);
          if (existing) {
            const newAdet = Math.min(
              (existing.adet ?? 0) + adet,
              item.stokMiktari ?? existing.stokMiktari ?? 999,
            );
            return {
              items: state.items.map((i) =>
                i.urunId === item.urunId ? { ...i, adet: newAdet } : i,
              ),
            };
          }
          return {
            items: [...state.items, { ...item, adet }],
          };
        });
      },
      removeItem: (urunId) => {
        set((state) => ({
          items: state.items.filter((i) => i.urunId !== urunId),
        }));
      },
      updateQuantity: (urunId, adet) => {
        if (adet <= 0) {
          get().removeItem(urunId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.urunId !== urunId) return i;
            const max = i.stokMiktari ?? 999;
            return { ...i, adet: Math.min(adet, max) };
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.adet, 0),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.birimFiyat * i.adet, 0),
    }),
    { name: CART_STORAGE_KEY, skipHydration: true },
  ),
);
