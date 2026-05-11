import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, getNotesForDate, getAllNotes, deleteNote } from "@mi-dia/database";
import type { DailyNote } from "@mi-dia/types";

export function useNotesForDate(date: string) {
  return useQuery<DailyNote[]>({
    queryKey: ["notes", date],
    queryFn: () => getNotesForDate(date),
  });
}

export function useAllNotes() {
  return useQuery<DailyNote[]>({
    queryKey: ["notes", "all"],
    queryFn: getAllNotes,
  });
}

export function useCreateNote(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createNote({ content, date }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notes", date] });
      void queryClient.invalidateQueries({ queryKey: ["notes", "all"] });
    },
  });
}

export function useDeleteNote(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notes", date] });
      void queryClient.invalidateQueries({ queryKey: ["notes", "all"] });
    },
  });
}
