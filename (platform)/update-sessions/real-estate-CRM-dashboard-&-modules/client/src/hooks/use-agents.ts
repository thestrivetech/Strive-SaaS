import { useQuery } from "@tanstack/react-query";
import type { Agent } from "@shared/schema";

export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ["/api/v1/agents"],
  });
}

export function useAgent(id: string) {
  return useQuery<Agent>({
    queryKey: ["/api/v1/agents", id],
    enabled: !!id,
  });
}
