import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMedication, updateMedication, deleteMedication } from "@mi-dia/database";
import type { MedicationInsert, MedicationUpdate } from "@mi-dia/types";
import { useSessionStore } from "./useSession";

export function useCreateMedication() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.session?.user.id);

  return useMutation({
    mutationFn: (data: Omit<MedicationInsert, "user_id">) =>
      createMedication({ ...data, user_id: userId!, active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", userId] });
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.session?.user.id);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MedicationUpdate }) =>
      updateMedication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", userId] });
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.session?.user.id);

  return useMutation({
    mutationFn: (id: string) => deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications", userId] });
    },
  });
}
