import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Deal, InsertDeal } from "@shared/schema";

export function useDeals() {
  return useQuery<Deal[]>({
    queryKey: ["/api/v1/deals"],
  });
}

export function useDeal(id: string) {
  return useQuery<Deal>({
    queryKey: ["/api/v1/deals", id],
    enabled: !!id,
  });
}

export function useCreateDeal() {
  return useMutation({
    mutationFn: async (data: InsertDeal) => {
      const res = await apiRequest("POST", "/api/v1/deals", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/deals"] });
    },
  });
}

export function useUpdateDeal() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertDeal> }) => {
      const res = await apiRequest("PATCH", `/api/v1/deals/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/deals"] });
    },
  });
}

export function useDeleteDeal() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/v1/deals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/deals"] });
    },
  });
}
