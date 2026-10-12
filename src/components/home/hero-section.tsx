"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/constants";
import type { FirmaKategoriDto, FirmaUrunDto, HeroSlide, HomeSection, StoreConfigDto } from "@/types/api";

interface HeroSectionProps {
  section: HomeSection;
  config: StoreConfigDto;
  categories: FirmaKategoriDto[];
  featured: FirmaUrunDto[];
}

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

export function HeroSection({ section, config, featured }: HeroSectionProps) {
  const slides = useMemo(
    () => buildSlides(section, config, featured),
    [section, config, featured],
  );
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
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid min-h-[280px] md:min-h-[340px] md:grid-cols-[minmax(0,1fr)_minmax(240px,42%)]">
        <div className="flex flex-col justify-center px-5 py-6 sm:px-8 md:py-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{config.firmaIsim}</p>
          <h1 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
            {activeSlide.baslik}
          </h1>
          {activeSlide.altBaslik && (
            <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {activeSlide.altBaslik}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {activeSlide.ctaUrl && (
              <Button asChild>
                <Link href={activeSlide.ctaUrl}>{activeSlide.ctaMetin ?? "Ürünü İncele"}</Link>
              </Button>
            )}
            {activeSlide.ikinciCtaUrl && (
              <Link href={activeSlide.ikinciCtaUrl} className="text-sm font-semibold text-primary hover:underline">
                {activeSlide.ikinciCtaMetin ?? "Tüm Ürünler"}
              </Link>
            )}
          </div>
          {slides.length > 1 && (
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:border-primary hover:text-primary"
                onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
                aria-label="Önceki slayt"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:border-primary hover:text-primary"
                onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
                aria-label="Sonraki slayt"
              >
                <ArrowRight className="size-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Slayt ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    className={`size-1.5 rounded-full ${index === activeIndex ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative min-h-[200px] bg-secondary/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              {activeSlide.resimUrl ? (
                <Image
                  src={activeSlide.resimUrl}
                  alt={activeSlide.baslik}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority={activeIndex === 0}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
