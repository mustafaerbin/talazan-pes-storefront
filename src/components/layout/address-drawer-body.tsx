"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LABELS } from "@/config/constants";
import { useAuthStore } from "@/hooks/use-auth-store";
import { isPhoneValid } from "@/lib/phone";
import { getApiErrorMessage } from "@/api/client";
import { accountService } from "@/services/account.service";
import type { SiteMusteriAdresDto } from "@/types/api";
import { toast } from "sonner";

const addressSchema = z.object({
  baslik: z.string().trim().min(2, "Adres başlığı gerekli"),
  ad: z.string().trim().min(2, "Ad gerekli"),
  soyad: z.string().trim().min(2, "Soyad gerekli"),
  telefon: z.string().trim().refine(isPhoneValid, "Geçerli bir telefon numarası girin"),
  il: z.string().trim().min(2, "İl gerekli"),
  ilce: z.string().trim().min(2, "İlçe gerekli"),
  mahalle: z.string().trim().optional(),
  adresSatiri: z.string().trim().min(10, "Açık adres en az 10 karakter olmalı"),
});

type AddressForm = z.infer<typeof addressSchema>;

interface AddressDrawerBodyProps {
  onClose: () => void;
}

export function AddressDrawerBody({ onClose }: AddressDrawerBodyProps) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      ad: user?.ad ?? "",
      soyad: user?.soyad ?? "",
      mahalle: "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: AddressForm) => {
      const existing = queryClient.getQueryData<SiteMusteriAdresDto[]>(["addresses"]) ?? [];
      return accountService.saveAddress({
        ...data,
        firmaId: user?.firmaId,
        varsayilan: existing.length === 0,
      });
    },
    onSuccess: async () => {
      toast.success("Adres kaydedildi");
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <MapPin className="size-5 text-primary" />
          <h2 className="text-lg font-extrabold tracking-tight text-foreground">{LABELS.addAddress}</h2>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-primary/10 text-foreground hover:bg-primary/15"
          onClick={onClose}
          aria-label="Kapat"
        >
          <X className="size-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drawer-adres-baslik">Adres başlığı</Label>
            <Input id="drawer-adres-baslik" placeholder="Ev, iş" {...register("baslik")} />
            {errors.baslik && <p className="text-sm text-destructive">{errors.baslik.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drawer-adres-ad">{LABELS.firstName}</Label>
              <Input id="drawer-adres-ad" autoComplete="given-name" {...register("ad")} />
              {errors.ad && <p className="text-sm text-destructive">{errors.ad.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawer-adres-soyad">{LABELS.lastName}</Label>
              <Input id="drawer-adres-soyad" autoComplete="family-name" {...register("soyad")} />
              {errors.soyad && <p className="text-sm text-destructive">{errors.soyad.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="drawer-adres-telefon">{LABELS.phone}</Label>
            <PhoneInput id="drawer-adres-telefon" {...register("telefon")} />
            {errors.telefon && <p className="text-sm text-destructive">{errors.telefon.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drawer-adres-il">{LABELS.city}</Label>
              <Input id="drawer-adres-il" {...register("il")} />
              {errors.il && <p className="text-sm text-destructive">{errors.il.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawer-adres-ilce">{LABELS.district}</Label>
              <Input id="drawer-adres-ilce" {...register("ilce")} />
              {errors.ilce && <p className="text-sm text-destructive">{errors.ilce.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="drawer-adres-mahalle">{LABELS.neighborhood}</Label>
            <Input id="drawer-adres-mahalle" {...register("mahalle")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drawer-adres-satiri">{LABELS.address}</Label>
            <Textarea id="drawer-adres-satiri" {...register("adresSatiri")} />
            {errors.adresSatiri && <p className="text-sm text-destructive">{errors.adresSatiri.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || saveMutation.isPending}>
            {LABELS.save}
          </Button>
        </form>
      </div>
    </>
  );
}
