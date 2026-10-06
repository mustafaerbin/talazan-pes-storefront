"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LABELS, ROUTES } from "@/config/constants";
import { useCartStore } from "@/hooks/use-cart-store";
import { useOrdersStore } from "@/hooks/use-auth-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { getApiErrorMessage } from "@/api/client";
import { storeService } from "@/services/store.service";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const checkoutSchema = z.object({
  musteriAdi: z.string().min(2, "Ad gerekli"),
  musteriSoyadi: z.string().min(2, "Soyad gerekli"),
  mail: z.string().email("Geçerli e-posta girin"),
  telefon: z.string().min(10, "Telefon gerekli"),
  il: z.string().min(2, "İl gerekli"),
  ilce: z.string().min(2, "İlçe gerekli"),
  mahalle: z.string().optional(),
  adres: z.string().min(10, "Adres gerekli"),
  postaKodu: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function CheckoutView() {
  const router = useRouter();
  const firmaId = useFirmaId();
  const { items, getSubtotal, clearCart } = useCartStore();
  const addOrder = useOrdersStore((s) => s.addOrder);
  const subtotal = getSubtotal();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) });

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">{LABELS.emptyCart}</p>
        <Button className="mt-4" asChild>
          <Link href={ROUTES.home}>{LABELS.continueShopping}</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const order = await storeService.createOrder({
        firmaId,
        musteriAdi: data.musteriAdi,
        musteriSoyadi: data.musteriSoyadi,
        musteriAdiSoyadi: `${data.musteriAdi} ${data.musteriSoyadi}`,
        tutar: subtotal,
        satisTutar: subtotal,
        firmaSiparisUrunDtoList: items.map((item) => ({
          firmaUrunId: item.urunId,
          adet: item.adet,
          urunIsim: item.isim,
          satisTutar: item.birimFiyat * item.adet,
          tutar: item.birimFiyat * item.adet,
          resim: item.resim,
        })),
        adresBilgileri: {
          isim: data.musteriAdi,
          soyisim: data.musteriSoyadi,
          mail: data.mail,
          telefon: data.telefon,
          il: data.il,
          ilce: data.ilce,
          mahalle: data.mahalle,
          adres: data.adres,
          fulladres: `${data.adres}, ${data.ilce}/${data.il}`,
          postaKodu: data.postaKodu,
          adresTipi: "TESLIMAT",
        },
      });

      addOrder({
        siparisNo: order.siparisNo ?? `SIP-${Date.now()}`,
        tarih: new Date().toISOString(),
        tutar: subtotal,
        urunSayisi: items.reduce((s, i) => s + i.adet, 0),
        durum: order.siparisDurum ?? "YENI",
      });

      clearCart();
      toast.success(LABELS.orderSuccess);
      router.push(`${ROUTES.orders}?success=1&no=${order.siparisNo ?? ""}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{LABELS.checkout}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="musteriAdi">{LABELS.firstName}</Label>
                <Input id="musteriAdi" {...register("musteriAdi")} />
                {errors.musteriAdi && <p className="text-sm text-destructive">{errors.musteriAdi.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="musteriSoyadi">{LABELS.lastName}</Label>
                <Input id="musteriSoyadi" {...register("musteriSoyadi")} />
                {errors.musteriSoyadi && <p className="text-sm text-destructive">{errors.musteriSoyadi.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mail">{LABELS.email}</Label>
                <Input id="mail" type="email" {...register("mail")} />
                {errors.mail && <p className="text-sm text-destructive">{errors.mail.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">{LABELS.phone}</Label>
                <Input id="telefon" {...register("telefon")} />
                {errors.telefon && <p className="text-sm text-destructive">{errors.telefon.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="il">{LABELS.city}</Label>
                <Input id="il" {...register("il")} />
                {errors.il && <p className="text-sm text-destructive">{errors.il.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ilce">{LABELS.district}</Label>
                <Input id="ilce" {...register("ilce")} />
                {errors.ilce && <p className="text-sm text-destructive">{errors.ilce.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adres">{LABELS.address}</Label>
              <Input id="adres" {...register("adres")} />
              {errors.adres && <p className="text-sm text-destructive">{errors.adres.message}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              Siparişi Tamamla
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">Sipariş Özeti</h2>
          {items.map((item) => (
            <div key={item.urunId} className="flex justify-between text-sm">
              <span>{item.isim} x{item.adet}</span>
              <span>{formatPrice(item.birimFiyat * item.adet)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>{LABELS.total}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
