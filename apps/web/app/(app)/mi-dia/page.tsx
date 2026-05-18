import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MiDiaView } from "@/components/checklist/MiDiaView";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { buildChecklistWithLogs, filterItemsForDate } from "@mi-dia/core";
import type { Item, Log, DailyNote, DailyMood } from "@mi-dia/types";

function todayLocal(): string {
  const d = new Date();
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function MiDiaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const today = todayLocal();

  const [itemsRes, logsRes, notesRes, moodRes] = await Promise.all([
    supabase.from("items").select("*").eq("user_id", user.id).is("deleted_at", null),
    supabase.from("logs").select("*").eq("user_id", user.id).eq("date", today),
    supabase.from("daily_notes").select("*").eq("user_id", user.id)
      .order("date", { ascending: false }).order("created_at", { ascending: false }).limit(10),
    supabase.from("daily_moods").select("*").eq("user_id", user.id).eq("date", today).maybeSingle(),
  ]);

  if (itemsRes.error) throw itemsRes.error;
  if (logsRes.error) throw logsRes.error;

  const todayItems = filterItemsForDate((itemsRes.data ?? []) as Item[], today);
  const checklist = buildChecklistWithLogs(todayItems, (logsRes.data ?? []) as Log[]);

  const total = todayItems.length;
  const done = (logsRes.data ?? []).filter(l => l.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const dateLabel = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Trazadía"
        subtitle={dateLabel}
        right={
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-2.5 shadow-subtle">
            <ProgressRing pct={pct} size={40} stroke={4} label={`${pct}%`} />
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Adherencia hoy</p>
              <p className="text-sm font-bold text-indigo-600">{pct}%</p>
            </div>
          </div>
        }
      />
      <MiDiaView
        checklist={checklist}
        date={today}
        initialMood={(moodRes.data ?? null) as DailyMood | null}
        initialNotes={(notesRes.data ?? []) as DailyNote[]}
        done={done}
        total={total}
      />
    </div>
  );
}
