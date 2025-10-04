import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "../api";

export function useAnalytics() {
  return useQuery({
    queryKey: ["/api/analytics"],
    queryFn: fetchAnalytics,
  });
}
