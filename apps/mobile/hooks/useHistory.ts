import { useQuery } from "@tanstack/react-query";
import { fetchHistoryDataRange, getFirstLogDate } from "@mi-dia/database";
import { buildHistoryRange } from "@mi-dia/core";
import type { DayHistory } from "@mi-dia/core";

function getTodayLocal(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function useHistory() {
  return useQuery<DayHistory[]>({
    queryKey: ["history", "full"],
    queryFn: async () => {
      const today = getTodayLocal();
      const firstDate = await getFirstLogDate();
      if (!firstDate) return [];
      const { items, logs } = await fetchHistoryDataRange(firstDate, today);
      return buildHistoryRange(items, logs, firstDate, today);
    },
  });
}
