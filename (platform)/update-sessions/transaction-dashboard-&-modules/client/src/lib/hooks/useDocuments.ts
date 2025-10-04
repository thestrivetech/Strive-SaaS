import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDocuments, createDocument, deleteDocument } from "../api";
import { queryClient } from "../queryClient";

export function useDocuments(loopId?: string) {
  return useQuery({
    queryKey: loopId ? ["/api/documents", loopId] : ["/api/documents"],
    queryFn: () => fetchDocuments(loopId),
  });
}

export function useCreateDocument() {
  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });
}

export function useDeleteDocument() {
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
    },
  });
}
