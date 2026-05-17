"use server";
import { createClient } from "@/lib/supabase/server";
import type { DailyNote, MoodValue } from "@mi-dia/types";

export async function getAllNotes(): Promise<DailyNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_notes")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DailyNote[];
}

export async function getNotesForDate(date: string): Promise<DailyNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_notes")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DailyNote[];
}

export async function createNote(payload: {
  content: string;
  date: string;
  mood?: MoodValue | null;
}): Promise<DailyNote> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("daily_notes")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as DailyNote;
}

export async function updateNote(id: string, content: string): Promise<DailyNote> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_notes")
    .update({ content })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DailyNote;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_notes").delete().eq("id", id);
  if (error) throw error;
}
