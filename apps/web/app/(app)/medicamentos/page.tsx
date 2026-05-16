import { createClient } from "@/lib/supabase/server";
import { MedicationList } from "@/components/medications/MedicationList";
import type { Medication } from "@mi-dia/types";

export default async function MedicamentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: medications, error } = await supabase
    .from("medications")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medicamentos</h1>
        <p className="text-sm text-muted mt-0.5">Gestiona tus medicamentos y actividades</p>
      </div>
      <MedicationList initial={(medications ?? []) as Medication[]} userId={user!.id} />
    </div>
  );
}
