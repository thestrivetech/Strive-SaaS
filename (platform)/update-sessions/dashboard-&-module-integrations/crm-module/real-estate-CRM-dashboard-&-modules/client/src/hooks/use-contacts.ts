import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Contact, InsertContact } from "@shared/schema";

export function useContacts() {
  return useQuery<Contact[]>({
    queryKey: ["/api/v1/contacts"],
  });
}

export function useClientContacts() {
  return useQuery<Contact[]>({
    queryKey: ["/api/v1/contacts/clients"],
  });
}

export function useContact(id: string) {
  return useQuery<Contact>({
    queryKey: ["/api/v1/contacts", id],
    enabled: !!id,
  });
}

export function useCreateContact() {
  return useMutation({
    mutationFn: async (data: InsertContact) => {
      const res = await apiRequest("POST", "/api/v1/contacts", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/contacts"] });
    },
  });
}

export function useUpdateContact() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertContact> }) => {
      const res = await apiRequest("PATCH", `/api/v1/contacts/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/contacts"] });
    },
  });
}

export function useDeleteContact() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/v1/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/contacts"] });
    },
  });
}
