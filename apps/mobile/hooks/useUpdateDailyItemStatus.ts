import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDailyItemStatus } from "@mi-dia/database";
import type { DailyItemStatus } from "@mi-dia/types";

interface UpdateStatusParams {
  id: string;
  status: DailyItemStatus;
  date: string;
}

export function useUpdateDailyItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: UpdateStatusParams) => {
      const completedAt = status === "done" ? new Date().toISOString() : undefined;
      return updateDailyItemStatus(id, status, completedAt);
    },
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({ queryKey: ["daily-items", date] });
    },
  });
}
