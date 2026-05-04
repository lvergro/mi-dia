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

export function generateDailyChecklist(routines: Routine[], date: string): Omit<DailyItem, "id" | "created_at">[] {
  return routines
    .filter((r) => r.active)
    .map((r) => ({
      user_id: r.user_id,
      routine_id: r.id,
      date,
      status: "pending" as DailyItemStatus,
      completed_at: null,
    }));
}

export function groupItemsByTimeBlock(items: Array<DailyItem & { time_block?: TimeBlock }>): GroupedItems {
  const groups: GroupedItems = { morning: [], afternoon: [], night: [] };
  for (const item of items) {
    const block = item.time_block;
    if (block !== undefined) {
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
