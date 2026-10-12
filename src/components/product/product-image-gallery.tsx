"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ROUTES } from "@/config/constants";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  productName: string;
  productHref: string;
  onClose: () => void;
}

export function ProductImageGallery({
  images,
  alt,
  productName,
  productHref,
  onClose,
}: ProductImageGalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const active = images[index] ?? images[0];
  const hasMany = images.length > 1;

  const showPrev = () => setIndex((current) => (current - 1 + images.length) % images.length);
  const showNext = () => setIndex((current) => (current + 1) % images.length);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (images.length < 2) return;
      if (event.key === "ArrowLeft") {
        setIndex((current) => (current - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % images.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [images.length]);

  if (!active) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 sm:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${productName} görselleri`}
        className="flex max-h-full w-full max-w-5xl flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 text-white">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-base">{productName}</p>
            {hasMany && (
              <p className="text-xs text-white/70">
                {index + 1} / {images.length}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={ROUTES.product(productHref)}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/25"
            >
              Ürün detayı
            </Link>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full bg-white text-foreground"
              aria-label="Kapat"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div
          className="relative flex min-h-0 flex-1 items-center justify-center"
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current == null || !hasMany) return;
            const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
            if (delta > 48) showPrev();
            else if (delta < -48) showNext();
            touchStartX.current = null;
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt={alt}
            className="max-h-[min(72vh,820px)] w-full rounded-2xl object-contain"
          />

          {hasMany && (
            <>
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-card sm:left-3"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-card sm:right-3"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {hasMany && (
          <div className="flex justify-center gap-2 overflow-x-auto pb-1">
            {images.map((src, imageIndex) => (
              <button
                key={`${src}-${imageIndex}`}
                type="button"
                onClick={() => setIndex(imageIndex)}
                className={`relative size-14 shrink-0 overflow-hidden rounded-xl border-2 bg-white sm:size-16 ${
                  imageIndex === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`Görsel ${imageIndex + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
