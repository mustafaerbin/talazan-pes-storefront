"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAuthStorage } from "@/api/client";
import { authService } from "@/services/auth.service";
import { ORDERS_STORAGE_KEY } from "@/config/constants";
import type { LocalOrder, SiteMusteriAuthResponseDto, SiteMusteriLoginDto, SiteMusteriRegisterDto } from "@/types/api";

interface AuthUser {
  musteriId: number;
  firmaId: number;
  email: string;
  ad: string;
  soyad: string;
}

interface AuthState {
  user: AuthUser | null;
  isHydrated: boolean;
  hydrate: () => void;
  login: (payload: SiteMusteriLoginDto) => Promise<SiteMusteriAuthResponseDto>;
  register: (payload: SiteMusteriRegisterDto) => Promise<SiteMusteriAuthResponseDto>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isHydrated: false,
  hydrate: () => {
    const stored = getAuthStorage();
    set({
      user: stored
        ? {
            musteriId: stored.musteriId,
            firmaId: stored.firmaId,
            email: stored.email,
            ad: stored.ad,
            soyad: stored.soyad,
          }
        : null,
      isHydrated: true,
    });
  },
  login: async (payload) => {
    const result = await authService.login(payload);
    set({
      user: {
        musteriId: result.musteriId,
        firmaId: result.firmaId,
        email: result.email,
        ad: result.ad,
        soyad: result.soyad,
      },
    });
    return result;
  },
  register: async (payload) => {
    const result = await authService.register(payload);
    set({
      user: {
        musteriId: result.musteriId,
        firmaId: result.firmaId,
        email: result.email,
        ad: result.ad,
        soyad: result.soyad,
      },
    });
    return result;
  },
  logout: () => {
    authService.logout();
    set({ user: null });
  },
  setUser: (user) => set({ user }),
}));

interface OrdersState {
  orders: LocalOrder[];
  addOrder: (order: LocalOrder) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
    }),
    { name: ORDERS_STORAGE_KEY, skipHydration: true },
  ),
);
