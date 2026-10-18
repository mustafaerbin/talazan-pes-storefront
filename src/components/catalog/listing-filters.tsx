"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FirmaKategoriDto } from "@/types/api";
import { cn } from "@/lib/utils";

interface ListingFiltersProps {
  open: boolean;
  onClose: () => void;
  categories: FirmaKategoriDto[];
  activeCategoryId?: number;
  minFiyat?: number;
  maxFiyat?: number;
  discounted: boolean;
  resultCount?: number;
  onApply: (values: {
    kategoriId?: string;
    minFiyat: string;
    maxFiyat: string;
    discounted: boolean;
  }) => void;
  onClear: () => void;
}

export function ListingFilters({
  open,
  onClose,
  categories,
  activeCategoryId,
  minFiyat,
  maxFiyat,
  discounted,
  resultCount,
  onApply,
  onClear,
}: ListingFiltersProps) {
  const roots = categories.filter((category) => !category.parent);
  const [min, setMin] = useState(minFiyat != null ? String(minFiyat) : "");
  const [max, setMax] = useState(maxFiyat != null ? String(maxFiyat) : "");
  const [indirimli, setIndirimli] = useState(discounted);
  const [kategoriId, setKategoriId] = useState(activeCategoryId != null ? String(activeCategoryId) : "");

  useEffect(() => {
    if (!open) return;
    setMin(minFiyat != null ? String(minFiyat) : "");
    setMax(maxFiyat != null ? String(maxFiyat) : "");
    setIndirimli(discounted);
    setKategoriId(activeCategoryId != null ? String(activeCategoryId) : "");
  }, [open, minFiyat, maxFiyat, discounted, activeCategoryId]);

  if (!open) return null;

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    onApply({
      kategoriId,
      minFiyat: min,
      maxFiyat: max,
      discounted: indirimli,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" className="absolute inset-0 bg-foreground/30" aria-label="Filtreleri kapat" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-background">
        <header className="flex items-start justify-between px-5 py-5">
          <div>
            <h2 className="text-lg font-semibold">Filtreler</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ürünleri daraltın.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Kapat">
            <X className="size-5" />
          </button>
        </header>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
          <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-6">
            {roots.length > 0 && (
              <fieldset>
                <legend className="mb-3 text-sm font-medium">Kategori</legend>
                <div className="space-y-2">
                  {roots.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 rounded-sm border-border"
                        checked={kategoriId === String(category.id)}
                        onChange={() => setKategoriId(kategoriId === String(category.id) ? "" : String(category.id))}
                      />
                      {category.isim}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="border-t border-border pt-5">
              <legend className="mb-3 text-sm font-medium">Fiyat aralığı</legend>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="En az ₺"
                  value={min}
                  onChange={(event) => setMin(event.target.value)}
                  aria-label="En az fiyat"
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="En çok ₺"
                  value={max}
                  onChange={(event) => setMax(event.target.value)}
                  aria-label="En çok fiyat"
                />
              </div>
            </fieldset>

            <fieldset className="border-t border-border pt-5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded-sm border-border"
                  checked={indirimli}
                  onChange={(event) => setIndirimli(event.target.checked)}
                />
                İndirimli ürünler
              </label>
            </fieldset>
          </div>

          <div className="space-y-3 border-t border-border px-5 py-4">
            <button
              type="button"
              className={cn("inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground")}
              onClick={() => {
                setMin("");
                setMax("");
                setIndirimli(false);
                setKategoriId("");
                onClear();
                onClose();
              }}
            >
              Filtreleri temizle <X className="size-3.5" />
            </button>
            <Button type="submit" className="h-12 w-full">
              {resultCount != null ? `${resultCount} ürünü göster` : "Ürünleri göster"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
