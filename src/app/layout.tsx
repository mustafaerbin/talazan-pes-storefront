import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AppProviders } from "@/providers/app-providers";
import { FirmaIdProvider } from "@/providers/firma-id-provider";
import { getRequestSiteUrl, resolveFirmaId } from "@/lib/tenant";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();
  return {
    title: {
      default: "Talazan Mağaza",
      template: "%s | Talazan Mağaza",
    },
    description: "Premium e-ticaret mağazası",
    metadataBase: new URL(siteUrl),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const firmaId = await resolveFirmaId();
  const siteUrl = await getRequestSiteUrl();

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${jakartaSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <FirmaIdProvider firmaId={firmaId} siteUrl={siteUrl}>
          <ThemeProvider>
            <QueryProvider>
              <AppProviders>{children}</AppProviders>
            </QueryProvider>
          </ThemeProvider>
        </FirmaIdProvider>
      </body>
    </html>
  );
}
