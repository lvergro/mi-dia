import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLog, deleteLog } from "@mi-dia/database";
import type { LogInsert } from "@mi-dia/types";

export function useCreateLog(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LogInsert) => createLog(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["checklist", date] });
    },
  });
}

export function useDeleteLog(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLog(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["checklist", date] });
    },
  });
}
