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

function expandHex(input: string): string | null {
  const hex = input.trim().replace(/^#/, "");
  const full = hex.length === 3 ? hex.split("").map((channel) => channel + channel).join("") : hex;
  return /^[0-9a-fA-F]{6}$/.test(full) ? full : null;
}

/** Tailwind `hsl(var(--token))` için `H S% L%` kanalı. */
export function hexToHslChannels(input: string): string | null {
  const full = expandHex(input);
  if (!full) return null;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

function foregroundForHex(input: string): string {
  const full = expandHex(input);
  if (!full) return "0 0% 100%";
  const [red = 0, green = 0, blue = 0] = [0, 2, 4].map((start) => {
    const value = parseInt(full.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance > 0.179 ? "0 0% 9%" : "0 0% 100%";
}

function withLightness(channels: string, lightness: number): string {
  const match = channels.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!match) return channels;
  return `${match[1]} ${match[2]}% ${Math.max(0, Math.min(100, Math.round(lightness)))}%`;
}

function withSaturation(channels: string, saturation: number): string {
  const match = channels.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  if (!match) return channels;
  return `${match[1]} ${Math.max(0, Math.min(100, Math.round(saturation)))}% ${match[3]}%`;
}

export function applyThemeVars(code: ThemeCode, brandColors?: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}) {
  const theme = themes[code] ?? themes.modern;
  const vars: Record<string, string> = { ...baseVars, ...theme.cssVars };
  const primary = brandColors?.primaryColor ? hexToHslChannels(brandColors.primaryColor) : null;
  if (primary && brandColors?.primaryColor) {
    vars["--primary"] = primary;
    vars["--ring"] = primary;
    vars["--hero-bg"] = primary;
    vars["--primary-foreground"] = foregroundForHex(brandColors.primaryColor);
    vars["--brand-primary"] = primary;
    vars["--muted"] = withSaturation(withLightness(primary, 96), 35);
    vars["--accent"] = withSaturation(withLightness(primary, 94), 40);
    vars["--border"] = withSaturation(withLightness(primary, 88), 22);
    vars["--input"] = vars["--border"];
    vars["--topbar-bg"] = primary;
    vars["--topbar-fg"] = vars["--primary-foreground"];
  }
  const secondary = brandColors?.secondaryColor ? hexToHslChannels(brandColors.secondaryColor) : null;
  if (secondary && brandColors?.secondaryColor) {
    vars["--brand-secondary"] = secondary;
    vars["--topbar-bg"] = secondary;
    vars["--topbar-fg"] = foregroundForHex(brandColors.secondaryColor);
  }
  const accent = brandColors?.accentColor ? hexToHslChannels(brandColors.accentColor) : null;
  if (accent && brandColors?.accentColor) {
    vars["--brand-accent"] = accent;
    vars["--brand-accent-foreground"] = foregroundForHex(brandColors.accentColor);
  }
  return vars;
}

export function themeToStyleObject(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}
