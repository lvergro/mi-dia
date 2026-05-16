import type { Routine } from "@mi-dia/types";
import { createClient } from "@/lib/supabase/client";

export async function getActiveRoutines(userId: string): Promise<Routine[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);
  if (error) throw error;
  return data as Routine[];
}
