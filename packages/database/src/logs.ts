import type { Log, LogInsert } from "@mi-dia/types";
import { supabase } from "./client.js";

export async function getLogsForDate(date: string): Promise<Log[]> {
  const { data, error } = await supabase
    .from("logs")
    .select("*")
    .eq("date", date);
  if (error) throw error;
  return data as Log[];
}

export async function createLog(data: LogInsert): Promise<Log> {
  const { data: created, error } = await supabase
    .from("logs")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created as Log;
}

export async function deleteLog(id: string): Promise<void> {
  const { error } = await supabase.from("logs").delete().eq("id", id);
  if (error) throw error;
}
