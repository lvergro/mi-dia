import { createClient } from "@/lib/supabase/client";
import type { Item } from "@mi-dia/types";

export async function getItems(): Promise<Item[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .is("deleted_at", null)
    .order("specific_time", { ascending: true });
  if (error) throw error;
  return data as Item[];
}

export async function createItem(payload: Omit<Item, "id" | "created_at" | "updated_at">): Promise<Item> {
  const supabase = createClient();
  const { data, error } = await supabase.from("items").insert(payload).select().single();
  if (error) throw error;
  return data as Item;
}

export async function updateItem(id: string, payload: Partial<Omit<Item, "id" | "user_id" | "created_at" | "updated_at">>): Promise<Item> {
  const supabase = createClient();
  const { data, error } = await supabase.from("items").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as Item;
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("items").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
