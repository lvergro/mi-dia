import { createClient } from "@/lib/supabase/server";
import { MiDiaView } from "@/components/checklist/MiDiaView";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default async function MiDiaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = todayStr();
  const { data: items, error } = await supabase
    .from("daily_items")
    .select("*")
    .eq("user_id", user!.id)
    .eq("date", today)
    .order("time_block", { ascending: true });

  if (error) throw error;

  const donePct = items && items.length > 0
    ? Math.round((items.filter(i => i.status === "done").length / items.length) * 100)
    : null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Día</h1>
          <p className="text-sm text-muted mt-0.5">{new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        {donePct !== null && (
          <span className="text-lg font-bold text-primary">{donePct}%</span>
        )}
      </div>
      <MiDiaView items={items ?? []} />
    </div>
  );
}
