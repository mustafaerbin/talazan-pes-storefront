"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LABELS, ROUTES } from "@/config/constants";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { getApiErrorMessage } from "@/api/client";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  parola: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const firmaId = useFirmaId();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login({ firmaId, email: data.email, parola: data.parola });
      toast.success("Giriş başarılı");
      router.push(ROUTES.account);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{LABELS.login}</CardTitle>
        <CardDescription>{LABELS.welcomeBack}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{LABELS.email}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="parola">{LABELS.password}</Label>
            <Input id="parola" type="password" {...register("parola")} />
            {errors.parola && <p className="text-sm text-destructive">{errors.parola.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {LABELS.login}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {LABELS.dontHaveAccount}{" "}
          <Link href={ROUTES.register} className="font-medium text-primary hover:underline">
            {LABELS.register}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

const registerSchema = z.object({
  ad: z.string().min(2, "Ad en az 2 karakter olmalı"),
  soyad: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  telefon: z.string().optional(),
  parola: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const firmaId = useFirmaId();
  const registerUser = useAuthStore((s) => s.register);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({ firmaId, ...data });
      toast.success("Kayıt başarılı");
      router.push(ROUTES.account);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{LABELS.register}</CardTitle>
        <CardDescription>{LABELS.createAccount}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ad">{LABELS.firstName}</Label>
              <Input id="ad" {...register("ad")} />
              {errors.ad && <p className="text-sm text-destructive">{errors.ad.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="soyad">{LABELS.lastName}</Label>
              <Input id="soyad" {...register("soyad")} />
              {errors.soyad && <p className="text-sm text-destructive">{errors.soyad.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{LABELS.email}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefon">{LABELS.phone}</Label>
            <Input id="telefon" {...register("telefon")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parola">{LABELS.password}</Label>
            <Input id="parola" type="password" {...register("parola")} />
            {errors.parola && <p className="text-sm text-destructive">{errors.parola.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {LABELS.register}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {LABELS.alreadyHaveAccount}{" "}
          <Link href={ROUTES.login} className="font-medium text-primary hover:underline">
            {LABELS.login}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
