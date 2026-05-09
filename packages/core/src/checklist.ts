import type { DailyItem, DailyItemStatus, Routine, TimeBlock } from "@mi-dia/types";

export interface AdherenceResult {
  total: number;
  done: number;
  skipped: number;
  not_sure: number;
  pct: number;
}

export interface GroupedItems {
  morning: DailyItem[];
  afternoon: DailyItem[];
  night: DailyItem[];
}

export function generateDailyChecklist(
  routines: Routine[],
  date: string,
  existingItems: DailyItem[] = [],
): Omit<DailyItem, "id" | "created_at" | "updated_at">[] {
  const existingRoutineIds = new Set(
    existingItems.filter((i) => i.routine_id !== null).map((i) => i.routine_id as string),
  );

  return routines
    .filter((r) => r.active && !existingRoutineIds.has(r.id))
    .map((r) => ({
      user_id: r.user_id,
      routine_id: r.id,
      date,
      type: r.type,
      title: r.title,
      scheduled_time: r.scheduled_time,
      time_block: r.time_block,
      status: "pending" as DailyItemStatus,
      completed_at: null,
      notes: null,
    }));
}

export function groupItemsByTimeBlock(items: DailyItem[]): GroupedItems {
  const groups: GroupedItems = { morning: [], afternoon: [], night: [] };
  for (const item of items) {
    const block = item.time_block as TimeBlock | null;
    if (block !== null) {
      groups[block].push(item);
    }
  }
  return groups;
}

export function getPendingItems(items: DailyItem[]): DailyItem[] {
  return items.filter((i) => i.status === "pending");
}

export function calculateAdherence(items: DailyItem[]): AdherenceResult {
  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const skipped = items.filter((i) => i.status === "skipped").length;
  const not_sure = items.filter((i) => i.status === "not_sure").length;
  return { total, done, skipped, not_sure, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

// Nuevo schema: Item + Log
import type { Item, Log } from "@mi-dia/types";

export type ItemBlock = "mañana" | "tarde" | "noche";
export type ItemStatus = "pending" | "done" | "omitted";

export interface ItemWithStatus extends Item {
  status: ItemStatus;
  log: Log | null;
}

export interface GroupedChecklist {
  mañana: ItemWithStatus[];
  tarde: ItemWithStatus[];
  noche: ItemWithStatus[];
}

export function getItemBlock(specificTime: string): ItemBlock {
  const hour = parseInt(specificTime.split(":")[0], 10);
  if (hour >= 6 && hour < 14) return "mañana";
  if (hour >= 14 && hour < 20) return "tarde";
  return "noche";
}

// date: "YYYY-MM-DD"
export function filterItemsForDate(items: Item[], date: string): Item[] {
  const d = new Date(date + "T12:00:00"); // noon to avoid TZ issues
  const jsDay = d.getDay(); // 0=sun..6=sat
  const schemaDay = jsDay === 0 ? 7 : jsDay; // 1=lun..7=dom

  return items.filter((item) => {
    if (item.recurrence_type === "daily") return true;
    return (item.recurrence_days ?? []).includes(schemaDay);
  });
}

export function buildChecklistWithLogs(items: Item[], logs: Log[]): GroupedChecklist {
  const logMap = new Map<string, Log>(logs.map((l) => [l.item_id, l]));

  const withStatus: ItemWithStatus[] = items.map((item) => {
    const log = logMap.get(item.id) ?? null;
    const status: ItemStatus = log ? (log.status === "done" ? "done" : "omitted") : "pending";
    return { ...item, status, log };
  });

  const result: GroupedChecklist = { mañana: [], tarde: [], noche: [] };
  for (const item of withStatus) {
    result[getItemBlock(item.specific_time)].push(item);
  }
  return result;
}
