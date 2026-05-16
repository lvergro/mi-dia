import { createClient } from "@/lib/supabase/server";
import { HistorialView } from "@/components/history/HistorialView";
import type { DailyItem } from "@mi-dia/types";

function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
}

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const days = lastNDays(7);
  const fromDate = days[days.length - 1];
  const toDate = days[0];

  const { data: items, error } = await supabase
    .from("daily_items")
    .select("*")
    .eq("user_id", user!.id)
    .gte("date", fromDate)
    .lte("date", toDate);

  if (error) throw error;

  const itemsByDay = days.map(date => ({
    date,
    items: (items ?? []).filter(i => i.date === date) as DailyItem[],
  }));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historial</h1>
        <p className="text-sm text-muted mt-0.5">Últimos 7 días</p>
      </div>
      <div className="rounded-2xl border border-card-border bg-white p-6">
        <HistorialView days={itemsByDay} />
      </div>
    </div>
  );
}
