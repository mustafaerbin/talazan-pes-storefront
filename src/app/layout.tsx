import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AppProviders } from "@/providers/app-providers";
import { env } from "@/config/env";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Talazan Mağaza",
    template: "%s | Talazan Mağaza",
  },
  description: "Premium e-ticaret mağazası",
  metadataBase: new URL(env.siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${jakartaSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AppProviders>{children}</AppProviders>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
