"use client";

import { create } from "zustand";

export type SidePanelMode = "cart" | "favorites";

interface SidePanelState {
  mode: SidePanelMode | null;
  openCart: () => void;
  openFavorites: () => void;
  close: () => void;
}

export const useSidePanelStore = create<SidePanelState>((set) => ({
  mode: null,
  openCart: () => set({ mode: "cart" }),
  openFavorites: () => set({ mode: "favorites" }),
  close: () => set({ mode: null }),
}));
