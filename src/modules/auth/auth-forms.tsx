"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LABELS, ROUTES } from "@/config/constants";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFirmaId } from "@/hooks/use-firma-id";
import { isPhoneValid } from "@/lib/phone";
import { safeReturnTo } from "@/lib/safe-return";
import { getApiErrorMessage } from "@/api/client";
import { toast } from "sonner";

function authHref(path: string, returnTo: string | null) {
  const safe = safeReturnTo(returnTo, "");
  if (!safe) return path;
  return `${path}?returnTo=${encodeURIComponent(safe)}`;
}

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  parola: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginFormProps {
  embedded?: boolean;
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ embedded = false, onSuccess, onSwitchToRegister }: LoginFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firmaId = useFirmaId();
  const login = useAuthStore((s) => s.login);
  const fieldId = (name: string) => (embedded ? `drawer-login-${name}` : name);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login({ firmaId, email: data.email, parola: data.parola });
      toast.success("Giriş başarılı");
      if (onSuccess) onSuccess();
      else router.push(safeReturnTo(searchParams.get("returnTo"), ROUTES.account));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const form = (
    <>
      {embedded && <p className="mb-5 text-sm text-muted-foreground">{LABELS.welcomeBack}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={fieldId("email")}>{LABELS.email}</Label>
          <Input id={fieldId("email")} type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldId("parola")}>{LABELS.password}</Label>
          <Input id={fieldId("parola")} type="password" autoComplete="current-password" {...register("parola")} />
          {errors.parola && <p className="text-sm text-destructive">{errors.parola.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {LABELS.login}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {LABELS.dontHaveAccount}{" "}
        {onSwitchToRegister ? (
          <button type="button" onClick={onSwitchToRegister} className="font-medium text-primary hover:underline">
            {LABELS.register}
          </button>
        ) : (
          <Link href={authHref(ROUTES.register, searchParams.get("returnTo"))} className="font-medium text-primary hover:underline">
            {LABELS.register}
          </Link>
        )}
      </p>
    </>
  );

  if (embedded) return form;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{LABELS.login}</CardTitle>
        <CardDescription>{LABELS.welcomeBack}</CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
}

const registerSchema = z.object({
  ad: z.string().min(2, "Ad en az 2 karakter olmalı"),
  soyad: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  telefon: z
    .string()
    .optional()
    .refine((value) => !value?.trim() || isPhoneValid(value), "Geçerli bir telefon numarası girin"),
  parola: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type RegisterForm = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  embedded?: boolean;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ embedded = false, onSuccess, onSwitchToLogin }: RegisterFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firmaId = useFirmaId();
  const registerUser = useAuthStore((s) => s.register);
  const fieldId = (name: string) => (embedded ? `drawer-register-${name}` : name);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({ firmaId, ...data });
      toast.success("Kayıt başarılı");
      if (onSuccess) onSuccess();
      else router.push(safeReturnTo(searchParams.get("returnTo"), ROUTES.account));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const form = (
    <>
      {embedded && <p className="mb-5 text-sm text-muted-foreground">{LABELS.createAccount}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={fieldId("ad")}>{LABELS.firstName}</Label>
            <Input id={fieldId("ad")} autoComplete="given-name" {...register("ad")} />
            {errors.ad && <p className="text-sm text-destructive">{errors.ad.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor={fieldId("soyad")}>{LABELS.lastName}</Label>
            <Input id={fieldId("soyad")} autoComplete="family-name" {...register("soyad")} />
            {errors.soyad && <p className="text-sm text-destructive">{errors.soyad.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldId("email")}>{LABELS.email}</Label>
          <Input id={fieldId("email")} type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldId("telefon")}>{LABELS.phone}</Label>
          <PhoneInput id={fieldId("telefon")} {...register("telefon")} />
          {errors.telefon && <p className="text-sm text-destructive">{errors.telefon.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldId("parola")}>{LABELS.password}</Label>
          <Input id={fieldId("parola")} type="password" autoComplete="new-password" {...register("parola")} />
          {errors.parola && <p className="text-sm text-destructive">{errors.parola.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {LABELS.register}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {LABELS.alreadyHaveAccount}{" "}
        {onSwitchToLogin ? (
          <button type="button" onClick={onSwitchToLogin} className="font-medium text-primary hover:underline">
            {LABELS.login}
          </button>
        ) : (
          <Link href={authHref(ROUTES.login, searchParams.get("returnTo"))} className="font-medium text-primary hover:underline">
            {LABELS.login}
          </Link>
        )}
      </p>
    </>
  );

  if (embedded) return form;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{LABELS.register}</CardTitle>
        <CardDescription>{LABELS.createAccount}</CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
}
