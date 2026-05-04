import type { Routine, RoutineInsert } from "@mi-dia/types";
import { supabase } from "./client.js";

export async function getActiveRoutines(userId: string): Promise<Routine[]> {
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("time_block", { ascending: true });

  if (error) throw error;
  return data as Routine[];
}

export async function createRoutine(data: RoutineInsert): Promise<Routine> {
  const { data: created, error } = await supabase
    .from("routines")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return created as Routine;
}
