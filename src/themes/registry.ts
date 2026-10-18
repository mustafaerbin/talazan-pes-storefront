import type { CSSProperties } from "react";
import type { ThemeCode } from "@/types/api";

export interface ThemeDefinition {
  code: ThemeCode;
  name: string;
  description: string;
  previewGradient: string;
  cssVars: Record<string, string>;
}

const talazanVars = {
  "--background": "0 0% 100%",
  "--foreground": "0 0% 14%",
  "--card": "0 0% 100%",
  "--card-foreground": "0 0% 14%",
  "--primary": "0 0% 14%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "60 10% 97%",
  "--secondary-foreground": "0 0% 14%",
  "--muted": "60 10% 97%",
  "--muted-foreground": "0 0% 42%",
  "--accent": "60 10% 97%",
  "--accent-foreground": "0 0% 14%",
  "--border": "60 4% 90%",
  "--input": "60 4% 90%",
  "--ring": "0 0% 14%",
  "--hero-bg": "0 0% 10%",
  "--topbar-bg": "0 0% 100%",
  "--topbar-fg": "0 0% 42%",
  "--destructive": "0 0% 14%",
};

const baseVars = {
  "--radius-btn": "6px",
  "--radius-input": "6px",
  "--radius-card": "8px",
  "--radius-hero": "0px",
  "--radius-section": "0px",
  "--radius": "0.375rem",
  "--font-display": "var(--font-jakarta)",
  ...talazanVars,
};

export const themes: Record<ThemeCode, ThemeDefinition> = {
  minimal: {
    code: "minimal",
    name: "Minimal",
    description: "Sade ve temiz Shopify tarzı mağaza",
    previewGradient: "linear-gradient(135deg, #fafafa 0%, #e4e4e7 100%)",
    cssVars: {
      ...baseVars,
    },
  },
  modern: {
    code: "modern",
    name: "Modern",
    description: "Talazan premium SaaS commerce görünümü",
    previewGradient: "linear-gradient(135deg, #F7F7F5 0%, #242424 100%)",
    cssVars: {
      ...baseVars,
    },
  },
  fashion: {
    code: "fashion",
    name: "Fashion",
    description: "Zarif tipografi ve geniş boşluklar",
    previewGradient: "linear-gradient(135deg, #1a1a1a 0%, #d4af37 100%)",
    cssVars: {
      ...baseVars,
      "--radius": "0.25rem",
      "--background": "0 0% 100%",
      "--foreground": "0 0% 9%",
      "--card": "0 0% 100%",
      "--card-foreground": "0 0% 9%",
      "--primary": "0 0% 9%",
      "--primary-foreground": "0 0% 98%",
      "--secondary": "40 30% 96%",
      "--secondary-foreground": "0 0% 9%",
      "--muted": "0 0% 96%",
      "--muted-foreground": "0 0% 45%",
      "--accent": "43 74% 49%",
      "--accent-foreground": "0 0% 9%",
      "--border": "0 0% 90%",
      "--input": "0 0% 90%",
      "--ring": "43 74% 49%",
      "--hero-bg": "40 30% 96%",
    },
  },
  electronics: {
    code: "electronics",
    name: "Electronics",
    description: "Teknoloji odaklı koyu vurgular",
    previewGradient: "linear-gradient(135deg, #0f172a 0%, #06b6d4 100%)",
    cssVars: {
      ...baseVars,
      "--background": "222 47% 6%",
      "--foreground": "210 40% 98%",
      "--card": "222 47% 8%",
      "--card-foreground": "210 40% 98%",
      "--primary": "187 85% 43%",
      "--primary-foreground": "222 47% 6%",
      "--secondary": "217 33% 17%",
      "--secondary-foreground": "210 40% 98%",
      "--muted": "217 33% 17%",
      "--muted-foreground": "215 20% 65%",
      "--accent": "187 85% 43%",
      "--accent-foreground": "222 47% 6%",
      "--border": "217 33% 17%",
      "--input": "217 33% 17%",
      "--ring": "187 85% 43%",
      "--hero-bg": "222 47% 8%",
    },
  },
  cosmetics: {
    code: "cosmetics",
    name: "Cosmetics",
    description: "Yumuşak tonlar ve pastel palet",
    previewGradient: "linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)",
    cssVars: {
      ...baseVars,
      "--radius": "1rem",
      "--background": "0 0% 100%",
      "--foreground": "340 30% 15%",
      "--card": "0 0% 100%",
      "--card-foreground": "340 30% 15%",
      "--primary": "330 81% 60%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "330 100% 97%",
      "--secondary-foreground": "340 30% 15%",
      "--muted": "330 100% 97%",
      "--muted-foreground": "340 10% 45%",
      "--accent": "330 100% 95%",
      "--accent-foreground": "330 81% 40%",
      "--border": "330 30% 92%",
      "--input": "330 30% 92%",
      "--ring": "330 81% 60%",
      "--hero-bg": "330 100% 97%",
    },
  },
};

export const themeCodes = Object.keys(themes) as ThemeCode[];

export function resolveThemeCode(code?: string | null): ThemeCode {
  if (code && code in themes) {
    return code as ThemeCode;
  }
  return "modern";
}

export function applyThemeVars(code: ThemeCode, brandColors?: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}) {
  const theme = themes[code] ?? themes.modern;
  const vars: Record<string, string> = { ...baseVars, ...theme.cssVars };
  if (brandColors?.primaryColor) vars["--brand-primary"] = brandColors.primaryColor;
  if (brandColors?.secondaryColor) vars["--brand-secondary"] = brandColors.secondaryColor;
  if (brandColors?.accentColor) vars["--brand-accent"] = brandColors.accentColor;
  return vars;
}

export function themeToStyleObject(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}
