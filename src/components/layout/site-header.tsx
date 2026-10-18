"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
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
import { parseAnnouncementTexts } from "@/lib/announcements";
import { shippingPolicyText } from "@/lib/shipping";
import type { FirmaKategoriDto, StoreConfigDto } from "@/types/api";
import { cn } from "@/lib/utils";
import { AnnouncementTicker } from "@/components/layout/announcement-ticker";

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
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
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

  const logoUrl = header?.logoUrl?.trim() || config.ayarlar?.logoUrl?.trim() || "";
  const siteTitle = config.ayarlar?.siteBaslik ?? config.firmaIsim;
  const tagline = config.ayarlar?.siteAciklama?.trim();
  const shortTagline = tagline && tagline.length <= 48 ? tagline : null;
  const brandKicker = useMemo(() => {
    const name = config.firmaIsim?.trim();
    const title = config.ayarlar?.siteBaslik?.trim();
    if (name && title && name.toLocaleLowerCase("tr") !== title.toLocaleLowerCase("tr")) {
      return `${name} · ${title}`;
    }
    return name || title || siteTitle;
  }, [config.firmaIsim, config.ayarlar?.siteBaslik, siteTitle]);
  const announcements = parseAnnouncementTexts(
    header?.duyuruMetni,
    shippingPolicyText(config.ucretsizKargoLimiti, config.kargoUcreti),
  );
  const rootCategories = categories.filter((category) => !category.parent).slice(0, 4);

  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [accountOpen]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`${ROUTES.search}?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  };

  const navLinks: Array<{ href: string; label: string }> = [
    { href: ROUTES.home, label: LABELS.home },
    { href: ROUTES.search, label: LABELS.allProducts },
    ...rootCategories.map((category) => ({
      href: ROUTES.category(category.slug ?? String(category.id)),
      label: category.isim,
    })),
    { href: ROUTES.catalog("indirimli"), label: LABELS.discountedProducts },
  ];

  const isNavActive = (href: string) => {
    const [path, query = ""] = href.split("?");
    if (pathname !== path) return false;
    const expected = new URLSearchParams(query);
    if ([...expected.keys()].length > 0) {
      for (const [key, value] of expected.entries()) {
        if (currentSearch.get(key) !== value) return false;
      }
      return true;
    }
    if (path === ROUTES.search) return !currentSearch.get("liste");
    return true;
  };

  const searchField = (className?: string) => (
    <form onSubmit={handleSearch} className={cn("relative min-w-0 flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={LABELS.searchPlaceholder}
        className="h-10 border-border bg-secondary pl-9 pr-11 text-sm"
        aria-label={LABELS.searchPlaceholder}
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center text-foreground hover:opacity-70"
        aria-label={LABELS.search}
      >
        <ArrowRight className="size-4" />
      </button>
    </form>
  );

  const iconButtonClass =
    "group inline-flex flex-col items-center gap-0.5 px-2 py-1 text-foreground transition-opacity hover:opacity-70";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="border-b border-border text-[11px] text-muted-foreground">
        <div className="container mx-auto flex h-8 items-center justify-between gap-x-4 px-4">
          <p className="hidden shrink-0 uppercase tracking-[0.14em] sm:block">{brandKicker}</p>
          <AnnouncementTicker texts={announcements} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-3">
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

          <Link href={ROUTES.home} className="flex shrink-0 flex-col items-start">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteTitle} className="h-8 w-auto md:h-9" />
            ) : (
              <span className="text-[22px] font-semibold leading-none tracking-tight text-foreground">
                {siteTitle}
              </span>
            )}
            {shortTagline && (
              <span className="mt-1 hidden max-w-[12rem] truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
                {shortTagline}
              </span>
            )}
          </Link>

          {(header?.aramaAktif ?? true) && searchField("hidden sm:block")}

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {(header?.favoriAktif ?? true) && (
              <button type="button" className={iconButtonClass} onClick={openFavorites} aria-label={LABELS.favorites}>
                <Heart className="size-5" />
                <span className="hidden text-[11px] text-muted-foreground lg:block">{LABELS.favorites}</span>
              </button>
            )}
            {(header?.hesapAktif ?? true) &&
              (visibleUser ? (
                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    className={iconButtonClass}
                    onClick={() => setAccountOpen((value) => !value)}
                    aria-expanded={accountOpen}
                  >
                    <span className="inline-flex items-center">
                      <User className="size-5" />
                      <ChevronDown className="hidden size-3 lg:inline" />
                    </span>
                    <span className="hidden text-[11px] text-muted-foreground lg:block">{LABELS.account}</span>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-md border border-border bg-background py-1">
                      <p className="truncate px-3 py-2 text-xs text-muted-foreground">{visibleUser.ad}</p>
                      <Link href={ROUTES.account} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm hover:bg-secondary">
                        {LABELS.account}
                      </Link>
                      <Link href={ROUTES.orders} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm hover:bg-secondary">
                        {LABELS.orders}
                      </Link>
                      <Link href={ROUTES.addresses} onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm hover:bg-secondary">
                        {LABELS.addresses}
                      </Link>
                      <button
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-secondary"
                        onClick={() => {
                          setAccountOpen(false);
                          logout();
                        }}
                      >
                        {LABELS.logout}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" className={iconButtonClass} onClick={openLogin} aria-label={LABELS.login}>
                  <User className="size-5" />
                  <span className="hidden text-[11px] text-muted-foreground lg:block">{LABELS.account}</span>
                </button>
              ))}
            {(header?.sepetAktif ?? true) && (
              <button type="button" className={cn(iconButtonClass, "relative")} onClick={openCart} aria-label={LABELS.cart}>
                <ShoppingBag className="size-5" />
                {visibleCartCount > 0 && (
                  <span className="absolute right-0.5 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {visibleCartCount}
                  </span>
                )}
                <span className="hidden text-[11px] text-muted-foreground lg:block">{LABELS.cart}</span>
              </button>
            )}
          </div>
        </div>

        {(header?.aramaAktif ?? true) && searchField("mt-3 sm:hidden")}

        <div className="mt-3 hidden items-center gap-6 border-t border-border pt-2.5 lg:flex">
          <MegaMenu categories={categories} />
          <nav className="flex flex-1 items-center gap-6 overflow-x-auto scrollbar-hide" aria-label="Ana menü">
            {navLinks.map((link) => {
              const active = isNavActive(link.href);
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap pb-1 text-sm transition-colors",
                    active
                      ? "border-b-2 border-foreground font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="h-full w-full overflow-y-auto overflow-x-hidden bg-background p-4 sm:w-[min(100vw,28rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-semibold">{siteTitle}</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              <nav className="mb-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {LABELS.categories}
                </p>
                <CategoryDrilldown categories={categories} onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
