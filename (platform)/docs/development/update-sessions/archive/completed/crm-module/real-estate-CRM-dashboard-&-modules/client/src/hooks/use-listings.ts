import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Listing, InsertListing } from "@shared/schema";

export function useListings() {
  return useQuery<Listing[]>({
    queryKey: ["/api/v1/listings"],
  });
}

export function useListing(id: string) {
  return useQuery<Listing>({
    queryKey: ["/api/v1/listings", id],
    enabled: !!id,
  });
}

export function useCreateListing() {
  return useMutation({
    mutationFn: async (data: InsertListing) => {
      const res = await apiRequest("POST", "/api/v1/listings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/listings"] });
    },
  });
}

export function useUpdateListing() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertListing> }) => {
      const res = await apiRequest("PATCH", `/api/v1/listings/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/listings"] });
    },
  });
}

export function useDeleteListing() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/v1/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/listings"] });
    },
  });
}
