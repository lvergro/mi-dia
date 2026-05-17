import { createClient } from "@/lib/supabase/server";
import { ItemList } from "@/components/items/ItemList";
import type { Item } from "@mi-dia/types";

export default async function MedicamentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", user!.id)
    .is("deleted_at", null)
    .order("specific_time", { ascending: true });

  if (error) throw error;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rutina</h1>
        <p className="text-sm text-muted mt-0.5">Medicamentos y actividades diarias</p>
      </div>
      <ItemList initial={(items ?? []) as Item[]} userId={user!.id} />
    </div>
  );
}
