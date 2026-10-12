"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyThemeVars, resolveThemeCode, type ThemeDefinition, themes } from "@/themes/registry";
import type { ThemeCode } from "@/types/api";

interface StoreThemeContextValue {
  themeCode: ThemeCode;
  theme: ThemeDefinition;
  cssVars: Record<string, string>;
  setThemeCode: (code: ThemeCode) => void;
}

const StoreThemeContext = createContext<StoreThemeContextValue | null>(null);

interface StoreThemeProviderProps {
  children: React.ReactNode;
  initialThemeCode?: string | null;
  brandColors?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}

export function StoreThemeProvider({
  children,
  initialThemeCode,
  brandColors,
}: StoreThemeProviderProps) {
  const [themeCode, setThemeCode] = useState<ThemeCode>(() => resolveThemeCode(initialThemeCode));

  useEffect(() => {
    if (initialThemeCode) {
      setThemeCode(resolveThemeCode(initialThemeCode));
    }
  }, [initialThemeCode]);

  const cssVars = useMemo(
    () => applyThemeVars(themeCode, brandColors),
    [themeCode, brandColors],
  );

  const theme = themes[themeCode];

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.classList.remove("theme-dark-override", "dark");
  }, [cssVars]);

  return (
    <StoreThemeContext.Provider value={{ themeCode, theme, cssVars, setThemeCode }}>
      {children}
    </StoreThemeContext.Provider>
  );
}

export function useStoreTheme() {
  const context = useContext(StoreThemeContext);
  if (!context) {
    throw new Error("useStoreTheme must be used within StoreThemeProvider");
  }
  return context;
}
