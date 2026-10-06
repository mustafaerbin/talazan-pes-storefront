"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LABELS, ROUTES } from "@/config/constants";
import { useCartStore } from "@/hooks/use-cart-store";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">{LABELS.cart}</h1>
        <p className="mt-4 text-muted-foreground">{LABELS.emptyCart}</p>
        <Button className="mt-6" asChild>
          <Link href={ROUTES.home}>{LABELS.continueShopping}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{LABELS.cart}</h1>
        {items.map((item) => (
          <Card key={item.urunId}>
            <CardContent className="flex gap-4 p-4">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.resim ? (
                  <Image src={item.resim} alt={item.isim} fill className="object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={ROUTES.product(item.slug ?? String(item.urunId))}
                    className="font-medium hover:text-primary"
                  >
                    {item.isim}
                  </Link>
                  <p className="text-sm text-muted-foreground">{formatPrice(item.birimFiyat)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-border">
                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.urunId, item.adet - 1)}>
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.adet}</span>
                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.urunId, item.adet + 1)}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.urunId)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="font-semibold">{formatPrice(item.birimFiyat * item.adet)}</div>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" onClick={clearCart}>
          Sepeti Temizle
        </Button>
      </div>

      <Card className="h-fit">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Sipariş Özeti</h2>
          <div className="flex justify-between text-sm">
            <span>{LABELS.subtotal}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{LABELS.shipping}</span>
            <span>{LABELS.freeShipping}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>{LABELS.total}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Button className="w-full" size="lg" asChild>
            <Link href={ROUTES.checkout}>{LABELS.proceedToCheckout}</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={ROUTES.home}>{LABELS.continueShopping}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
