import type { DailyItem, DailyItemInsert, DailyItemStatus } from "@mi-dia/types";
import { supabase } from "./client.js";

export async function getDailyItems(userId: string, date: string): Promise<DailyItem[]> {
  const { data, error } = await supabase
    .from("daily_items")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .order("time_block", { ascending: true });

  if (error) throw error;
  return data as DailyItem[];
}

export async function upsertDailyItems(items: DailyItemInsert[]): Promise<DailyItem[]> {
  const { data, error } = await supabase
    .from("daily_items")
    .upsert(items, { onConflict: "user_id,routine_id,date" })
    .select();

  if (error) throw error;
  return data as DailyItem[];
}

export async function updateDailyItemStatus(
  id: string,
  status: DailyItemStatus,
  completedAt?: string
): Promise<DailyItem> {
  if (status === "done" && !completedAt) {
    throw new Error("completedAt is required when status is 'done'");
  }

  const update: { status: DailyItemStatus; completed_at: string | null } = {
    status,
    completed_at: status === "done" ? (completedAt ?? null) : null,
  };

  const { data, error } = await supabase
    .from("daily_items")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DailyItem;
}
