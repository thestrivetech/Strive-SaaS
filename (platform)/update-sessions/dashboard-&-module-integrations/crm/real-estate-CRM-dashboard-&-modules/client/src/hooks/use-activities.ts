import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Activity, InsertActivity } from "@shared/schema";

export function useActivities(limit?: number) {
  return useQuery<Activity[]>({
    queryKey: limit ? ["/api/v1/activities", `limit=${limit}`] : ["/api/v1/activities"],
  });
}

export function useCreateActivity() {
  return useMutation({
    mutationFn: async (data: InsertActivity) => {
      const res = await apiRequest("POST", "/api/v1/activities", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/activities"] });
    },
  });
}
