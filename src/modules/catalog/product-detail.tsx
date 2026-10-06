"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Undo2,
  X,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { LABELS, ROUTES } from "@/config/constants";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFavoriteToggle } from "@/hooks/use-favorites";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { accountService } from "@/services/account.service";
import { cn } from "@/lib/utils";
import type { FirmaUrunDto } from "@/types/api";
import { toast } from "sonner";
import { getProductReviewsMock, getReviewSummary } from "./product-detail-mock";
import { ProductReviewsSection } from "./product-reviews-section";
import { ProductQuestionsSection } from "./product-questions-section";

interface ProductDetailViewProps {
  product: FirmaUrunDto;
  related?: FirmaUrunDto[];
}

type DetailTab = "description" | "specs" | "reviews" | "questions";

const FREE_SHIPPING_THRESHOLD = 1500;

function formatTl(amount: number): string {
  return (
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " TL"
  );
}

function discountPercent(list?: number, sale?: number): number {
  if (list == null || sale == null || list <= sale || list <= 0) return 0;
  return Math.round(((list - sale) / list) * 100);
}

function sanitizeProductHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<(object|embed|link|meta)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

function buildSpecRows(product: FirmaUrunDto): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (product.firmaMarkaIsim) rows.push({ label: "Marka", value: product.firmaMarkaIsim });
  if (product.renk) rows.push({ label: "Renk", value: product.renk });
  if (product.beden) rows.push({ label: "Beden", value: product.beden });
  if (product.stokKodu) rows.push({ label: LABELS.sku, value: product.stokKodu });
  else if (product.urunKodu) rows.push({ label: "Ürün Kodu", value: product.urunKodu });
  if (product.barkodNo) rows.push({ label: "Barkod", value: product.barkodNo });
  if (product.firmaKategoriIsim) rows.push({ label: LABELS.category, value: product.firmaKategoriIsim });
  if (product.varyantBilgisi) {
    product.varyantBilgisi.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      const colon = trimmed.indexOf(":");
      if (colon > 0) {
        rows.push({
          label: trimmed.slice(0, colon).trim(),
          value: trimmed.slice(colon + 1).trim(),
        });
      } else {
        rows.push({ label: "Varyant", value: trimmed });
      }
    });
  }
  return rows;
}

function RatingLink({
  average,
  count,
  onClick,
}: {
  average: number;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex flex-wrap items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      <span className="inline-flex items-center gap-0.5 text-primary">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "size-4",
              star <= Math.round(average) ? "fill-primary" : "fill-muted/30 text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      <span className="font-semibold text-foreground">{average.toFixed(1)}</span>
      <span>({count} değerlendirme)</span>
    </button>
  );
}

export function ProductDetailView({ product, related = [] }: ProductDetailViewProps) {
  const images = useMemo(() => {
    const list = (product.resimler?.filter(Boolean) ?? []).length
      ? product.resimler!.filter(Boolean)
      : product.resim
        ? [product.resim]
        : [];
    return list;
  }, [product.resim, product.resimler]);

  const reviews = useMemo(() => getProductReviewsMock(product), [product]);
  const reviewSummary = useMemo(() => getReviewSummary(reviews), [reviews]);
  const specRows = useMemo(() => buildSpecRows(product), [product]);

  const [imageIndex, setImageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("description");

  const { addPayload } = useAddToCart();
  const user = useAuthStore((s) => s.user);
  const { toggle } = useFavoriteToggle();
  const openFavorites = useSidePanelStore((s) => s.openFavorites);
  const { data: favoriteIds = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: accountService.getFavorites,
    enabled: !!user,
  });

  const stock = product.stokMiktari ?? 0;
  const inStock = stock > 0;
  const sale = product.satisTutari ?? 0;
  const list = product.listeTutari;
  const percent = discountPercent(list, sale);
  const hasDiscount = percent > 0;
  const activeImage = images[imageIndex] ?? images[0];
  const isFavorite = favoriteIds.includes(product.id);
  const description = product.aciklama?.trim();
  const sku = product.stokKodu ?? product.urunKodu;
  const installment = sale > 0 ? Math.ceil(sale / 12) : null;
  const qualifiesFreeShipping = sale >= FREE_SHIPPING_THRESHOLD;

  const hasRenk = Boolean(product.renk?.trim());
  const hasBeden = Boolean(product.beden?.trim());
  const hasVaryantInfo = Boolean(product.varyantBilgisi?.trim());

  const showPrev = () => setImageIndex((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setImageIndex((i) => (i + 1) % images.length);

  const scrollToReviews = () => {
    setActiveTab("reviews");
    requestAnimationFrame(() => {
      document.getElementById("urun-detay-sekmeler")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleAddToCart = async () => {
    if (!inStock) return;
    setAdding(true);
    try {
      addPayload(
        {
          urunId: product.id,
          isim: product.isim,
          slug: product.slug,
          resim: activeImage ?? product.resim,
          birimFiyat: sale,
          stokMiktari: product.stokMiktari,
          listeTutari: product.listeTutari,
          renk: product.renk,
          beden: product.beden,
        },
        quantity,
      );
    } finally {
      window.setTimeout(() => setAdding(false), 400);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.isim, url });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Bağlantı kopyalandı");
  };

  const tabs: { id: DetailTab; label: string; show: boolean }[] = [
    { id: "description", label: "Ürün Açıklaması", show: Boolean(description) },
    { id: "specs", label: "Ürün Özellikleri", show: specRows.length > 0 },
    { id: "reviews", label: "Değerlendirmeler", show: true },
    { id: "questions", label: "Sorular", show: true },
  ].filter((t) => t.show);

  const defaultTab = tabs[0]?.id ?? "reviews";
  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : defaultTab;

  const stockLabel = !inStock
    ? "Tükendi"
    : stock <= 5
      ? `Stokta · Son ${stock} ürün`
      : "Stokta";

  const addToCartButton = (
    <Button
      type="button"
      size="lg"
      className="h-12 w-full text-base font-bold"
      disabled={!inStock || adding}
      onClick={handleAddToCart}
    >
      {adding ? LABELS.loading : inStock ? LABELS.addToCart : "Tükendi"}
    </Button>
  );

  return (
    <div className="space-y-10 pb-24 md:pb-10">
      <Breadcrumbs
        items={[
          ...(product.firmaKategoriIsim
            ? [{ label: product.firmaKategoriIsim, href: ROUTES.search }]
            : []),
          { label: product.isim },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-10">
        {/* Galeri */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {images.length > 1 && (
            <div className="order-2 flex gap-2 overflow-x-auto scrollbar-hide sm:order-1 sm:max-h-[640px] sm:w-[72px] sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden">
              {images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={cn(
                    "relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-card sm:aspect-[3/4] sm:w-full",
                    index === imageIndex ? "border-primary" : "border-transparent hover:border-border",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}

          <div
            className={cn(
              "relative order-1 min-h-[320px] flex-1 overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-card shadow-card sm:order-2 sm:min-h-[420px]",
              activeImage && "group",
            )}
          >
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={product.isim}
                className="mx-auto h-full max-h-[min(720px,70vh)] w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-muted-foreground">
                <ShoppingBag className="size-16 opacity-20" />
              </div>
            )}

            {activeImage && (
              <button
                type="button"
                onClick={() => setZoomed(true)}
                className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-card"
                aria-label="Büyüt"
              >
                <Search className="size-4" />
              </button>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 shadow-card"
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 shadow-card"
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {hasDiscount && (
              <span className="absolute bottom-4 right-4 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-white">
                %{percent} {LABELS.discountBadge.toLowerCase()}
              </span>
            )}
          </div>
        </div>

        {/* Satın alma */}
        <section className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--radius-card)] border border-border/70 bg-card p-6 shadow-card md:p-7">
            {product.firmaMarkaIsim && (
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {product.firmaMarkaIsim}
              </p>
            )}

            <h1 className="mt-2 line-clamp-3 text-2xl font-bold leading-snug tracking-tight md:text-3xl">
              {product.isim}
            </h1>

            <div className="mt-3">
              <RatingLink average={reviewSummary.average} count={reviewSummary.count} onClick={scrollToReviews} />
            </div>

            {sku && (
              <p className="mt-2 text-xs text-muted-foreground">
                {LABELS.sku}: <span className="font-medium text-foreground/80">{sku}</span>
              </p>
            )}

            <div className="mt-5 space-y-1">
              {hasDiscount && list != null && (
                <p className="text-lg text-muted-foreground line-through">{formatTl(list)}</p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <p className={cn("text-3xl font-extrabold tracking-tight text-foreground", hasDiscount && "text-destructive")}>
                  {formatTl(sale)}
                </p>
                {hasDiscount && (
                  <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                    %{percent} indirim
                  </span>
                )}
              </div>
              {installment != null && inStock && (
                <p className="text-sm text-muted-foreground">
                  12 aya varan taksit · <span className="font-medium text-foreground">{formatTl(installment)}</span> / ay
                </p>
              )}
            </div>

            {hasRenk && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-bold tracking-wide text-foreground">RENK</p>
                <span className="inline-flex h-10 items-center rounded-full border-2 border-primary bg-primary/5 px-4 text-sm font-semibold">
                  {product.renk}
                </span>
              </div>
            )}

            {hasBeden && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-bold tracking-wide text-foreground">BEDEN</p>
                <span
                  className={cn(
                    "inline-flex h-10 min-w-10 items-center justify-center rounded-full border-2 px-4 text-sm font-semibold",
                    inStock ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                  )}
                >
                  {product.beden}
                </span>
              </div>
            )}

            {hasVaryantInfo && !hasRenk && !hasBeden && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-bold tracking-wide text-foreground">SEÇENEK</p>
                <span className="inline-flex max-w-full rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm">
                  {product.varyantBilgisi}
                </span>
              </div>
            )}

            <p
              className={cn(
                "mt-6 inline-flex items-center gap-2 text-sm font-medium",
                inStock ? "text-success" : "text-destructive",
              )}
            >
              {inStock ? <Check className="size-4" /> : <X className="size-4" />}
              {stockLabel}
            </p>

            <div className="mt-5 space-y-3 rounded-[var(--radius-card)] border border-border/70 bg-secondary/30 p-4 text-sm">
              <div className="flex gap-3">
                <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">{LABELS.freeShipping}</p>
                  <p className="text-muted-foreground">
                    {qualifiesFreeShipping
                      ? "Bu ürün için ücretsiz kargo uygulanır."
                      : LABELS.freeShippingBanner}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Package className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Tahmini Teslimat</p>
                  <p className="text-muted-foreground">1–3 iş günü</p>
                </div>
              </div>
            </div>

            <div className="mt-5 hidden items-stretch gap-3 sm:flex">
              <div className="flex h-12 items-center rounded-[var(--radius-btn)] border border-border bg-background px-1">
                <button
                  type="button"
                  className="flex size-10 items-center justify-center rounded-lg hover:bg-secondary"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Azalt"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  type="button"
                  className="flex size-10 items-center justify-center rounded-lg hover:bg-secondary"
                  onClick={() => setQuantity((q) => Math.min(q + 1, Math.max(stock || 99, 1)))}
                  aria-label="Artır"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="min-w-0 flex-1">{addToCartButton}</div>
            </div>

            <div className="mt-3 hidden sm:grid sm:grid-cols-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => (isFavorite ? openFavorites() : toggle(product.id, false))}
              >
                <Heart className={cn("size-4", isFavorite && "fill-destructive text-destructive")} />
                Favorilere ekle
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="size-4" />
                Paylaş
              </Button>
            </div>

            <ul className="mt-5 hidden flex-wrap gap-x-5 gap-y-2 border-t border-border/70 pt-4 text-xs text-muted-foreground sm:flex">
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                {LABELS.securePayment}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Undo2 className="size-3.5 text-primary" />
                {LABELS.easyReturns}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Truck className="size-3.5 text-primary" />
                {LABELS.fastDelivery}
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Sekmeler */}
      <section id="urun-detay-sekmeler" className="scroll-mt-24">
        <div className="rounded-[var(--radius-card)] border border-border/70 bg-card shadow-card">
          <div className="flex gap-1 overflow-x-auto border-b border-border/70 px-2 scrollbar-hide sm:px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 px-4 py-4 text-sm font-semibold transition-colors",
                  currentTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {currentTab === "description" && description && (
              <div
                className="product-description mx-auto max-w-3xl"
                dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(description) }}
              />
            )}

            {currentTab === "specs" && (
              <dl className="grid max-w-3xl gap-3 sm:grid-cols-2">
                {specRows.map((row) => (
                  <div
                    key={`${row.label}-${row.value}`}
                    className="grid grid-cols-1 gap-1 rounded-xl border border-border/60 bg-secondary/20 px-4 py-3 sm:grid-cols-[140px_1fr] sm:gap-4"
                  >
                    <dt className="text-sm font-medium text-muted-foreground">{row.label}</dt>
                    <dd className="text-sm font-semibold text-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {currentTab === "reviews" && (
              <div id="degerlendirmeler">
                <ProductReviewsSection reviews={reviews} />
              </div>
            )}

            {currentTab === "questions" && (
              <ProductQuestionsSection productId={product.id} productName={product.isim} />
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">İlginizi Çekebilecek Ürünler</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobil sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 shadow-hover backdrop-blur-md sm:hidden">
        <div className="container mx-auto flex items-center gap-3 px-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{formatTl(sale)}</p>
            <div className="flex h-10 items-center rounded-[var(--radius-btn)] border border-border px-1">
              <button
                type="button"
                className="flex size-8 items-center justify-center"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Azalt"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                className="flex size-8 items-center justify-center"
                onClick={() => setQuantity((q) => Math.min(q + 1, Math.max(stock || 99, 1)))}
                aria-label="Artır"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="w-[55%]">{addToCartButton}</div>
        </div>
      </div>

      {zoomed && activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6"
          onClick={() => setZoomed(false)}
          role="presentation"
        >
          <button
            type="button"
            className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-card"
            aria-label="Kapat"
            onClick={() => setZoomed(false)}
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage}
            alt={product.isim}
            className="max-h-[90vh] max-w-full rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
