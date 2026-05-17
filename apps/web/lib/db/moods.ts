"use server";
import { createClient } from "@/lib/supabase/server";
import type { DailyMood, MoodValue } from "@mi-dia/types";

export async function getMoodForDate(date: string): Promise<DailyMood | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_moods")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data as DailyMood | null;
}

export async function upsertMood(payload: {
  date: string;
  mood: MoodValue;
  note: string | null;
}): Promise<DailyMood> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("daily_moods")
    .upsert({ ...payload, user_id: user.id }, { onConflict: "user_id,date" })
    .select()
    .single();
  if (error) throw error;
  return data as DailyMood;
}
