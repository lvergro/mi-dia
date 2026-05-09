import { supabase } from "./client.js";
import type { Item, Log } from "@mi-dia/types";

export interface HistoryData {
  items: Item[];
  logs: Log[];
}

export async function fetchHistoryData(rangeDays: number): Promise<HistoryData> {
  // Fecha inicio: today - rangeDays + 1 (en local, formateado YYYY-MM-DD)
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - rangeDays + 1);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const startDate = fmt(start);
  const endDate = fmt(today);

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
