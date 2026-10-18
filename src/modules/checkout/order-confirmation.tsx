"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHECKOUT_GUEST_KEY, CHECKOUT_IDEMPOTENCY_KEY, CHECKOUT_RESULT_KEY, LABELS, ROUTES } from "@/config/constants";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useCartStore } from "@/hooks/use-cart-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { getApiErrorMessage } from "@/api/client";
import { storeService } from "@/services/store.service";
import { formatPrice } from "@/lib/utils";
import type { StoreSiparisSonucDto } from "@/types/api";
import { toast } from "sonner";

function readStoredOrder(): StoreSiparisSonucDto | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CHECKOUT_RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoreSiparisSonucDto;
  } catch {
    return null;
  }
}

function paymentLabel(order: StoreSiparisSonucDto) {
  if (order.odendi) return "Ödendi";
  if (order.odemeDurum === "KAPIDA_BEKLIYOR") return "Kapıda ödeme — henüz tahsil edilmedi";
  if (order.odemeYontemi === "PAYTR") return "Kart ödemesi bekleniyor";
  if (order.odemeYontemi === "HAVALE_EFT" || order.odemeDurum === "BEKLEMEDE") {
    return "Havale bekleniyor — sipariş ödenmiş değil";
  }
  return "Ödeme bekleniyor";
}

export function OrderConfirmation() {
  const firmaId = useFirmaId();
  const user = useAuthStore((s) => s.user);
  const registerUser = useAuthStore((s) => s.register);
  const clearCart = useCartStore((s) => s.clearCart);
  const [paytrFail, setPaytrFail] = useState(false);
  const [order, setOrder] = useState<StoreSiparisSonucDto | null>(null);
  const [ready, setReady] = useState(false);
  const [siparisNo, setSiparisNo] = useState("");
  const [takipToken, setTakipToken] = useState("");
  const [parola, setParola] = useState("");
  const [busy, setBusy] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const stored = readStoredOrder();
    const failed = new URLSearchParams(window.location.search).get("paytr") === "fail";
    setOrder(stored);
    setPaytrFail(failed);
    setReady(true);
    if (stored && !failed) {
      sessionStorage.removeItem(CHECKOUT_IDEMPOTENCY_KEY);
      sessionStorage.removeItem(CHECKOUT_GUEST_KEY);
      clearCart();
    }
  }, [clearCart]);

  useEffect(() => {
    if (!order?.siparisNo || order.odemeYontemi !== "PAYTR" || order.odendi || paytrFail) {
      return;
    }
    let tries = 0;
    const timer = window.setInterval(async () => {
      tries += 1;
      try {
        const result = await storeService.trackOrder({
          firmaId,
          siparisNo: order.siparisNo!,
          takipToken: order.takipToken,
        });
        const next = { ...order, ...result, takipToken: order.takipToken };
        setOrder(next);
        sessionStorage.setItem(CHECKOUT_RESULT_KEY, JSON.stringify(next));
        if (next.odendi || tries >= 8) {
          window.clearInterval(timer);
        }
      } catch {
        if (tries >= 8) window.clearInterval(timer);
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [firmaId, order?.odendi, order?.odemeYontemi, order?.siparisNo, order?.takipToken, paytrFail]);

  const lookup = async (payload: { siparisNo: string; takipToken?: string }) => {
    setBusy(true);
    try {
      const result = await storeService.trackOrder({ firmaId, ...payload });
      const stored = readStoredOrder();
      const next = { ...result, takipToken: payload.takipToken || stored?.takipToken };
      setOrder(next);
      if (next.takipToken) sessionStorage.setItem(CHECKOUT_RESULT_KEY, JSON.stringify(next));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const createAccount = async () => {
    if (!order?.email || !order.siparisNo || !order.takipToken) return;
    setBusy(true);
    try {
      await registerUser({
        firmaId,
        email: order.email,
        ad: order.musteriAdi ?? "",
        soyad: order.musteriSoyadi ?? "",
        telefon: order.telefon,
        parola,
      });
      await storeService.claimOrder({ firmaId, siparisNo: order.siparisNo, takipToken: order.takipToken });
      setClaimed(true);
      toast.success("Hesabınız oluşturuldu ve sipariş bağlandı");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const claimExisting = async () => {
    if (!order?.siparisNo || !order.takipToken) return;
    setBusy(true);
    try {
      await storeService.claimOrder({ firmaId, siparisNo: order.siparisNo, takipToken: order.takipToken });
      setClaimed(true);
      toast.success("Sipariş hesabınıza bağlandı");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  if (!order) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Sipariş takibi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sipariş numarası tek başına yetmez. Onay ekranındaki takip anahtarını da girin.
          </p>
          <div className="space-y-2">
            <Label htmlFor="siparisNo">Sipariş numarası</Label>
            <Input id="siparisNo" value={siparisNo} onChange={(event) => setSiparisNo(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="takipToken">Takip anahtarı</Label>
            <Input id="takipToken" value={takipToken} onChange={(event) => setTakipToken(event.target.value)} />
          </div>
          <Button
            className="w-full"
            disabled={busy || !siparisNo || !takipToken}
            onClick={() => lookup({ siparisNo, takipToken })}
          >
            Siparişi göster
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {paytrFail ? "Ödeme alınamadı" : order.odendi ? "Ödemeniz alındı" : "Siparişiniz oluşturuldu"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sipariş no: <span className="font-semibold text-foreground">{order.siparisNo}</span>
        </p>
        {paytrFail && (
          <p className="mt-2 text-sm text-destructive">
            Kart ödemesi tamamlanmadı. Sipariş ödenmiş değil. Ödemeyi tekrar denemek için sepete dönüp yeniden deneyebilirsiniz.
          </p>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-sm font-semibold">{paymentLabel(order)}</p>
          {order.kalemler?.map((item) => (
            <div key={`${item.firmaUrunId}-${item.urunIsim}`} className="flex justify-between gap-3 text-sm">
              <span>
                {item.urunIsim}
                {item.varyantBilgisi ? ` · ${item.varyantBilgisi}` : ""} × {item.adet}
              </span>
              <span>{formatPrice(item.tutar ?? 0)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 font-semibold">
            <span>{LABELS.total}</span>
            <span>{formatPrice(order.toplam ?? 0)}</span>
          </div>
          {order.teslimatAdres && (
            <p className="text-sm text-muted-foreground">
              Teslimat: {order.teslimatAdres}
            </p>
          )}
          {order.faturaAdres && order.faturaAdres !== order.teslimatAdres && (
            <p className="text-sm text-muted-foreground">Fatura: {order.faturaAdres}</p>
          )}
          {order.takipToken && (
            <p className="break-all text-xs text-muted-foreground">
              Takip anahtarı: {order.takipToken}
            </p>
          )}
        </CardContent>
      </Card>

      {!user && !claimed && order.email && order.takipToken && (
        <Card>
          <CardHeader>
            <CardTitle>İsterseniz hesap açın</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Zorunlu değil. Şifre belirlerseniz sipariş {order.email} hesabına bağlanır.
            </p>
            <div className="space-y-2">
              <Label htmlFor="parola">Şifre</Label>
              <Input id="parola" type="password" value={parola} onChange={(event) => setParola(event.target.value)} />
            </div>
            <Button disabled={busy || parola.length < 6} onClick={createAccount}>
              Hesap oluştur
            </Button>
          </CardContent>
        </Card>
      )}

      {user && !claimed && order.takipToken && (
        <Button variant="outline" disabled={busy} onClick={claimExisting}>
          Siparişi hesabıma bağla
        </Button>
      )}

      <Button asChild>
        <Link href={ROUTES.home}>{LABELS.continueShopping}</Link>
      </Button>
    </div>
  );
}
