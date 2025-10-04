import { useQuery } from "@tanstack/react-query";
import { fetchMilestones } from "../api";

export function useMilestones(loopId?: string) {
  return useQuery({
    queryKey: loopId ? ["/api/milestones", loopId] : ["/api/milestones"],
    queryFn: () => fetchMilestones(loopId),
  });
}
