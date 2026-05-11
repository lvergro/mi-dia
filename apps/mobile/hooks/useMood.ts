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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (savedMood !== undefined && !initialized.current) {
      initialized.current = true;
      setMoodLocal(savedMood?.mood ?? null);
    }
  }, [savedMood]);

  const mutation = useMutation({
    mutationFn: (value: MoodValue) =>
      upsertMood({ date, mood: value, note: null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });

  const setMood = useCallback(
    (value: MoodValue) => {
      setMoodLocal(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        mutation.mutate(value);
      }, 500);
    },
    [mutation],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { mood, setMood, isSaving: mutation.isPending };
}
