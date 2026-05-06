import type { DailyNote, DailyNoteInsert } from "@mi-dia/types";
import { supabase } from "./client.js";

export async function getDailyNote(userId: string, date: string): Promise<DailyNote | null> {
  const { data, error } = await supabase
    .from("daily_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data as DailyNote | null;
}

export async function upsertDailyNote(data: DailyNoteInsert): Promise<DailyNote> {
  const { data: upserted, error } = await supabase
    .from("daily_notes")
    .upsert(data, { onConflict: "user_id,date" })
    .select()
    .single();

  if (error) throw error;
  return upserted as DailyNote;
}
