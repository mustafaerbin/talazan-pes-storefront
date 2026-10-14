"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CHECKOUT_GUEST_KEY,
  CHECKOUT_IDEMPOTENCY_KEY,
  CHECKOUT_RESULT_KEY,
  LABELS,
  ROUTES,
} from "@/config/constants";
import { useCartStore } from "@/hooks/use-cart-store";
import { useAuthStore, useOrdersStore } from "@/hooks/use-auth-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { getApiErrorMessage } from "@/api/client";
import { accountService } from "@/services/account.service";
import { storeService } from "@/services/store.service";
import { formatPrice } from "@/lib/utils";
import { formatPhoneInput, isPhoneValid } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { shippingMessage, shippingPolicyText } from "@/lib/shipping";
import type { FirmaSiparisAdresDto, FirmaSiparisDto, SiteMusteriAdresDto, StoreSiparisSonucDto } from "@/types/api";
import { toast } from "sonner";

const checkoutSchema = z
  .object({
    ad: z.string().trim().min(2, "Ad gerekli"),
    soyad: z.string().trim().min(2, "Soyad gerekli"),
    telefon: z.string().trim().refine(isPhoneValid, "Geçerli bir telefon numarası girin"),
    mail: z.string().trim().email("Geçerli e-posta girin"),
    il: z.string().trim().min(2, "İl gerekli"),
    ilce: z.string().trim().min(2, "İlçe gerekli"),
    mahalle: z.string().trim().optional(),
    adres: z.string().trim().min(10, "Açık adres en az 10 karakter olmalı"),
    baslik: z.string().trim().optional(),
    faturaAyni: z.boolean(),
    faturaTipi: z.enum(["BIREYSEL", "KURUMSAL"]),
    faturaAd: z.string().optional(),
    faturaSoyad: z.string().optional(),
    faturaTelefon: z.string().optional(),
    faturaMail: z.string().optional(),
    faturaIl: z.string().optional(),
    faturaIlce: z.string().optional(),
    faturaMahalle: z.string().optional(),
    faturaAdres: z.string().optional(),
    sirketUnvani: z.string().optional(),
    vergiDairesi: z.string().optional(),
    vergiNo: z.string().optional(),
    odemeYontemi: z.enum(["HAVALE_EFT", "KAPIDA_ODEME"]),
  })
  .superRefine((data, ctx) => {
    if (!data.faturaAyni) {
      const checks: [keyof typeof data, string, (value: string) => boolean][] = [
        ["faturaAd", "Fatura adı gerekli", (value) => value.trim().length >= 2],
        ["faturaSoyad", "Fatura soyadı gerekli", (value) => value.trim().length >= 2],
        ["faturaTelefon", "Fatura telefonu geçersiz", (value) => isPhoneValid(value)],
        ["faturaMail", "Fatura e-postası geçersiz", (value) => z.string().email().safeParse(value).success],
        ["faturaIl", "Fatura ili gerekli", (value) => value.trim().length >= 2],
        ["faturaIlce", "Fatura ilçesi gerekli", (value) => value.trim().length >= 2],
        ["faturaAdres", "Fatura açık adresi en az 10 karakter olmalı", (value) => value.trim().length >= 10],
      ];
      checks.forEach(([field, message, valid]) => {
        const value = String(data[field] ?? "");
        if (!valid(value)) ctx.addIssue({ code: "custom", path: [field], message });
      });
    }
    if (data.faturaTipi === "KURUMSAL") {
      if ((data.sirketUnvani ?? "").trim().length < 2) {
        ctx.addIssue({ code: "custom", path: ["sirketUnvani"], message: "Şirket unvanı gerekli" });
      }
      if ((data.vergiDairesi ?? "").trim().length < 2) {
        ctx.addIssue({ code: "custom", path: ["vergiDairesi"], message: "Vergi dairesi gerekli" });
      }
      if (!/^\d{10}$/.test((data.vergiNo ?? "").replace(/\s/g, ""))) {
        ctx.addIssue({ code: "custom", path: ["vergiNo"], message: "Vergi numarası 10 hane olmalı" });
      }
    }
  });

type CheckoutForm = z.infer<typeof checkoutSchema>;
type CheckoutStep = "gate" | "delivery" | "payment";

function variantText(renk?: string, beden?: string) {
  return [renk, beden].filter(Boolean).join(" / ");
}

function idempotencyKey() {
  const existing = sessionStorage.getItem(CHECKOUT_IDEMPOTENCY_KEY);
  if (existing) return existing;
  const key = crypto.randomUUID();
  sessionStorage.setItem(CHECKOUT_IDEMPOTENCY_KEY, key);
  return key;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function paymentStatus(order: StoreSiparisSonucDto) {
  if (order.odendi) return "Ödendi";
  if (order.odemeDurum === "KAPIDA_BEKLIYOR") return "Kapıda ödeme — henüz tahsil edilmedi";
  return "Ödeme bekleniyor — sipariş ödenmiş değil";
}

export function CheckoutView() {
  const router = useRouter();
  const openLogin = useSidePanelStore((s) => s.openLogin);
  const openRegister = useSidePanelStore((s) => s.openRegister);
  const openAddress = useSidePanelStore((s) => s.openAddress);
  const adim = useSearchParams().get("adim");
  const firmaId = useFirmaId();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrdersStore((s) => s.addOrder);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [step, setStep] = useState<CheckoutStep>("gate");
  const [guest, setGuest] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const addressFilled = useRef(false);
  const navIntent = useRef<CheckoutStep | null>(null);

  const { data: addresses, isSuccess: addressesReady } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => accountService.getAddresses(),
    enabled: !!user,
  });

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      faturaAyni: true,
      faturaTipi: "BIREYSEL",
      odemeYontemi: "HAVALE_EFT",
      mahalle: "",
      baslik: "",
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = form;
  const faturaAyni = watch("faturaAyni");
  const faturaTipi = watch("faturaTipi");
  const odemeYontemi = watch("odemeYontemi");

  useEffect(() => {
    if (!user && navIntent.current === "gate" && (adim === "teslimat" || adim === "odeme")) {
      const params = new URLSearchParams(window.location.search);
      params.delete("adim");
      const query = params.toString();
      router.replace(query ? `${ROUTES.checkout}?${query}` : ROUTES.checkout, { scroll: false });
      return;
    }
    navIntent.current = null;
    if (user) {
      setGuest(false);
      setStep(adim === "odeme" ? "payment" : "delivery");
      return;
    }
    if (adim === "odeme" || adim === "teslimat") {
      sessionStorage.setItem(CHECKOUT_GUEST_KEY, "1");
      setGuest(true);
      setStep(adim === "odeme" ? "payment" : "delivery");
      return;
    }
    sessionStorage.removeItem(CHECKOUT_GUEST_KEY);
    setGuest(false);
    setStep("gate");
  }, [adim, router, user]);

  const applySavedAddress = useCallback((address: SiteMusteriAdresDto) => {
    addressFilled.current = true;
    setSelectedAddressId(address.id ?? null);
    setValue("ad", address.ad || user?.ad || "");
    setValue("soyad", address.soyad || user?.soyad || "");
    setValue("telefon", formatPhoneInput(address.telefon || ""));
    setValue("il", address.il || "");
    setValue("ilce", address.ilce || "");
    setValue("mahalle", address.mahalle || "");
    setValue("adres", address.adresSatiri || "");
    setValue("baslik", address.baslik || "");
  }, [setValue, user]);

  useEffect(() => {
    if (!user) return;
    setValue("mail", user.email || "");
    if (addressFilled.current) return;
    setValue("ad", user.ad || "");
    setValue("soyad", user.soyad || "");
  }, [setValue, user]);

  const seenAddressIds = useRef<Set<number> | null>(null);

  useEffect(() => {
    if (!addresses) return;
    const ids = new Set(addresses.flatMap((item) => (item.id == null ? [] : [item.id])));
    if (seenAddressIds.current == null) {
      seenAddressIds.current = ids;
      const address = addresses.find((item) => item.varsayilan) ?? addresses[0];
      if (address) applySavedAddress(address);
      return;
    }
    const added = addresses.find((item) => item.id != null && !seenAddressIds.current?.has(item.id));
    seenAddressIds.current = ids;
    if (added) applySavedAddress(added);
  }, [addresses, applySavedAddress]);

  const previewPayload: FirmaSiparisDto | null =
    items.length === 0
      ? null
      : {
          firmaId,
          firmaSiparisUrunDtoList: items.map((item) => ({
            firmaUrunId: item.urunId,
            adet: item.adet,
            satisTutar: item.birimFiyat * item.adet,
            resim: item.resim,
            varyantBilgisi: variantText(item.renk, item.beden),
          })),
        };

  const activeStep: CheckoutStep =
    step === "payment" && (Boolean(user) || guest) ? "payment" : user || guest ? "delivery" : "gate";

  const preview = useQuery({
    queryKey: ["checkout-preview", firmaId, items.map((item) => `${item.urunId}:${item.adet}:${item.birimFiyat}`).join("|")],
    queryFn: () => storeService.previewOrder(previewPayload!),
    enabled: !!previewPayload && activeStep !== "gate",
  });

  if (!isHydrated) return null;

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

  const quote = preview.data;
  const total = quote?.toplam;
  const buttonLabel =
    activeStep === "delivery"
      ? "Ödeme Adımına Geç"
      : isSubmitting
        ? "Sipariş oluşturuluyor..."
        : `Siparişi Tamamla${total != null ? ` · ${formatPrice(total)}` : ""}`;

  const checkoutHref = (adim?: "teslimat" | "odeme") => {
    const params = new URLSearchParams(window.location.search);
    if (adim) params.set("adim", adim);
    else params.delete("adim");
    const query = params.toString();
    return query ? `${ROUTES.checkout}?${query}` : ROUTES.checkout;
  };

  const continueAsGuest = () => {
    navIntent.current = "delivery";
    sessionStorage.setItem(CHECKOUT_GUEST_KEY, "1");
    setGuest(true);
    setStep("delivery");
    router.push(checkoutHref("teslimat"), { scroll: false });
  };

  const backToChoices = () => {
    navIntent.current = "gate";
    sessionStorage.removeItem(CHECKOUT_GUEST_KEY);
    setGuest(false);
    setStep("gate");
    router.replace(checkoutHref(), { scroll: false });
  };

  const backToDelivery = () => {
    navIntent.current = "delivery";
    setStep("delivery");
    router.replace(checkoutHref(user ? undefined : "teslimat"), { scroll: false });
  };

  const openPayment = () => {
    navIntent.current = "payment";
    setStep("payment");
    router.push(checkoutHref("odeme"), { scroll: false });
  };

  const placeOrder = async (data: CheckoutForm) => {
    if (!quote || preview.isError) {
      setSubmitError(getApiErrorMessage(preview.error) || "Sipariş tutarı doğrulanamadı");
      return;
    }
    setSubmitError(null);
    const teslimat: FirmaSiparisAdresDto = {
      isim: data.ad,
      soyisim: data.soyad,
      telefon: data.telefon,
      mail: data.mail,
      il: data.il,
      ilce: data.ilce,
      mahalle: data.mahalle,
      adres: data.baslik ? `${data.baslik}: ${data.adres}` : data.adres,
      adresTipi: "KARGO",
      vergiDairesi: data.faturaTipi === "KURUMSAL" && data.faturaAyni ? data.vergiDairesi : undefined,
    };
    const fatura = data.faturaAyni
      ? undefined
      : {
          isim: data.faturaAd,
          soyisim: data.faturaSoyad,
          telefon: data.faturaTelefon,
          mail: data.faturaMail,
          il: data.faturaIl,
          ilce: data.faturaIlce,
          mahalle: data.faturaMahalle,
          adres: data.faturaAdres,
          adresTipi: "FATURA",
          vergiDairesi: data.faturaTipi === "KURUMSAL" ? data.vergiDairesi : undefined,
        };

    const payload: FirmaSiparisDto = {
      firmaId,
      odemeYontemi: data.odemeYontemi,
      istemAnahtari: idempotencyKey(),
      faturaTipi: data.faturaTipi,
      sirketUnvani: data.faturaTipi === "KURUMSAL" ? data.sirketUnvani : undefined,
      vergiNo: data.faturaTipi === "KURUMSAL" ? data.vergiNo?.replace(/\s/g, "") : undefined,
      adresBilgileri: teslimat,
      faturaAdresi: fatura,
      firmaSiparisUrunDtoList: items.map((item) => ({
        firmaUrunId: item.urunId,
        adet: item.adet,
        satisTutar: item.birimFiyat * item.adet,
        resim: item.resim,
        varyantBilgisi: variantText(item.renk, item.beden),
      })),
    };

    const send = () => storeService.createOrder(payload);
    let order: StoreSiparisSonucDto;
    try {
      try {
        order = await send();
      } catch (error) {
        const message = getApiErrorMessage(error);
        if (!message.toLowerCase().includes("zaten")) throw error;
        order = await send();
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      setSubmitError(message);
      toast.error(message);
      return;
    }

    sessionStorage.setItem(CHECKOUT_RESULT_KEY, JSON.stringify(order));
    sessionStorage.removeItem(CHECKOUT_IDEMPOTENCY_KEY);
    sessionStorage.removeItem(CHECKOUT_GUEST_KEY);
    addOrder({
      siparisNo: order.siparisNo ?? "",
      tarih: new Date().toISOString(),
      tutar: order.toplam ?? 0,
      urunSayisi: items.reduce((sum, item) => sum + item.adet, 0),
      durum: paymentStatus(order),
      siparisDurum: order.siparisDurum,
      kalemler: (order.kalemler?.length ? order.kalemler : items.map((item) => ({
        firmaUrunId: item.urunId,
        urunIsim: item.isim,
        resim: item.resim,
        slug: item.slug,
        adet: item.adet,
      }))).map((kalem, index) => ({
        ...kalem,
        slug: kalem.slug ?? items[index]?.slug,
        firmaUrunId: kalem.firmaUrunId ?? items[index]?.urunId,
      })),
    });
    clearCart();
    router.push(ROUTES.orderConfirmation);
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (activeStep === "delivery") {
      openPayment();
      return;
    }
    await placeOrder(data);
  };

  const goNext = async () => {
    if (user && !selectedAddressId) {
      setSubmitError("Teslimat için bir adres seçin veya kaydedin.");
      return;
    }
    setSubmitError(null);
    const valid = await trigger([
      "ad",
      "soyad",
      "telefon",
      "mail",
      "il",
      "ilce",
      "adres",
      "faturaAd",
      "faturaSoyad",
      "faturaTelefon",
      "faturaMail",
      "faturaIl",
      "faturaIlce",
      "faturaAdres",
      "sirketUnvani",
      "vergiDairesi",
      "vergiNo",
    ]);
    if (valid) openPayment();
  };

  if (activeStep === "gate") {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Siparişi tamamla</h1>
          <p className="mt-2 text-muted-foreground">Sepetiniz duruyor. Devam etmek için bir yöntem seçin.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Kayıt ol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Hesap açın, siparişlerinizi daha sonra da görün.</p>
              <Button className="w-full" type="button" onClick={openRegister}>
                {LABELS.register}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Giriş yap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Hesabınız varsa panelden giriş yapın. Sepetiniz durur.</p>
              <Button className="w-full" variant="outline" type="button" onClick={openLogin}>
                {LABELS.login}
              </Button>
            </CardContent>
          </Card>
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>Kayıt olmadan devam et</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Hesap açmadan teslimat bilgilerinizle sipariş verin.</p>
              <Button className="w-full" onClick={continueAsGuest}>
                Misafir olarak devam et
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 pb-24 lg:grid-cols-[1fr_360px] lg:pb-0">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold">{LABELS.checkout}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user ? `${user.ad} ${user.soyad}` : guest ? "Misafir sipariş" : "Teslimat bilgileri"}
        </p>
        {guest && !user && activeStep === "delivery" && (
          <button type="button" onClick={backToChoices} className="mt-3 text-sm font-medium text-primary hover:underline">
            Giriş seçeneklerine dön
          </button>
        )}
      </div>

      <div className="space-y-6">
        {activeStep === "delivery" && (
          <Card>
            <CardHeader>
              <CardTitle>Teslimat bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && addressesReady && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Kayıtlı adresler</p>
                    <Button type="button" variant="outline" className="text-foreground" onClick={openAddress}>
                      Adres kaydet
                    </Button>
                  </div>
                  {addresses && addresses.length > 0 ? (
                    <div className="grid gap-2">
                      {addresses.map((address) => {
                        const selected = selectedAddressId === address.id;
                        return (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => applySavedAddress(address)}
                            className={cn(
                              "rounded-[var(--radius-card)] border px-4 py-3 text-left",
                              selected ? "border-primary bg-primary/5" : "border-border",
                            )}
                          >
                            <span className="block font-semibold text-foreground">{address.baslik || "Adres"}</span>
                            <span className="mt-1 block text-sm text-foreground">
                              {[address.ad, address.soyad].filter(Boolean).join(" ")}
                              {address.telefon ? ` · ${formatPhoneInput(address.telefon)}` : ""}
                            </span>
                            <span className="mt-1 block text-sm text-foreground">
                              {address.adresSatiri}
                              {address.mahalle ? `, ${address.mahalle}` : ""}
                              {address.ilce || address.il ? `, ${[address.ilce, address.il].filter(Boolean).join("/")}` : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground">Kayıtlı adresiniz yok. Teslimat için bir adres kaydedin.</p>
                  )}
                  {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                </div>
              )}
              {!user && (
                <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ad">Ad *</Label>
                  <Input id="ad" autoComplete="given-name" {...register("ad")} />
                  <FieldError message={errors.ad?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soyad">Soyad *</Label>
                  <Input id="soyad" autoComplete="family-name" {...register("soyad")} />
                  <FieldError message={errors.soyad?.message} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefon">Telefon *</Label>
                  <PhoneInput id="telefon" {...register("telefon")} />
                  <FieldError message={errors.telefon?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mail">E-posta *</Label>
                  <Input id="mail" type="email" autoComplete="email" {...register("mail")} />
                  <FieldError message={errors.mail?.message} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="il">İl *</Label>
                  <Input id="il" autoComplete="address-level1" {...register("il")} />
                  <FieldError message={errors.il?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ilce">İlçe *</Label>
                  <Input id="ilce" autoComplete="address-level2" {...register("ilce")} />
                  <FieldError message={errors.ilce?.message} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mahalle">Mahalle</Label>
                  <Input id="mahalle" {...register("mahalle")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baslik">Adres başlığı</Label>
                  <Input id="baslik" placeholder="Ev, iş" {...register("baslik")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adres">Açık adres *</Label>
                <Textarea id="adres" autoComplete="street-address" {...register("adres")} />
                <FieldError message={errors.adres?.message} />
              </div>
                </>
              )}

              <div className="space-y-3 rounded-[var(--radius-card)] border border-border p-4">
                <p className="text-sm font-semibold">Fatura</p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="size-4 accent-primary" {...register("faturaAyni")} />
                  Fatura adresim teslimat adresimle aynı
                </label>
                <div className="flex gap-2">
                  {(["BIREYSEL", "KURUMSAL"] as const).map((tip) => (
                    <label key={tip} className="flex items-center gap-2 text-sm">
                      <input type="radio" value={tip} {...register("faturaTipi")} />
                      {tip === "BIREYSEL" ? "Bireysel" : "Kurumsal"}
                    </label>
                  ))}
                </div>
                {faturaTipi === "KURUMSAL" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="sirketUnvani">Şirket unvanı *</Label>
                      <Input id="sirketUnvani" {...register("sirketUnvani")} />
                      <FieldError message={errors.sirketUnvani?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vergiDairesi">Vergi dairesi *</Label>
                      <Input id="vergiDairesi" {...register("vergiDairesi")} />
                      <FieldError message={errors.vergiDairesi?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vergiNo">Vergi numarası *</Label>
                      <Input id="vergiNo" inputMode="numeric" {...register("vergiNo")} />
                      <FieldError message={errors.vergiNo?.message} />
                    </div>
                  </div>
                )}
                {!faturaAyni && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="faturaAd">Fatura adı *</Label>
                      <Input id="faturaAd" {...register("faturaAd")} />
                      <FieldError message={errors.faturaAd?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faturaSoyad">Fatura soyadı *</Label>
                      <Input id="faturaSoyad" {...register("faturaSoyad")} />
                      <FieldError message={errors.faturaSoyad?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faturaTelefon">Fatura telefonu *</Label>
                      <PhoneInput id="faturaTelefon" {...register("faturaTelefon")} />
                      <FieldError message={errors.faturaTelefon?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faturaMail">Fatura e-posta *</Label>
                      <Input id="faturaMail" type="email" {...register("faturaMail")} />
                      <FieldError message={errors.faturaMail?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faturaIl">Fatura ili *</Label>
                      <Input id="faturaIl" {...register("faturaIl")} />
                      <FieldError message={errors.faturaIl?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faturaIlce">Fatura ilçesi *</Label>
                      <Input id="faturaIlce" {...register("faturaIlce")} />
                      <FieldError message={errors.faturaIlce?.message} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="faturaAdres">Fatura açık adresi *</Label>
                      <Textarea id="faturaAdres" {...register("faturaAdres")} />
                      <FieldError message={errors.faturaAdres?.message} />
                    </div>
                  </div>
                )}
              </div>

              <Button type="button" size="lg" className="hidden w-full lg:inline-flex" onClick={goNext}>
                Ödeme Adımına Geç
              </Button>
            </CardContent>
          </Card>
        )}

        {activeStep === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle>Ödeme yöntemi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer gap-3 rounded-[var(--radius-card)] border border-border p-4">
                <input type="radio" value="HAVALE_EFT" {...register("odemeYontemi")} />
                <span>
                  <span className="block font-semibold">Havale / EFT</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Sipariş ödeme onayına alınır. Ödeme gelene kadar ödenmiş sayılmaz. Kart bilgisi istenmez.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer gap-3 rounded-[var(--radius-card)] border border-border p-4">
                <input type="radio" value="KAPIDA_ODEME" {...register("odemeYontemi")} />
                <span>
                  <span className="block font-semibold">Kapıda ödeme</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Tutar teslimatta tahsil edilir. Sipariş şimdi ödenmiş olarak işaretlenmez.
                  </span>
                </span>
              </label>
              {odemeYontemi === "HAVALE_EFT" && (
                <p className="text-sm text-muted-foreground">
                  Havale bilgisi mağaza tarafından iletilir. Bu ekranda kart numarası veya CVV alınmaz.
                </p>
              )}
              {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              <div className="hidden gap-3 lg:flex">
                <Button type="button" variant="outline" onClick={backToDelivery}>
                  Teslimata dön
                </Button>
                <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting || preview.isLoading || preview.isError || total == null}>
                  {buttonLabel}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">Sipariş özeti</h2>
          {(quote?.kalemler ?? items.map((item) => ({
            firmaUrunId: item.urunId,
            urunIsim: item.isim,
            varyantBilgisi: variantText(item.renk, item.beden),
            resim: item.resim,
            adet: item.adet,
            birimFiyat: item.birimFiyat,
            tutar: item.birimFiyat * item.adet,
            indirimTutar: 0,
          }))).map((item) => (
            <div key={`${item.firmaUrunId}-${item.varyantBilgisi}`} className="flex gap-3 text-sm">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {item.resim ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.resim} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-medium">{item.urunIsim}</p>
                {item.varyantBilgisi && <p className="text-xs text-muted-foreground">{item.varyantBilgisi}</p>}
                <p className="text-xs text-muted-foreground">
                  {item.adet} adet · {formatPrice(item.birimFiyat ?? 0)}
                </p>
              </div>
              <span className="font-semibold">{formatPrice(item.tutar ?? 0)}</span>
            </div>
          ))}
          <Separator />
          {preview.isLoading && <p className="text-sm text-muted-foreground">Tutarlar doğrulanıyor...</p>}
          {preview.isError && <p className="text-sm text-destructive">{getApiErrorMessage(preview.error)}</p>}
          {quote?.uyari && <p className="text-sm text-destructive">{quote.uyari}</p>}
          <div className="flex justify-between text-sm">
            <span>{LABELS.subtotal}</span>
            <span>{quote ? formatPrice(quote.araToplam ?? 0) : "—"}</span>
          </div>
          {(quote?.indirimTutar ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span>Ürün indirimi</span>
              <span>-{formatPrice(quote?.indirimTutar ?? 0)}</span>
            </div>
          )}
          {(quote?.sepetKampanyaIndirimTutar ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span>Sepet kampanyası</span>
              <span>-{formatPrice(quote?.sepetKampanyaIndirimTutar ?? 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>{LABELS.shipping}</span>
            <span>
              {quote
                ? (quote.ucretsizKargoLimiti ?? 0) > 0 && (quote.araToplam ?? 0) < (quote.ucretsizKargoLimiti ?? 0)
                  ? shippingMessage(quote.araToplam ?? 0, quote.ucretsizKargoLimiti, quote.standartKargoUcreti)
                  : quote.kargoTutar
                    ? formatPrice(quote.kargoTutar)
                    : LABELS.freeShipping
                : "—"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {shippingPolicyText(quote?.ucretsizKargoLimiti, quote?.standartKargoUcreti)}
          </p>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>{LABELS.total}</span>
            <span>{quote ? formatPrice(quote.toplam ?? 0) : "—"}</span>
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-3 lg:hidden">
        {activeStep === "delivery" ? (
          <div className="flex gap-2">
            {guest && !user && (
              <Button type="button" variant="outline" className="h-12" onClick={backToChoices}>
                Geri
              </Button>
            )}
            <Button type="button" className="h-12 flex-1" onClick={goNext}>
              Ödeme Adımına Geç
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-12" onClick={backToDelivery}>
              Geri
            </Button>
            <Button type="submit" className="h-12 flex-1" disabled={isSubmitting || preview.isLoading || preview.isError || total == null}>
              {buttonLabel}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
