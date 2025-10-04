import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchParties, createParty, deleteParty } from "../api";
import { queryClient } from "../queryClient";

export function useParties(loopId?: string) {
  return useQuery({
    queryKey: loopId ? ["/api/parties", loopId] : ["/api/parties"],
    queryFn: () => fetchParties(loopId),
  });
}

export function useCreateParty() {
  return useMutation({
    mutationFn: createParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
  });
}

export function useDeleteParty() {
  return useMutation({
    mutationFn: deleteParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
  });
}
