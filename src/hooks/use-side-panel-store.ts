"use client";

import { create } from "zustand";

export type SidePanelMode = "cart" | "favorites" | "login" | "register" | "contact" | "address";

export interface ContactPanelDetails {
  phone?: string;
  email?: string;
}

interface SidePanelState {
  mode: SidePanelMode | null;
  contact: ContactPanelDetails | null;
  openCart: () => void;
  openFavorites: () => void;
  openLogin: () => void;
  openRegister: () => void;
  openContact: (details?: ContactPanelDetails) => void;
  openAddress: () => void;
  close: () => void;
}

export const useSidePanelStore = create<SidePanelState>((set) => ({
  mode: null,
  contact: null,
  openCart: () => set({ mode: "cart" }),
  openFavorites: () => set({ mode: "favorites" }),
  openLogin: () => set({ mode: "login" }),
  openRegister: () => set({ mode: "register" }),
  openContact: (details) => set({ mode: "contact", contact: details ?? null }),
  openAddress: () => set({ mode: "address" }),
  close: () => set({ mode: null }),
}));
