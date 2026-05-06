import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDailyItems, getActiveRoutines, upsertDailyItems } from "@mi-dia/database";
import { generateDailyChecklist } from "@mi-dia/core";

export function useDailyChecklist(userId: string, date: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["daily-items", date],
    queryFn: async () => {
      const existing = await getDailyItems(userId, date);
      if (existing.length > 0) return existing;

      const routines = await getActiveRoutines(userId);
      if (routines.length === 0) return [];

      const toInsert = generateDailyChecklist(routines, date, []);
      if (toInsert.length === 0) return [];

      const created = await upsertDailyItems(
        toInsert.map((item) => ({ ...item, updated_at: new Date().toISOString() })),
      );
      queryClient.setQueryData(["daily-items", date], created);
      return created;
    },
    enabled: !!userId,
  });
}
