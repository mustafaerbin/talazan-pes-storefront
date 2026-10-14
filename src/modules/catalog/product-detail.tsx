"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Search,
  Share2,
  ShoppingBag,
  Star,
  Truck,
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
import { useFirmaId } from "@/hooks/use-firma-id";
import { accountService } from "@/services/account.service";
import { storeService } from "@/services/store.service";
import { isFreeShipping, shippingMessage } from "@/lib/shipping";
import { attrMap, buildVariantGroups, findVariantForSelection } from "@/lib/product-variants";
import { cn } from "@/lib/utils";
import type { FirmaUrunDto } from "@/types/api";
import { toast } from "sonner";
import { ProductReviewsSection } from "./product-reviews-section";
import { ProductQuestionsSection } from "./product-questions-section";

interface ProductDetailViewProps {
  product: FirmaUrunDto;
  related?: FirmaUrunDto[];
  embedded?: boolean;
}

type DetailTab = "description" | "specs" | "reviews" | "questions";


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
  if (product.stokKodu) rows.push({ label: LABELS.sku, value: product.stokKodu });
  else if (product.urunKodu) rows.push({ label: "Ürün Kodu", value: product.urunKodu });
  if (product.barkodNo) rows.push({ label: "Barkod", value: product.barkodNo });
  if (product.firmaKategoriIsim) rows.push({ label: LABELS.category, value: product.firmaKategoriIsim });
  for (const item of product.varyantOzellikleri ?? []) {
    if (item.ozellikIsim && item.degerIsim) {
      rows.push({ label: item.ozellikIsim, value: item.degerIsim });
    }
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

export function ProductDetailView({ product, related = [], embedded = false }: ProductDetailViewProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(product);
  const images = useMemo(() => {
    const list = (current.resimler?.filter(Boolean) ?? []).length
      ? current.resimler!.filter(Boolean)
      : current.resim
        ? [current.resim]
        : [];
    return list;
  }, [current.resim, current.resimler]);

  const specRows = useMemo(() => buildSpecRows(current), [current]);

  const [imageIndex, setImageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("description");

  const { addPayload, addProduct } = useAddToCart();
  const firmaId = useFirmaId();
  const user = useAuthStore((s) => s.user);
  const { toggle } = useFavoriteToggle();
  const openFavorites = useSidePanelStore((s) => s.openFavorites);
  const { data: favoriteIds = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: accountService.getFavorites,
    enabled: !!user,
  });
  const { data: storeConfig } = useQuery({
    queryKey: ["store-config", firmaId],
    queryFn: () => storeService.getConfig(firmaId),
  });
  const { data: variants = [] } = useQuery({
    queryKey: ["product-variants", firmaId, product.id],
    queryFn: () => storeService.getProductVariants(firmaId, product.id),
    enabled: !!firmaId && !!product.id,
  });
  const { data: reviewSummary } = useQuery({
    queryKey: ["product-reviews", firmaId, current.id],
    queryFn: () => storeService.getProductReviews(firmaId, current.id),
    enabled: !!firmaId && !!current.id,
  });
  const reviewCount = reviewSummary?.yorumSayisi ?? current.yorumSayisi ?? 0;
  const reviewAverage = reviewSummary?.ortalamaPuan ?? current.ortalamaPuan ?? 0;

  useEffect(() => {
    setCurrent((prev) => (prev.id === product.id ? product : prev));
  }, [product]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#degerlendirmeler") {
      setActiveTab("reviews");
    }
  }, [current.id]);

  const allVariants = useMemo(() => {
    if (variants.length === 0) return [];
    return variants.some((variant) => variant.id === current.id) ? variants : [current, ...variants];
  }, [variants, current]);
  const variantGroups = useMemo(() => buildVariantGroups(allVariants), [allVariants]);
  const selectedAttrs = useMemo(() => attrMap(current), [current]);

  const selectVariant = (key: string, value: string) => {
    const next = findVariantForSelection(allVariants, selectedAttrs, key, value);
    if (!next || next.id === current.id) return;
    setCurrent(next);
    setImageIndex(0);
    setQuantity(1);
    if (!embedded) {
      const slug = next.slug ?? String(next.id);
      router.replace(`${ROUTES.product(slug)}${window.location.search}`, { scroll: false });
    }
  };

  const stock = current.stokMiktari ?? 0;
  const inStock = stock > 0;
  const sale = current.satisTutari ?? 0;
  const list = current.listeTutari;
  const percent = discountPercent(list, sale);
  const hasDiscount = percent > 0;
  const activeImage = images[imageIndex] ?? images[0];
  const isFavorite = favoriteIds.includes(current.id);
  const description = current.aciklama?.trim();
  const sku = current.stokKodu ?? current.urunKodu;
  const shippingNote = shippingMessage(sale, storeConfig?.ucretsizKargoLimiti, storeConfig?.kargoUcreti);
  const productHasFreeShipping = isFreeShipping(
    sale,
    storeConfig?.ucretsizKargoLimiti,
    storeConfig?.kargoUcreti,
  );

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
          urunId: current.id,
          isim: current.isim,
          slug: current.slug,
          resim: activeImage ?? current.resim,
          birimFiyat: sale,
          stokMiktari: current.stokMiktari,
          listeTutari: current.listeTutari,
          renk: current.renk,
          beden: current.beden,
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
        await navigator.share({ title: current.isim, url });
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
  ].filter((t): t is { id: DetailTab; label: string; show: boolean } => t.show);

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
    <div className={cn("space-y-10", embedded ? "pb-4" : "pb-24 md:pb-10")}>
      {!embedded && (
        <Breadcrumbs
          items={[
            ...(current.firmaKategoriIsim
              ? [{ label: current.firmaKategoriIsim, href: ROUTES.search }]
              : []),
            { label: current.isim },
          ]}
        />
      )}

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:gap-5">
        <div className="flex h-full flex-col gap-3 sm:flex-row">
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
              "relative order-1 min-h-[320px] flex-1 overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-card shadow-card sm:order-2 sm:min-h-full",
              activeImage && "group",
            )}
          >
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={current.isim}
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
        <section className="flex h-full min-h-0">
          <div className="flex h-full w-full flex-col rounded-[var(--radius-card)] border border-border/70 bg-card p-6 shadow-card md:p-7">
            {current.firmaMarkaIsim && (
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {current.firmaMarkaIsim}
              </p>
            )}

            <h1 className="mt-2 line-clamp-3 text-xl font-bold leading-snug tracking-tight md:text-2xl">
              {current.isim}
            </h1>

            {reviewCount > 0 && (
              <div className="mt-3">
                <RatingLink average={reviewAverage} count={reviewCount} onClick={scrollToReviews} />
              </div>
            )}

            {sku && (
              <p className="mt-2 text-xs text-muted-foreground">
                {LABELS.sku}: <span className="font-medium text-foreground/80">{sku}</span>
              </p>
            )}

            <div className="mt-5 space-y-1">
              {hasDiscount && list != null && (
                <p className="text-base text-muted-foreground line-through">{formatTl(list)}</p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <p className={cn("text-2xl font-extrabold tracking-tight text-foreground", hasDiscount && "text-destructive")}>
                  {formatTl(sale)}
                </p>
                {hasDiscount && (
                  <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                    %{percent} indirim
                  </span>
                )}
              </div>
            </div>

            {variantGroups.length > 0 && (
              <div className="mt-6 space-y-4">
                {variantGroups.map((group) => (
                  <div key={group.key}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {group.label}
                      {group.key !== "id" && selectedAttrs[group.key] ? (
                        <span className="ml-2 font-medium normal-case tracking-normal text-foreground">
                          {selectedAttrs[group.key]}
                        </span>
                      ) : null}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((value) => {
                        const sample = group.key === "id"
                          ? allVariants.find((variant) => String(variant.id) === value)
                          : allVariants.find((variant) => attrMap(variant)[group.key] === value);
                        const selected = group.key === "id"
                          ? String(current.id) === value
                          : selectedAttrs[group.key] === value;
                        const sampleStock = sample?.stokMiktari ?? 0;
                        const label = group.key === "id"
                          ? sample?.varyantBilgisi || sample?.isim || value
                          : value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => selectVariant(group.key, value)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-colors",
                              selected
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border bg-background text-foreground hover:border-primary/50",
                              sampleStock <= 0 && "opacity-50",
                            )}
                          >
                            {sample?.resim ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={sample.resim} alt="" className="size-6 rounded-full object-cover" />
                            ) : null}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
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

            <div className="mt-5 flex gap-3 rounded-[var(--radius-card)] border border-border/70 bg-secondary/30 p-4 text-sm">
              <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{productHasFreeShipping ? LABELS.freeShipping : "Kargo"}</p>
                <p className="text-muted-foreground">{shippingNote}</p>
              </div>
            </div>

            <div className={cn("mt-5 items-stretch gap-3", embedded ? "flex" : "hidden sm:flex")}>
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

            <div className="mt-auto hidden pt-4 sm:grid sm:grid-cols-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => (isFavorite ? openFavorites() : toggle(current.id, false))}
              >
                <Heart className={cn("size-4", isFavorite && "fill-destructive text-destructive")} />
                Favorilere ekle
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="size-4" />
                Paylaş
              </Button>
            </div>
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
                <ProductReviewsSection productId={current.id} />
              </div>
            )}

            {currentTab === "questions" && (
              <ProductQuestionsSection productId={current.id} productName={current.isim} />
            )}
          </div>
        </div>
      </section>

      {!embedded && related.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">İlginizi Çekebilecek Ürünler</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Mobil sticky CTA */}
      {!embedded && (
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
      )}

      {zoomed && activeImage && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-6"
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
            alt={current.isim}
            className="max-h-[90vh] max-w-full rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
