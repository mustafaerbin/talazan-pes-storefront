"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService } from "@/services/account.service";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useSidePanelStore } from "@/hooks/use-side-panel-store";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";

export function useFavoriteToggle() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const openFavorites = useSidePanelStore((s) => s.openFavorites);

  const addMutation = useMutation({
    mutationFn: accountService.addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      openFavorites();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const removeMutation = useMutation({
    mutationFn: accountService.removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const toggle = (urunId: number, isFavorite?: boolean) => {
    if (!user) {
      openFavorites();
      return;
    }
    if (isFavorite) {
      removeMutation.mutate(urunId);
    } else {
      addMutation.mutate(urunId);
    }
  };

  return { toggle, isAuthenticated: !!user };
}
