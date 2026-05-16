import type { DailyItem, DailyItemStatus } from "@mi-dia/types";
import { createClient } from "@/lib/supabase/client";

export async function getDailyItems(userId: string, date: string): Promise<DailyItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("daily_items")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .order("time_block", { ascending: true });
  if (error) throw error;
  return data as DailyItem[];
}

export async function updateDailyItemStatus(
  id: string,
  status: DailyItemStatus,
  completedAt?: string
): Promise<DailyItem> {
  if (status === "done" && !completedAt) throw new Error("completedAt required for done");
  const supabase = createClient();
  const { data, error } = await supabase
    .from("daily_items")
    .update({ status, completed_at: status === "done" ? completedAt : null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DailyItem;
}

export async function getDailyItemsRange(
  userId: string,
  fromDate: string,
  toDate: string
): Promise<DailyItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("daily_items")
    .select("*")
    .eq("user_id", userId)
    .gte("date", fromDate)
    .lte("date", toDate)
    .order("date", { ascending: false });
  if (error) throw error;
  return data as DailyItem[];
}
