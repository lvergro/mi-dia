import { createClient } from "@/lib/supabase/server";
import { MiDiaView } from "@/components/checklist/MiDiaView";
import { buildChecklistWithLogs, filterItemsForDate } from "@mi-dia/core";
import type { Item, Log } from "@mi-dia/types";

function todayLocal(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function MiDiaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = todayLocal();

  const [itemsRes, logsRes] = await Promise.all([
    supabase.from("items").select("*").eq("user_id", user!.id).is("deleted_at", null),
    supabase.from("logs").select("*").eq("user_id", user!.id).eq("date", today),
  ]);

  if (itemsRes.error) throw itemsRes.error;
  if (logsRes.error) throw logsRes.error;

  const todayItems = filterItemsForDate((itemsRes.data ?? []) as Item[], today);
  const checklist = buildChecklistWithLogs(todayItems, (logsRes.data ?? []) as Log[]);

  const total = todayItems.length;
  const done = (logsRes.data ?? []).filter(l => l.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Día</h1>
          <p className="text-sm text-muted mt-0.5">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        {pct !== null && <span className="text-lg font-bold text-primary">{pct}%</span>}
      </div>
      <MiDiaView checklist={checklist} date={today} />
    </div>
  );
}
