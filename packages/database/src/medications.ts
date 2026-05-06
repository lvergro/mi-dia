import type { Medication, MedicationInsert, MedicationUpdate } from "@mi-dia/types";
import { supabase } from "./client.js";

export async function getMedications(userId: string): Promise<Medication[]> {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Medication[];
}

export async function createMedication(data: MedicationInsert): Promise<Medication> {
  const { data: created, error } = await supabase
    .from("medications")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return created as Medication;
}

export async function updateMedication(id: string, data: MedicationUpdate): Promise<Medication> {
  const { data: updated, error } = await supabase
    .from("medications")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updated as Medication;
}

export async function deleteMedication(id: string): Promise<void> {
  const { error } = await supabase
    .from("medications")
    .update({ active: false })
    .eq("id", id);

  if (error) throw error;
}
