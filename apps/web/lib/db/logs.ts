import { createClient } from "@/lib/supabase/client";
import type { Log } from "@mi-dia/types";

export async function getLogsForDate(date: string): Promise<Log[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .eq("date", date);
  if (error) throw error;
  return data as Log[];
}

export async function getLogsForRange(fromDate: string, toDate: string): Promise<Log[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .gte("date", fromDate)
    .lte("date", toDate);
  if (error) throw error;
  return data as Log[];
}

export async function upsertLog(payload: { user_id: string; item_id: string; date: string; status: "done" | "omitted"; note?: string | null }): Promise<Log> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("logs")
    .upsert({ ...payload, completed_at: new Date().toISOString() }, { onConflict: "user_id,item_id,date" })
    .select()
    .single();
  if (error) throw error;
  return data as Log;
}

export async function deleteLog(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("logs").delete().eq("id", id);
  if (error) throw error;
}
