import { supabase } from "./client.js";
import type { DailyNote, DailyNoteInsert } from "@mi-dia/types";

export async function createNote(insert: DailyNoteInsert): Promise<DailyNote> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("daily_notes")
    .insert({ ...insert, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as DailyNote;
}

export async function getNotesForDate(date: string): Promise<DailyNote[]> {
  const { data, error } = await supabase
    .from("daily_notes")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DailyNote[];
}

export async function getAllNotes(): Promise<DailyNote[]> {
  const { data, error } = await supabase
    .from("daily_notes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DailyNote[];
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("daily_notes").delete().eq("id", id);
  if (error) throw error;
}

export async function updateNote(id: string, content: string): Promise<DailyNote> {
  const { data, error } = await supabase
    .from("daily_notes")
    .update({ content })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DailyNote;
}
