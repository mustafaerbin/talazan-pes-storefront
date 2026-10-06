import { apiClient, setAuthStorage, unwrapData } from "@/api/client";
import type {
  AppResponse,
  SiteMusteriAuthResponseDto,
  SiteMusteriLoginDto,
  SiteMusteriRegisterDto,
} from "@/types/api";

const AUTH_BASE = "/public/store/auth";

export const authService = {
  async register(payload: SiteMusteriRegisterDto): Promise<SiteMusteriAuthResponseDto> {
    const { data } = await apiClient.post<AppResponse<SiteMusteriAuthResponseDto>>(
      `${AUTH_BASE}/register`,
      payload,
    );
    const result = unwrapData(data);
    setAuthStorage({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      musteriId: result.musteriId,
      firmaId: result.firmaId,
      email: result.email,
      ad: result.ad,
      soyad: result.soyad,
    });
    return result;
  },

  async login(payload: SiteMusteriLoginDto): Promise<SiteMusteriAuthResponseDto> {
    const { data } = await apiClient.post<AppResponse<SiteMusteriAuthResponseDto>>(
      `${AUTH_BASE}/login`,
      payload,
    );
    const result = unwrapData(data);
    setAuthStorage({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      musteriId: result.musteriId,
      firmaId: result.firmaId,
      email: result.email,
      ad: result.ad,
      soyad: result.soyad,
    });
    return result;
  },

  logout() {
    setAuthStorage(null);
  },
};
