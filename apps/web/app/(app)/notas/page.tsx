import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotesView } from "@/components/notes/NotesView";
import type { DailyNote, DailyMood } from "@mi-dia/types";

function getTodayLocal(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function NotasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = getTodayLocal();

  const [notesRes, moodRes] = await Promise.all([
    supabase
      .from("daily_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("daily_moods")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle(),
  ]);

  return (
    <NotesView
      initialNotes={(notesRes.data ?? []) as DailyNote[]}
      initialMood={(moodRes.data ?? null) as DailyMood | null}
    />
  );
}
