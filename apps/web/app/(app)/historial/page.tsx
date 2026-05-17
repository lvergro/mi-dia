import { createClient } from "@/lib/supabase/server";
import { HistorialView } from "@/components/history/HistorialView";
import { buildHistory } from "@mi-dia/core";
import type { Item, Log } from "@mi-dia/types";

function todayLocal() {
  return new Date().toISOString().slice(0, 10);
}

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = todayLocal();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = sevenDaysAgo.toISOString().slice(0, 10);

  const [itemsRes, logsRes] = await Promise.all([
    supabase.from("items").select("*").eq("user_id", user!.id).is("deleted_at", null),
    supabase.from("logs").select("*").eq("user_id", user!.id).gte("date", fromDate).lte("date", today),
  ]);

  if (itemsRes.error) throw itemsRes.error;
  if (logsRes.error) throw logsRes.error;

  const history = buildHistory(
    (itemsRes.data ?? []) as Item[],
    (logsRes.data ?? []) as Log[],
    7,
    today
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historial</h1>
        <p className="text-sm text-muted mt-0.5">Últimos 7 días</p>
      </div>
      <div className="rounded-2xl border border-card-border bg-white p-6">
        <HistorialView history={history} />
      </div>
    </div>
  );
}
