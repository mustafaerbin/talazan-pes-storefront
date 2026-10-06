"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
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
import { MegaMenu } from "@/components/layout/mega-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LABELS, ROUTES } from "@/config/constants";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useCartStore } from "@/hooks/use-cart-store";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import type { FirmaKategoriDto, StoreConfigDto } from "@/types/api";

interface SiteHeaderProps {
  config: StoreConfigDto;
  categories?: FirmaKategoriDto[];
}

export function SiteHeader({ config, categories = [] }: SiteHeaderProps) {
  const header = config.header;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const cartCount = useCartStore((s) => s.getItemCount());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openCart = useSidePanelStore((s) => s.openCart);
  const openFavorites = useSidePanelStore((s) => s.openFavorites);

  const logoUrl = header?.logoUrl ?? config.ayarlar?.logoUrl;
  const siteTitle = config.ayarlar?.siteBaslik ?? config.firmaIsim;
  const announcement = header?.duyuruMetni ?? LABELS.freeShippingBanner;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`${ROUTES.search}?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  };

  const navLinks = [
    { href: ROUTES.home, label: LABELS.home },
    { href: `${ROUTES.search}?sort=id,desc`, label: LABELS.newArrivals },
    { href: ROUTES.search, label: LABELS.bestSellers },
    { href: `${ROUTES.search}?indirimli=true`, label: LABELS.discountedProducts },
    { href: ROUTES.search, label: "Markalar" },
    { href: ROUTES.blog, label: LABELS.blog },
    { href: ROUTES.contact, label: LABELS.contact },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[hsl(var(--topbar-bg))] text-[hsl(var(--topbar-fg))]">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs md:text-sm">
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
            <Link href={ROUTES.contact} className="inline-flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100">
              <Phone className="size-3.5" />
              {LABELS.contact}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-card/95 shadow-card backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
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
              <form onSubmit={handleSearch} className="hidden flex-1 md:block">
                <div className="relative mx-auto max-w-2xl">
                  <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={LABELS.searchPlaceholder}
                    className="h-12 border-border/80 bg-secondary/60 pl-12 pr-4 text-base focus-visible:bg-card"
                    aria-label={LABELS.searchPlaceholder}
                  />
                </div>
              </form>
            )}

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
                onClick={openFavorites}
                aria-label={LABELS.favorites}
              >
                <Heart className="size-5" />
              </Button>
              {(header?.hesapAktif ?? true) &&
                (user ? (
                  <div className="hidden items-center gap-2 sm:flex">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={ROUTES.account}>{user.ad}</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={logout}>
                      {LABELS.logout}
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={ROUTES.login} aria-label={LABELS.login}>
                      <User className="size-5" />
                    </Link>
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
                  {cartCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-card">
                      {cartCount}
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 hidden items-center gap-6 border-t border-border/70 pt-3.5 lg:flex">
            <MegaMenu categories={categories} />
            <nav className="flex flex-1 items-center gap-6 overflow-x-auto scrollbar-hide" aria-label="Ana menü">
              {navLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={`whitespace-nowrap text-sm font-semibold transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
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
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="h-full w-[min(88vw,360px)] overflow-y-auto bg-card p-6 shadow-hover"
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
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {LABELS.categories}
                </p>
                <nav className="flex flex-col gap-1">
                  {categories.slice(0, 10).map((cat) => (
                    <Link
                      key={cat.id}
                      href={ROUTES.category(cat.slug ?? String(cat.id))}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-[14px] px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      {cat.isim}
                    </Link>
                  ))}
                </nav>
              </div>
              <nav className="flex flex-col gap-1 border-t border-border pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-[14px] px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
