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
