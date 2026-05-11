import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMoodForDate, upsertMood } from "@mi-dia/database";
import type { MoodValue } from "@mi-dia/types";

export function useMood(date: string) {
  const queryClient = useQueryClient();
  const queryKey = ["mood", date];

  const { data: savedMood } = useQuery({
    queryKey,
    queryFn: () => getMoodForDate(date),
  });

  const [mood, setMoodLocal] = useState<MoodValue | null>(null);
  const [note, setNoteLocal] = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (savedMood !== undefined && !initialized.current) {
      initialized.current = true;
      setMoodLocal(savedMood?.mood ?? null);
      setNoteLocal(savedMood?.note ?? "");
    }
  }, [savedMood]);

  const mutation = useMutation({
    mutationFn: (values: { mood: MoodValue; note: string | null }) =>
      upsertMood({ date, ...values }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });

  const scheduleAutoSave = useCallback(
    (newMood: MoodValue | null, newNote: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (newMood === null) return;
      debounceRef.current = setTimeout(() => {
        mutation.mutate({ mood: newMood, note: newNote || null });
      }, 2000);
    },
    [mutation],
  );

  const setMood = useCallback(
    (value: MoodValue) => {
      setMoodLocal(value);
      scheduleAutoSave(value, note);
    },
    [note, scheduleAutoSave],
  );

  const setNote = useCallback(
    (value: string) => {
      setNoteLocal(value);
      scheduleAutoSave(mood, value);
    },
    [mood, scheduleAutoSave],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { mood, note, setMood, setNote, isSaving: mutation.isPending };
}
