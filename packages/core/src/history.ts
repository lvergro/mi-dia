import type { Item, Log, DailyMood, MoodValue } from "@mi-dia/types";
import { filterItemsForDate } from "./checklist.js";

export type DayItemStatus = "done" | "omitted" | "pending";

export interface DayHistoryItem {
  item_id: string;
  name: string;
  scheduled_time: string; // 'HH:MM:SS'
  status: DayItemStatus;
}

export interface DayHistory {
  date: string; // 'YYYY-MM-DD'
  total: number;
  done: number;
  pct: number; // 0-100, Math.round(done/total*100) o 0 si total=0
  items: DayHistoryItem[];
  mood: MoodValue | null;
}

function dateRangeDesc(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const cur = new Date(end);
  while (cur >= start) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() - 1);
  }
  return dates;
}

export function buildHistoryRange(
  items: Item[],
  logs: Log[],
  startDate: string, // 'YYYY-MM-DD' — primer día inclusivo
  endDate: string,   // 'YYYY-MM-DD' — último día inclusivo
  moods: DailyMood[] = []
): DayHistory[] {
  const activeItems = items.filter((i) => i.deleted_at === null);
  const dates = dateRangeDesc(startDate, endDate);
  const moodMap = new Map(moods.map((m) => [m.date, m.mood as MoodValue]));
  const result: DayHistory[] = [];

  for (const date of dates) {
    const dayItems = filterItemsForDate(activeItems, date);
    if (dayItems.length === 0) continue;

    const dayLogs = logs.filter((l) => l.date === date);
    const logMap = new Map(dayLogs.map((l) => [l.item_id, l.status]));

    const historyItems: DayHistoryItem[] = dayItems.map((item) => {
      const logStatus = logMap.get(item.id);
      const status: DayItemStatus =
        logStatus === "done"
          ? "done"
          : logStatus === "omitted"
          ? "omitted"
          : "pending";
      return {
        item_id: item.id,
        name: item.name,
        scheduled_time: item.specific_time,
        status,
      };
    });

    const done = historyItems.filter((i) => i.status === "done").length;
    const total = dayItems.length;

    result.push({
      date,
      total,
      done,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      items: historyItems,
      mood: moodMap.get(date) ?? null,
    });
  }

  return result;
}

// Genera rango de fechas [today - rangeDays + 1 .. today] en orden desc
function dateRange(today: string, rangeDays: number): string[] {
  const dates: string[] = [];
  const base = new Date(today + "T00:00:00");
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates; // descendente
}

export function buildHistory(
  items: Item[],
  logs: Log[],
  rangeDays: number,
  today: string // 'YYYY-MM-DD'
): DayHistory[] {
  const activeItems = items.filter((i) => i.deleted_at === null);
  const dates = dateRange(today, rangeDays);
  const result: DayHistory[] = [];

  for (const date of dates) {
    const dayItems = filterItemsForDate(activeItems, date);
    if (dayItems.length === 0) continue; // omitir días sin items

    const dayLogs = logs.filter((l) => l.date === date);
    const logMap = new Map(dayLogs.map((l) => [l.item_id, l.status]));

    const historyItems: DayHistoryItem[] = dayItems.map((item) => {
      const logStatus = logMap.get(item.id);
      const status: DayItemStatus =
        logStatus === "done"
          ? "done"
          : logStatus === "omitted"
          ? "omitted"
          : "pending";
      return {
        item_id: item.id,
        name: item.name,
        scheduled_time: item.specific_time,
        status,
      };
    });

    const done = historyItems.filter((i) => i.status === "done").length;
    const total = dayItems.length;

    result.push({
      date,
      total,
      done,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      items: historyItems,
      mood: null,
    });
  }

  return result;
}
