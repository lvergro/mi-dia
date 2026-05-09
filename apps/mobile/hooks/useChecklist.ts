import { useQuery } from "@tanstack/react-query";
import { getItems, getLogsForDate } from "@mi-dia/database";
import { filterItemsForDate, buildChecklistWithLogs } from "@mi-dia/core";
import type { GroupedChecklist } from "@mi-dia/core";

export function useChecklist(date: string): {
  data: GroupedChecklist;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
} {
  const emptyChecklist: GroupedChecklist = { mañana: [], tarde: [], noche: [] };

  const result = useQuery({
    queryKey: ["checklist", date],
    queryFn: async (): Promise<GroupedChecklist> => {
      const [items, logs] = await Promise.all([
        getItems(),
        getLogsForDate(date),
      ]);
      const filtered = filterItemsForDate(items, date);
      return buildChecklistWithLogs(filtered, logs);
    },
  });

  return {
    data: result.data ?? emptyChecklist,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
    isFetching: result.isFetching,
  };
}
