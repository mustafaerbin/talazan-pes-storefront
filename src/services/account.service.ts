import { apiClient, unwrapData, unwrapList } from "@/api/client";
import type {
  AppPageResponse,
  AppResponse,
  SiteMusteriAdresDto,
  SiteMusteriDto,
} from "@/types/api";

const ACCOUNT_BASE = "/public/store/account";

export const accountService = {
  async getProfile(): Promise<SiteMusteriDto> {
    const { data } = await apiClient.get<AppResponse<SiteMusteriDto>>(`${ACCOUNT_BASE}/profile`);
    return unwrapData(data);
  },

  async updateProfile(payload: SiteMusteriDto): Promise<SiteMusteriDto> {
    const { data } = await apiClient.put<AppResponse<SiteMusteriDto>>(`${ACCOUNT_BASE}/profile`, payload);
    return unwrapData(data);
  },

  async getAddresses(): Promise<SiteMusteriAdresDto[]> {
    const { data } = await apiClient.get<AppPageResponse<SiteMusteriAdresDto[]>>(`${ACCOUNT_BASE}/addresses`);
    return unwrapList(data);
  },

  async saveAddress(payload: SiteMusteriAdresDto): Promise<SiteMusteriAdresDto> {
    const { data } = await apiClient.post<AppResponse<SiteMusteriAdresDto>>(`${ACCOUNT_BASE}/addresses`, payload);
    return unwrapData(data);
  },

  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete(`${ACCOUNT_BASE}/addresses/${id}`);
  },

  async getFavorites(): Promise<number[]> {
    const { data } = await apiClient.get<AppPageResponse<number[]>>(`${ACCOUNT_BASE}/favorites`);
    return unwrapList(data);
  },

  async addFavorite(urunId: number): Promise<void> {
    await apiClient.post(`${ACCOUNT_BASE}/favorites/${urunId}`);
  },

  async removeFavorite(urunId: number): Promise<void> {
    await apiClient.delete(`${ACCOUNT_BASE}/favorites/${urunId}`);
  },
};
