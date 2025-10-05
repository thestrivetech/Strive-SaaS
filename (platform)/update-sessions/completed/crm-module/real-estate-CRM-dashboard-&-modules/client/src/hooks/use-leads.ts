import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Lead, InsertLead } from "@shared/schema";

export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ["/api/v1/leads"],
  });
}

export function useClientLeads() {
  return useQuery<Lead[]>({
    queryKey: ["/api/v1/leads/clients"],
  });
}

export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ["/api/v1/leads", id],
    enabled: !!id,
  });
}

export function useCreateLead() {
  return useMutation({
    mutationFn: async (data: InsertLead) => {
      const res = await apiRequest("POST", "/api/v1/leads", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/api/v1/leads')
      });
    },
  });
}

export function useUpdateLead() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertLead> }) => {
      const res = await apiRequest("PATCH", `/api/v1/leads/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/api/v1/leads')
      });
    },
  });
}

export function useDeleteLead() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/v1/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/api/v1/leads')
      });
    },
  });
}
