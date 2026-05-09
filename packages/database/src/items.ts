import type { Item, ItemInsert, ItemUpdate } from "@mi-dia/types";
import { supabase } from "./client.js";

export async function getItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .is("deleted_at", null)
    .order("specific_time", { ascending: true });
  if (error) throw error;
  return data as Item[];
}

export async function createItem(data: ItemInsert): Promise<Item> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: created, error } = await supabase
    .from("items")
    .insert({ ...data, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return created as Item;
}

export async function updateItem(id: string, data: ItemUpdate): Promise<Item> {
  const { data: updated, error } = await supabase
    .from("items")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return updated as Item;
}

export async function softDeleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
