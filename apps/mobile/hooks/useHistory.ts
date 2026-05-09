import { useQuery } from "@tanstack/react-query";
import { fetchHistoryData } from "@mi-dia/database";
import { buildHistory } from "@mi-dia/core";
import type { DayHistory } from "@mi-dia/core";

function getTodayLocal(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function useHistory(range: 7 | 30 = 30) {
  return useQuery<DayHistory[]>({
    queryKey: ["history", range],
    queryFn: async () => {
      const { items, logs } = await fetchHistoryData(range);
      const today = getTodayLocal();
      return buildHistory(items, logs, range, today);
    },
  });
}
