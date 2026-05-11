import { supabase } from "./client.js";
import type { Item, Log } from "@mi-dia/types";

export interface HistoryData {
  items: Item[];
  logs: Log[];
}

export async function fetchHistoryDataRange(startDate: string, endDate: string): Promise<HistoryData> {
  const [itemsRes, logsRes] = await Promise.all([
    supabase
      .from("items")
      .select("*")
      .is("deleted_at", null),
    supabase
      .from("logs")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate),
  ]);

  if (itemsRes.error) throw itemsRes.error;
  if (logsRes.error) throw logsRes.error;

  return {
    items: (itemsRes.data ?? []) as Item[],
    logs: (logsRes.data ?? []) as Log[],
  };
}
