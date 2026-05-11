import { supabase } from "./client.js";
import type { DailyMood, DailyMoodInsert } from "@mi-dia/types";

export async function getMoodForDate(date: string): Promise<DailyMood | null> {
  const { data, error } = await supabase
    .from("daily_moods")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data as DailyMood | null;
}

export async function upsertMood(insert: DailyMoodInsert): Promise<DailyMood> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("daily_moods")
    .upsert(
      { ...insert, user_id: user.id },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();
  if (error) throw error;
  return data as DailyMood;
}

export async function getMoodsForRange(startDate: string, endDate: string): Promise<DailyMood[]> {
  const { data, error } = await supabase
    .from("daily_moods")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);
  if (error) throw error;
  return (data ?? []) as DailyMood[];
}
