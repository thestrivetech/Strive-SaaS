import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchTasks, createTask, updateTask, deleteTask } from "../api";
import { queryClient } from "../queryClient";

export function useTasks(loopId?: string) {
  return useQuery({
    queryKey: loopId ? ["/api/tasks", loopId] : ["/api/tasks"],
    queryFn: () => fetchTasks(loopId),
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
    },
  });
}

export function useUpdateTask() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });
}

export function useDeleteTask() {
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loops"] });
    },
  });
}
