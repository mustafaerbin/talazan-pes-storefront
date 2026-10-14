"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSkeleton, ProductGridSkeleton } from "@/components/ui/skeleton-loaders";
import { LABELS, ROUTES } from "@/config/constants";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { useAuthStore, useOrdersStore } from "@/hooks/use-auth-store";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { getApiErrorMessage } from "@/api/client";
import { accountService } from "@/services/account.service";
import { storeService } from "@/services/store.service";
import { formatPhoneInput, isPhoneValid } from "@/lib/phone";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const profileSchema = z.object({
  ad: z.string().min(2),
  soyad: z.string().min(2),
  email: z.string().email(),
  telefon: z
    .string()
    .optional()
    .refine((value) => !value?.trim() || isPhoneValid(value), "Geçerli bir telefon numarası girin"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const accountMenu = [
  { href: ROUTES.account, label: LABELS.account },
  { href: ROUTES.orders, label: LABELS.orders },
  { href: ROUTES.favorites, label: LABELS.favorites },
  { href: ROUTES.addresses, label: LABELS.addresses },
];

function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="grid items-start gap-4 grid-cols-[minmax(9.5rem,220px)_minmax(0,1fr)] sm:gap-8">
      <aside className="rounded-[var(--radius-card)] border border-border bg-card p-2 sm:p-3">
        <nav className="flex flex-col gap-1">
          {accountMenu.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[var(--radius-btn)] px-3 py-2.5 text-sm font-semibold",
                  active ? "bg-primary text-white" : "text-foreground hover:bg-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button type="button" variant="outline" className="mt-3 w-full text-foreground" onClick={logout}>
          {LABELS.logout}
        </Button>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function AccountProfile() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
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
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (profile) {
      reset({
        ad: profile.ad ?? "",
        soyad: profile.soyad ?? "",
        email: profile.email ?? "",
        telefon: formatPhoneInput(profile.telefon ?? ""),
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
    <AccountShell>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{LABELS.account}</h1>

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
                <PhoneInput {...register("telefon")} />
                {errors.telefon && <p className="text-sm text-destructive">{errors.telefon.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {LABELS.save}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
    </AccountShell>
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
    <AccountShell>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{LABELS.orders}</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">{LABELS.emptyOrders}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.siparisNo}>
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
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
                </div>
                {order.kalemler && order.kalemler.length > 0 && (
                  <ul className="space-y-2 border-t border-border pt-3">
                    {order.kalemler.map((kalem, index) => {
                      const urunId = kalem.firmaUrunId;
                      const href = urunId
                        ? `${ROUTES.product(kalem.slug ?? String(urunId))}#degerlendirmeler`
                        : undefined;
                      const teslimEdildi = order.siparisDurum === "TESLIM_EDILDI";
                      return (
                        <li key={`${order.siparisNo}-${urunId ?? index}`} className="flex items-center justify-between gap-3 text-sm">
                          <span className="line-clamp-1">{kalem.urunIsim}</span>
                          {href && teslimEdildi && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={href}>Değerlendir</Link>
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </AccountShell>
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

  const { addProduct } = useAddToCart();
  const removeMutation = useMutation({
    mutationFn: accountService.removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  if (!isHydrated || !user) return <ProductGridSkeleton count={4} />;

  return (
    <AccountShell>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{LABELS.favorites}</h1>
      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : favoriteIds.length === 0 ? (
        <p className="text-muted-foreground">{LABELS.emptyFavorites}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite
              onAddToCart={addProduct}
              onToggleFavorite={() => removeMutation.mutate(product.id)}
            />
          ))}
        </div>
      )}
    </div>
    </AccountShell>
  );
}

export function AddressesView() {
  const router = useRouter();
  const openAddress = useSidePanelStore((s) => s.openAddress);
  const { user, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => accountService.getAddresses(),
    enabled: !!user,
  });

  useEffect(() => {
    if (isHydrated && !user) router.push(ROUTES.login);
  }, [isHydrated, user, router]);

  const deleteMutation = useMutation({
    mutationFn: accountService.deleteAddress,
    onSuccess: () => {
      toast.success("Adres silindi");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  if (!isHydrated) return <ContentSkeleton />;

  return (
    <AccountShell>
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">{LABELS.addresses}</h1>
        <Button type="button" onClick={openAddress}>{LABELS.addAddress}</Button>
      </div>

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
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">{LABELS.defaultAddress}</span>
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
    </div>
    </AccountShell>
  );
}
