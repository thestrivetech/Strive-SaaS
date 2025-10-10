import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Analytics } from "@shared/schema";

export function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ["/api/v1/analytics"],
  });
}

export function useUpdateAnalytics() {
  return useMutation({
    mutationFn: async (data: Partial<Analytics>) => {
      const res = await apiRequest("POST", "/api/v1/analytics", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/analytics"] });
    },
  });
}
