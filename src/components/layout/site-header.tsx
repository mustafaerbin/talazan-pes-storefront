"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Heart,
  HelpCircle,
  Menu,
  PackageSearch,
  Phone,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryDrilldown } from "@/components/layout/category-drilldown";
import { MegaMenu } from "@/components/layout/mega-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LABELS, ROUTES } from "@/config/constants";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useCartStore } from "@/hooks/use-cart-store";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { shippingPolicyText } from "@/lib/shipping";
import type { FirmaKategoriDto, StoreConfigDto } from "@/types/api";

interface SiteHeaderProps {
  config: StoreConfigDto;
  categories?: FirmaKategoriDto[];
}

export function SiteHeader({ config, categories = [] }: SiteHeaderProps) {
  const header = config.header;
  const pathname = usePathname();
  const currentSearch = useSearchParams();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clientReady, setClientReady] = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.adet, 0));
  const user = useAuthStore((s) => s.user);
  const visibleCartCount = clientReady ? cartCount : 0;
  const visibleUser = clientReady ? user : null;

  useEffect(() => {
    setClientReady(true);
  }, []);
  const logout = useAuthStore((s) => s.logout);
  const openCart = useSidePanelStore((s) => s.openCart);
  const openFavorites = useSidePanelStore((s) => s.openFavorites);
  const openLogin = useSidePanelStore((s) => s.openLogin);
  const openContact = useSidePanelStore((s) => s.openContact);

  const logoUrl = header?.logoUrl?.trim() || config.ayarlar?.logoUrl?.trim() || "";
  const siteTitle = config.ayarlar?.siteBaslik ?? config.firmaIsim;
  const announcement =
    header?.duyuruMetni ?? shippingPolicyText(config.ucretsizKargoLimiti, config.kargoUcreti);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`${ROUTES.search}?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  };

  const openContactPanel = () => {
    setMobileOpen(false);
    openContact({
      phone: config.ayarlar?.iletisimTelefon,
      email: config.ayarlar?.iletisimEmail,
    });
  };

  const navLinks: Array<{ href?: string; label: string; onClick?: () => void }> = [
    { href: ROUTES.home, label: LABELS.home },
    { href: ROUTES.catalog("cok-satan"), label: LABELS.bestSellers },
    { href: ROUTES.catalog("yeni"), label: LABELS.newArrivals },
    { href: ROUTES.catalog("indirimli"), label: LABELS.discountedProducts },
    { href: ROUTES.catalog("markalar"), label: LABELS.brands },
  ];

  const isNavActive = (href: string) => {
    const [path, query = ""] = href.split("?");
    if (pathname !== path) return false;
    const expected = new URLSearchParams(query);
    if ([...expected.keys()].length === 0) return currentSearch.toString() === "";
    for (const [key, value] of expected.entries()) {
      if (currentSearch.get(key) !== value) return false;
    }
    return true;
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[hsl(var(--topbar-bg))] text-[hsl(var(--topbar-fg))]">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 text-xs">
          <p className="font-medium tracking-wide">{announcement}</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href={ROUTES.orders} className="inline-flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100">
              <PackageSearch className="size-3.5" />
              {LABELS.orderTracking}
            </Link>
            <Link href={ROUTES.faq} className="inline-flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100">
              <HelpCircle className="size-3.5" />
              {LABELS.helpCenter}
            </Link>
            <button
              type="button"
              onClick={openContactPanel}
              className="inline-flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100"
            >
              <Phone className="size-3.5" />
              {LABELS.contact}
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-card/95 shadow-card backdrop-blur-xl">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menüyü aç"
            >
              <Menu className="size-5" />
            </Button>

            <Link href={ROUTES.home} className="flex shrink-0 items-center gap-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={siteTitle} className="h-9 w-auto md:h-10" />
              ) : (
                <span className="text-xl font-extrabold tracking-tight text-foreground">{siteTitle}</span>
              )}
            </Link>

            {(header?.aramaAktif ?? true) && (
              <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 sm:block">
                <div className="relative mx-auto max-w-3xl">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={LABELS.searchPlaceholder}
                    className="h-10 border-border bg-secondary/50 pl-9 pr-4 text-sm focus-visible:bg-card"
                    aria-label={LABELS.searchPlaceholder}
                  />
                </div>
              </form>
            )}

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="inline-flex"
                onClick={openFavorites}
                aria-label={LABELS.favorites}
              >
                <Heart className="size-5" />
              </Button>
              {(header?.hesapAktif ?? true) &&
                (visibleUser ? (
                  <div className="hidden items-center gap-2 sm:flex">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={ROUTES.account}>{visibleUser.ad}</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={logout}>
                      {LABELS.logout}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openLogin}
                    aria-label={LABELS.login}
                  >
                    <User className="size-5" />
                  </Button>
                ))}
              {(header?.sepetAktif ?? true) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={openCart}
                  aria-label={LABELS.cart}
                >
                  <ShoppingCart className="size-5" />
                  {visibleCartCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {visibleCartCount}
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative mt-2 sm:hidden">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={LABELS.searchPlaceholder}
              className="h-10 border-border bg-secondary/50 pl-9 text-sm"
              aria-label={LABELS.searchPlaceholder}
            />
          </form>

          <div className="mt-2 hidden items-center gap-5 border-t border-border/70 pt-2 lg:flex">
            <MegaMenu categories={categories} />
            <nav className="flex flex-1 items-center gap-6 overflow-x-auto scrollbar-hide" aria-label="Ana menü">
              {navLinks.map((link) =>
                link.onClick ? (
                  <button
                    key={link.label}
                    type="button"
                    onClick={link.onClick}
                    className="whitespace-nowrap text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href ?? ROUTES.home}
                    className={`whitespace-nowrap text-sm font-semibold transition-colors hover:text-primary ${
                      link.href && isNavActive(link.href) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="h-full w-full overflow-y-auto overflow-x-hidden bg-card p-4 sm:w-[min(100vw,28rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-bold">{siteTitle}</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              <form onSubmit={handleSearch} className="mb-6">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={LABELS.searchPlaceholder}
                />
              </form>
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {LABELS.categories}
                </p>
                <CategoryDrilldown categories={categories} onNavigate={() => setMobileOpen(false)} />
              </div>
              <nav className="flex flex-col gap-1 border-t border-border pt-4">
                {navLinks.map((link) =>
                  link.onClick ? (
                    <button
                      key={link.label}
                      type="button"
                      onClick={link.onClick}
                      className="rounded-[14px] px-3 py-2.5 text-left text-sm font-medium hover:bg-secondary"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={`${link.href}-${link.label}`}
                      href={link.href ?? ROUTES.home}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-[14px] px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
