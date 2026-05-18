"use server";
import { createClient } from "@/lib/supabase/server";

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_account");
  if (error) throw error;
}
