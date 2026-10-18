"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    ctaMetin: "Koleksiyonu keşfet",
    ctaUrl: ROUTES.product(product.slug ?? String(product.id)),
    resimUrl: product.resim,
  }));

  if (productSlides.length) return productSlides;

  return [
    {
      baslik: section.baslik || config.ayarlar?.siteBaslik || config.firmaIsim,
      altBaslik: section.altBaslik ?? config.ayarlar?.siteAciklama,
      ctaMetin: "Koleksiyonu keşfet",
      ctaUrl: ROUTES.search,
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
    }, 7000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex] ?? slides[0];
  if (!activeSlide) return null;

  const kicker = [config.firmaIsim, config.ayarlar?.siteBaslik]
    .filter((value, index, list) => value && list.findIndex((item) => item?.toLocaleLowerCase("tr") === value.toLocaleLowerCase("tr")) === index)
    .join(" · ");

  return (
    <section className="bg-[#1A1A1A] text-white">
      <div className="grid md:min-h-[420px] md:grid-cols-2 lg:min-h-[460px]">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
          {kicker && (
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">{kicker}</p>
          )}
          <h1 className="mt-4 max-w-xl text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl">
            {activeSlide.baslik}
          </h1>
          {activeSlide.altBaslik && (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-[15px]">
              {activeSlide.altBaslik}
            </p>
          )}
          {activeSlide.ctaUrl && (
            <div className="mt-8">
              <Link
                href={activeSlide.ctaUrl}
                className="inline-flex h-11 items-center gap-2 bg-white px-5 text-sm font-medium text-[#242424] transition-opacity hover:opacity-90"
              >
                {activeSlide.ctaMetin ?? "Koleksiyonu keşfet"}
                <span aria-hidden>→</span>
              </Link>
            </div>
          )}
        </div>

        <div className="relative min-h-[240px] bg-black md:min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              {activeSlide.resimUrl ? (
                <Image
                  src={activeSlide.resimUrl}
                  alt={activeSlide.baslik}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={activeIndex === 0}
                />
              ) : (
                <div className="h-full w-full bg-[#1A1A1A]" />
              )}
            </motion.div>
          </AnimatePresence>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#242424]"
                onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
                aria-label="Önceki slayt"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#242424]"
                onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
                aria-label="Sonraki slayt"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
