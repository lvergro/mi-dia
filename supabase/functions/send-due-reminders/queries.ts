import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface DueItem {
  item_id: string;
  user_id: string;
  name: string;
  dose: string | null;
  expo_token: string;
  scheduled_at: string; // ISO timestamptz
}

// Devuelve items activos cuya specific_time coincide con el minuto actual (UTC)
// y que no tienen log done/omitted hoy, ni notification_log para scheduled_at del minuto actual
export async function getDueItems(supabase: SupabaseClient, nowUtc: Date): Promise<DueItem[]> {
  // HH:MM del minuto actual en UTC
  const hh = nowUtc.getUTCHours().toString().padStart(2, "0");
  const mm = nowUtc.getUTCMinutes().toString().padStart(2, "0");
  const timeWindow = `${hh}:${mm}`;
  const today = nowUtc.toISOString().slice(0, 10); // YYYY-MM-DD
  // Day of week: 1=lun..7=dom (JS: 0=sun → 7, 1=mon → 1, ..., 6=sat → 6)
  const jsDay = nowUtc.getUTCDay();
  const schemaDay = jsDay === 0 ? 7 : jsDay;

  // scheduled_at para el minuto actual (inicio del minuto)
  const scheduledAt = new Date(nowUtc);
  scheduledAt.setUTCSeconds(0, 0);
  const scheduledAtIso = scheduledAt.toISOString();

  const { data, error } = await supabase.rpc("get_due_items_for_push", {
    p_time_window: timeWindow,
    p_today: today,
    p_schema_day: schemaDay,
    p_scheduled_at: scheduledAtIso,
  });

  if (error) throw error;
  return (data ?? []) as DueItem[];
}

export async function insertNotificationLog(
  supabase: SupabaseClient,
  params: {
    user_id: string;
    item_id: string;
    scheduled_at: string;
    sent_at: string | null;
    status: "sent" | "cancelled" | "failed";
    error: string | null;
  }
): Promise<void> {
  const { error } = await supabase.from("notification_logs").insert(params);
  if (error) throw error;
}
