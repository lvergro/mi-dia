import { useQuery } from "@tanstack/react-query";
import { getDailyItemsForDateRange } from "@mi-dia/database";
import { calculateAdherence } from "@mi-dia/core";
import type { DailyItem } from "@mi-dia/types";
import { useSessionStore } from "./useSession";

export interface DayHistory {
  date: string;
  items: DailyItem[];
  adherence: { total: number; done: number; pct: number };
}

export function useHistory(days = 30) {
  const userId = useSessionStore((s) => s.session?.user.id);

  return useQuery({
    queryKey: ["history", userId, days],
    queryFn: async (): Promise<DayHistory[]> => {
      const today = new Date();
      const toDate = new Date(today);
      toDate.setDate(today.getDate() - 1);
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - days);

      const items = await getDailyItemsForDateRange(
        userId!,
        fromDate.toISOString().slice(0, 10),
        toDate.toISOString().slice(0, 10)
      );

      const byDate = new Map<string, DailyItem[]>();
      for (const item of items) {
        const list = byDate.get(item.date) ?? [];
        list.push(item);
        byDate.set(item.date, list);
      }

      return Array.from(byDate.entries())
        .map(([date, dayItems]) => ({
          date,
          items: dayItems,
          adherence: calculateAdherence(dayItems),
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    enabled: !!userId,
  });
}
