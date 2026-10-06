"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSkeleton, ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { LABELS, ROUTES } from "@/config/constants";
import { useAuthStore, useOrdersStore } from "@/hooks/use-auth-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { getApiErrorMessage } from "@/api/client";
import { accountService } from "@/services/account.service";
import { storeService } from "@/services/store.service";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const profileSchema = z.object({
  ad: z.string().min(2),
  soyad: z.string().min(2),
  email: z.string().email(),
  telefon: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function AccountProfile() {
  const router = useRouter();
  const { user, isHydrated, logout } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isHydrated && !user) {
      router.push(ROUTES.login);
    }
  }, [isHydrated, user, router]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => accountService.getProfile(),
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (profile) {
      reset({
        ad: profile.ad ?? "",
        soyad: profile.soyad ?? "",
        email: profile.email ?? "",
        telefon: profile.telefon ?? "",
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: accountService.updateProfile,
    onSuccess: () => {
      toast.success("Profil güncellendi");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (!isHydrated || !user) return <ContentSkeleton />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{LABELS.account}</h1>
        <Button variant="outline" onClick={logout}>
          {LABELS.logout}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" asChild>
          <Link href={ROUTES.orders}>{LABELS.orders}</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={ROUTES.favorites}>{LABELS.favorites}</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={ROUTES.addresses}>{LABELS.addresses}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{LABELS.updateProfile}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ContentSkeleton />
          ) : (
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{LABELS.firstName}</Label>
                  <Input {...register("ad")} />
                </div>
                <div className="space-y-2">
                  <Label>{LABELS.lastName}</Label>
                  <Input {...register("soyad")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{LABELS.email}</Label>
                <Input {...register("email")} disabled />
              </div>
              <div className="space-y-2">
                <Label>{LABELS.phone}</Label>
                <Input {...register("telefon")} />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {LABELS.save}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function OrdersView() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const orders = useOrdersStore((s) => s.orders);

  useEffect(() => {
    if (isHydrated && !user) router.push(ROUTES.login);
  }, [isHydrated, user, router]);

  if (!isHydrated) return <ContentSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{LABELS.orders}</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">{LABELS.emptyOrders}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.siparisNo}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {LABELS.orderNumber}: {order.siparisNo}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.tarih).toLocaleDateString("tr-TR")} · {order.urunSayisi} ürün
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.tutar)}</p>
                  <p className="text-sm text-muted-foreground">{order.durum}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function FavoritesView() {
  const router = useRouter();
  const firmaId = useFirmaId();
  const { user, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => accountService.getFavorites(),
    enabled: !!user,
  });

  const { data: allProducts } = useQuery({
    queryKey: ["products-for-favorites", firmaId],
    queryFn: async () => {
      const { items } = await storeService.getProducts(firmaId, { size: 100 });
      return items;
    },
    enabled: favoriteIds.length > 0,
  });

  const products = (allProducts ?? []).filter((p) => favoriteIds.includes(p.id));

  useEffect(() => {
    if (isHydrated && !user) router.push(ROUTES.login);
  }, [isHydrated, user, router]);

  const removeMutation = useMutation({
    mutationFn: accountService.removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  if (!isHydrated || isLoading) return <ProductGridSkeleton count={4} />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{LABELS.favorites}</h1>
      {favoriteIds.length === 0 ? (
        <p className="text-muted-foreground">{LABELS.emptyFavorites}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite
              onToggleFavorite={() => removeMutation.mutate(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const addressSchema = z.object({
  baslik: z.string().min(2),
  ad: z.string().min(2),
  soyad: z.string().min(2),
  telefon: z.string().min(10),
  il: z.string().min(2),
  ilce: z.string().min(2),
  adresSatiri: z.string().min(5),
  postaKodu: z.string().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

export function AddressesView() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => accountService.getAddresses(),
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  useEffect(() => {
    if (isHydrated && !user) router.push(ROUTES.login);
  }, [isHydrated, user, router]);

  const saveMutation = useMutation({
    mutationFn: accountService.saveAddress,
    onSuccess: () => {
      toast.success("Adres kaydedildi");
      reset();
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: accountService.deleteAddress,
    onSuccess: () => {
      toast.success("Adres silindi");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  if (!isHydrated) return <ContentSkeleton />;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{LABELS.addresses}</h1>

      {isLoading ? (
        <ContentSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{addr.baslik}</p>
                  {addr.varsayilan && (
                    <span className="text-xs text-primary">{LABELS.defaultAddress}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {addr.ad} {addr.soyad} · {addr.telefon}
                </p>
                <p className="text-sm">
                  {addr.adresSatiri}, {addr.ilce}/{addr.il}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => addr.id && deleteMutation.mutate(addr.id)}
                >
                  {LABELS.delete}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{LABELS.addAddress}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) =>
              saveMutation.mutate({ ...data, firmaId: user?.firmaId }),
            )}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label>Başlık</Label>
              <Input {...register("baslik")} placeholder="Ev, İş..." />
            </div>
            <div className="space-y-2">
              <Label>{LABELS.phone}</Label>
              <Input {...register("telefon")} />
            </div>
            <div className="space-y-2">
              <Label>{LABELS.firstName}</Label>
              <Input {...register("ad")} />
            </div>
            <div className="space-y-2">
              <Label>{LABELS.lastName}</Label>
              <Input {...register("soyad")} />
            </div>
            <div className="space-y-2">
              <Label>{LABELS.city}</Label>
              <Input {...register("il")} />
            </div>
            <div className="space-y-2">
              <Label>{LABELS.district}</Label>
              <Input {...register("ilce")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{LABELS.address}</Label>
              <Input {...register("adresSatiri")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {LABELS.save}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
