import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { KpiMetric, Activity, DashboardSettings } from "@shared/schema";

export function useDashboardKPIs() {
  return useQuery<KpiMetric[]>({
    queryKey: ["/api/dashboard/kpis"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
  });
}

export function useDashboardActivities(limit = 20) {
  return useQuery<Activity[]>({
    queryKey: ["/api/dashboard/activities", limit],
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useDashboardSettings(userId: string) {
  return useQuery<DashboardSettings>({
    queryKey: ["/api/dashboard/settings", userId],
  });
}

export function useUpdateDashboardSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<DashboardSettings> & { userId: string }) => {
      const response = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update settings");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/settings"] });
    },
  });
}
