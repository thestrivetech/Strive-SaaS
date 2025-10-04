import { useQuery } from "@tanstack/react-query";
import { fetchActivities } from "../api";
import type { ActivityItem } from "@/components/transaction/activity-feed";

export function useActivities(loopId?: string) {
  return useQuery<ActivityItem[]>({
    queryKey: loopId ? ["/api/activities", loopId] : ["/api/activities"],
    queryFn: () => fetchActivities(loopId),
  });
}
