import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HistorialView } from "@/components/history/HistorialView";
import { PageHeader } from "@/components/ui/PageHeader";
import { buildHistory } from "@mi-dia/core";
import type { Item, Log } from "@mi-dia/types";

function todayLocal() {
  const d = new Date();
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function HistorialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = todayLocal();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = sevenDaysAgo.toISOString().slice(0, 10);

  const [itemsRes, logsRes] = await Promise.all([
    supabase.from("items").select("*").eq("user_id", user.id).is("deleted_at", null),
    supabase.from("logs").select("*").eq("user_id", user.id).gte("date", fromDate).lte("date", today),
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
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Historial" subtitle="Últimos 7 días" />
      <HistorialView history={history} />
    </div>
  );
}
