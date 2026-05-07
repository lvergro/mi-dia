import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getRoutinesByMedication,
  createRoutine,
  deleteRoutine,
} from "@mi-dia/database";
import type { RoutineInsert } from "@mi-dia/types";
import { useSessionStore } from "./useSession";

export function useRoutinesByMedication(medicationId: string | null) {
  const userId = useSessionStore((s) => s.session?.user.id);

  return useQuery({
    queryKey: ["routines", "medication", medicationId, userId],
    queryFn: () => getRoutinesByMedication(userId!, medicationId!),
    enabled: !!userId && !!medicationId,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.session?.user.id);

  return useMutation({
    mutationFn: (data: Omit<RoutineInsert, "user_id" | "active">) =>
      createRoutine({ ...data, user_id: userId!, active: true }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["daily-items"] });
      if (variables.medication_id) {
        queryClient.invalidateQueries({
          queryKey: ["routines", "medication", variables.medication_id],
        });
      }
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoutine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["daily-items"] });
    },
  });
}
