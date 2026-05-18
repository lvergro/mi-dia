import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemList } from "@/components/items/ItemList";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Item } from "@mi-dia/types";

export default async function MedicamentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("specific_time", { ascending: true });

  if (error) throw error;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Rutina"
        subtitle="Medicamentos y actividades diarias"
      />
      <ItemList initial={(items ?? []) as Item[]} userId={user.id} />
    </div>
  );
}
