"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HeroCategorySidebar } from "@/components/home/hero-category-sidebar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";
import type {
  FirmaKategoriDto,
  FirmaUrunDto,
  HeroSlide,
  HomeSection,
  PromotionCard,
  StoreConfigDto,
} from "@/types/api";

interface HeroSectionProps {
  section: HomeSection;
  config: StoreConfigDto;
  categories: FirmaKategoriDto[];
  featured: FirmaUrunDto[];
}

const DEFAULT_CAMPAIGNS: PromotionCard[] = [
  {
    baslik: "Hafta Sonu Fırsatları",
    altBaslik: "Seçili ürünlerde ekstra indirim",
    ctaMetin: "Keşfet",
    url: ROUTES.search,
  },
  {
    baslik: "Yeni Sezon",
    altBaslik: "Trend ürünleri keşfedin",
    ctaMetin: "İncele",
    url: `${ROUTES.search}?sort=id,desc`,
  },
];

function buildSlides(section: HomeSection, config: StoreConfigDto, featured: FirmaUrunDto[]): HeroSlide[] {
  const configured = section.ayarlar?.slides;
  if (configured?.length) return configured;

  const productSlides = featured.slice(0, 3).map((product) => ({
    baslik: product.isim,
    altBaslik: section.altBaslik ?? config.ayarlar?.siteAciklama,
    ctaMetin: "Ürünü İncele",
    ctaUrl: ROUTES.product(product.slug ?? String(product.id)),
    ikinciCtaMetin: "Tüm Ürünler",
    ikinciCtaUrl: ROUTES.search,
    resimUrl: product.resim,
  }));

  if (productSlides.length) return productSlides;

  return [
    {
      baslik: section.baslik ?? "Yeni Sezon Koleksiyonu",
      altBaslik: section.altBaslik ?? config.ayarlar?.siteAciklama,
      ctaMetin: "Alışverişe Başla",
      ctaUrl: ROUTES.search,
      ikinciCtaMetin: "Kategoriler",
      ikinciCtaUrl: ROUTES.search,
    },
  ];
}

export function HeroSection({ section, config, categories, featured }: HeroSectionProps) {
  const slides = useMemo(
    () => buildSlides(section, config, featured),
    [section, config, featured],
  );
  const campaigns = section.ayarlar?.campaigns ?? DEFAULT_CAMPAIGNS;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex] ?? slides[0];
  if (!activeSlide) return null;

  return (
    <section className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
      <HeroCategorySidebar categories={categories} />

      <div className="relative h-[400px] overflow-hidden rounded-[var(--radius-hero)] border border-border bg-card shadow-premium md:h-[480px]">
        <div className="gradient-subtle absolute inset-0" />
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-accent/5 blur-3xl" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative grid h-full min-h-0 md:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="flex min-h-0 flex-col justify-center overflow-hidden p-7 md:p-10 lg:p-12">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                {config.firmaIsim}
              </p>
              <h1 className="line-clamp-3 text-2xl font-extrabold leading-[1.15] tracking-tight md:text-4xl lg:text-[2.75rem]">
                {activeSlide.baslik}
              </h1>
              {activeSlide.altBaslik && (
                <p className="mt-4 line-clamp-2 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
                  {activeSlide.altBaslik}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {activeSlide.ctaUrl && (
                  <Button size="lg" asChild>
                    <Link href={activeSlide.ctaUrl}>
                      {activeSlide.ctaMetin ?? "Keşfet"}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
                <Button size="lg" variant="outline" asChild>
                  <Link href={activeSlide.ikinciCtaUrl ?? ROUTES.search}>
                    {activeSlide.ikinciCtaMetin ?? "Tüm Ürünler"}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden min-h-0 md:block">
              {activeSlide.resimUrl ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center p-8 md:p-10">
                    <div className="relative aspect-[4/5] h-[min(100%,340px)] w-[min(72%,280px)] max-w-full shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-secondary/30">
                      <Image
                        src={activeSlide.resimUrl}
                        alt={activeSlide.baslik}
                        fill
                        className="object-contain p-3 transition-transform duration-700"
                        sizes="280px"
                        priority={activeIndex === 0}
                      />
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute bottom-10 right-10 size-20 rounded-2xl border border-border bg-card/90 p-3 shadow-hover backdrop-blur-sm"
                  >
                    <div className="size-full rounded-xl bg-primary/10" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="absolute right-24 top-12 size-14 rounded-2xl border border-border bg-card/90 shadow-card backdrop-blur-sm"
                  />
                </>
              ) : (
                <div className="gradient-primary-subtle absolute inset-8 rounded-[var(--radius-card)]" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Slayt ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? "w-8 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/40"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-5 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm"
              onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
              aria-label="Önceki slayt"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm"
              onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
              aria-label="Sonraki slayt"
            >
              <ArrowRight className="size-4" />
            </Button>
          </>
        )}
      </div>

      <div className="hidden flex-col gap-5 lg:flex">
        {campaigns.slice(0, 2).map((campaign, index) => (
          <Link
            key={`${campaign.baslik}-${index}`}
            href={campaign.url ?? ROUTES.search}
            className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-hover"
          >
            {campaign.resimUrl && (
              <Image
                src={campaign.resimUrl}
                alt=""
                fill
                className="object-cover opacity-20 transition-opacity group-hover:opacity-30"
                sizes="300px"
              />
            )}
            <div className="gradient-primary-subtle absolute inset-0" />
            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                Kampanya
              </span>
              <h3 className="mt-3 text-lg font-bold tracking-tight">{campaign.baslik}</h3>
              {campaign.altBaslik && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{campaign.altBaslik}</p>
              )}
            </div>
            <span className="relative z-10 mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
              {campaign.ctaMetin ?? "Keşfet"}
              <ArrowRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
