import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchLoops, fetchLoop, createLoop, updateLoop, deleteLoop } from "../api";
import { queryClient } from "../queryClient";

export function useLoops() {
  return useQuery({
    queryKey: ["/api/loops"],
    queryFn: fetchLoops,
  });
}

export function useLoop(id: string) {
  return useQuery({
    queryKey: ["/api/loops", id],
    queryFn: () => fetchLoop(id),
    enabled: !!id,
  });
}

export function useCreateLoop() {
  return useMutation({
    mutationFn: createLoop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });
}

export function useUpdateLoop() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLoop(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loops", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
  });
}

export function useDeleteLoop() {
  return useMutation({
    mutationFn: deleteLoop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
  });
}
