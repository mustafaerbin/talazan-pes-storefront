import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { AUTH_STORAGE_KEY } from "@/config/constants";
import type { AppResponse, SiteMusteriAuthResponseDto } from "@/types/api";

interface AuthStorage {
  accessToken: string;
  refreshToken: string;
  musteriId: number;
  firmaId: number;
  email: string;
  ad: string;
  soyad: string;
}

let refreshPromise: Promise<SiteMusteriAuthResponseDto | null> | null = null;

export function getAuthStorage(): AuthStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthStorage) : null;
  } catch {
    return null;
  }
}

export function setAuthStorage(auth: AuthStorage | null) {
  if (typeof window === "undefined") return;
  if (auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = getAuthStorage();
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<SiteMusteriAuthResponseDto | null> {
  const auth = getAuthStorage();
  if (!auth?.refreshToken) return null;

  try {
    const response = await axios.post<AppResponse<SiteMusteriAuthResponseDto>>(
      `${env.apiUrl}/public/store/auth/refresh`,
      { refreshToken: auth.refreshToken },
    );
    const data = response.data.data;
    if (!data) return null;

    setAuthStorage({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      musteriId: data.musteriId,
      firmaId: data.firmaId,
      email: data.email,
      ad: data.ad,
      soyad: data.soyad,
    });
    return data;
  } catch {
    setAuthStorage(null);
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const refreshed = await refreshPromise;
      if (refreshed?.accessToken) {
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return apiClient(originalRequest);
      }
    }

    if (error instanceof AggregateError && !error.message) {
      error.message = "API sunucusuna bağlanılamadı";
    }
    return Promise.reject(error);
  },
);

export function unwrapData<T>(response: AppResponse<T>): T {
  if (response.errorMessage) {
    throw new Error(response.errorMessage);
  }
  if (response.data === undefined) {
    throw new Error("Veri bulunamadı");
  }
  return response.data;
}

export function unwrapList<T>(response: AppResponse<T>): T {
  if (response.errorMessage) {
    throw new Error(response.errorMessage);
  }
  return (response.data ?? []) as T;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as (AppResponse<unknown> & { message?: string }) | undefined;
    return data?.errorMessage ?? data?.message ?? error.message ?? "Bir hata oluştu";
  }
  if (error instanceof Error) return error.message;
  return "Bir hata oluştu";
}
