import type { Medication, MedicationInsert, MedicationUpdate } from "@mi-dia/types";
import { createClient } from "@/lib/supabase/client";

export async function getMedications(): Promise<Medication[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Medication[];
}

export async function createMedication(payload: MedicationInsert): Promise<Medication> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medications").insert(payload).select().single();
  if (error) throw error;
  return data as Medication;
}

export async function updateMedication(id: string, payload: MedicationUpdate): Promise<Medication> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("medications").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as Medication;
}

export async function deleteMedication(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("medications").update({ active: false }).eq("id", id);
  if (error) throw error;
}
