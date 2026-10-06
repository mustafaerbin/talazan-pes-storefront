import type { CSSProperties } from "react";
import { hexToHslComponents } from "@/lib/color";
import type { ThemeCode } from "@/types/api";

export interface ThemeDefinition {
  code: ThemeCode;
  name: string;
  description: string;
  previewGradient: string;
  cssVars: Record<string, string>;
}

const baseVars = {
  "--radius-btn": "14px",
  "--radius-input": "14px",
  "--radius-card": "20px",
  "--radius-hero": "28px",
  "--radius-section": "24px",
  "--radius": "0.875rem",
  "--font-display": "var(--font-jakarta)",
};

export const themes: Record<ThemeCode, ThemeDefinition> = {
  minimal: {
    code: "minimal",
    name: "Minimal",
    description: "Sade ve temiz Shopify tarzı mağaza",
    previewGradient: "linear-gradient(135deg, #fafafa 0%, #e4e4e7 100%)",
    cssVars: {
      ...baseVars,
      "--background": "0 0% 100%",
      "--foreground": "240 10% 3.9%",
      "--card": "0 0% 100%",
      "--card-foreground": "240 10% 3.9%",
      "--primary": "240 5.9% 10%",
      "--primary-foreground": "0 0% 98%",
      "--secondary": "240 4.8% 95.9%",
      "--secondary-foreground": "240 5.9% 10%",
      "--muted": "240 4.8% 95.9%",
      "--muted-foreground": "240 3.8% 46.1%",
      "--accent": "240 4.8% 95.9%",
      "--accent-foreground": "240 5.9% 10%",
      "--border": "240 5.9% 90%",
      "--input": "240 5.9% 90%",
      "--ring": "240 5.9% 10%",
      "--hero-bg": "240 4.8% 97%",
    },
  },
  modern: {
    code: "modern",
    name: "Modern",
    description: "Talazan premium SaaS commerce görünümü",
    previewGradient: "linear-gradient(135deg, #F8F9FF 0%, #4F46E5 100%)",
    cssVars: {
      ...baseVars,
      "--background": "228 100% 99%",
      "--foreground": "221 39% 11%",
      "--card": "0 0% 100%",
      "--card-foreground": "221 39% 11%",
      "--primary": "243 76% 59%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "228 100% 97%",
      "--secondary-foreground": "221 39% 11%",
      "--muted": "228 60% 97%",
      "--muted-foreground": "220 9% 46%",
      "--accent": "239 84% 67%",
      "--accent-foreground": "0 0% 100%",
      "--border": "228 33% 93%",
      "--input": "228 33% 93%",
      "--ring": "243 76% 59%",
      "--hero-bg": "228 100% 98%",
      "--success": "160 84% 39%",
      "--warning": "38 92% 50%",
      "--topbar-bg": "243 76% 59%",
      "--topbar-fg": "0 0% 100%",
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
  const theme = themes[code];
  const vars: Record<string, string> = { ...theme.cssVars };

  if (brandColors?.primaryColor) {
    vars["--brand-primary"] = brandColors.primaryColor;
    const primaryHsl = hexToHslComponents(brandColors.primaryColor);
    if (primaryHsl) {
      vars["--primary"] = primaryHsl;
      vars["--ring"] = primaryHsl;
      vars["--hero-bg"] = primaryHsl.split(" ").slice(0, 2).join(" ") + " 97%";
    }
  }
  if (brandColors?.secondaryColor) {
    vars["--brand-secondary"] = brandColors.secondaryColor;
    const secondaryHsl = hexToHslComponents(brandColors.secondaryColor);
    if (secondaryHsl) vars["--secondary"] = secondaryHsl;
  }
  if (brandColors?.accentColor) {
    vars["--brand-accent"] = brandColors.accentColor;
    const accentHsl = hexToHslComponents(brandColors.accentColor);
    if (accentHsl) vars["--accent"] = accentHsl;
  }

  return vars;
}

export function themeToStyleObject(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}
