import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDueItems, insertNotificationLog } from "./queries.ts";
import { sendExpoPush, ExpoPushMessage } from "./expo.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (_req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const nowUtc = new Date();

  let dueItems;
  try {
    dueItems = await getDueItems(supabase, nowUtc);
  } catch (err) {
    console.error("Error fetching due items:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }

  if (dueItems.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const messages: ExpoPushMessage[] = dueItems.map((item) => ({
    to: item.expo_token,
    title: item.name,
    body: item.dose ? `${item.name} — ${item.dose}` : undefined,
    data: { item_id: item.item_id },
  }));

  let tickets;
  try {
    tickets = await sendExpoPush(messages);
  } catch (err) {
    // Registrar fallo para todos los items candidatos
    for (const item of dueItems) {
      await insertNotificationLog(supabase, {
        user_id: item.user_id,
        item_id: item.item_id,
        scheduled_at: item.scheduled_at,
        sent_at: null,
        status: "failed",
        error: String(err),
      }).catch(console.error);
    }
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < dueItems.length; i++) {
    const item = dueItems[i];
    const ticket = tickets[i];
    const isOk = ticket?.status === "ok";

    await insertNotificationLog(supabase, {
      user_id: item.user_id,
      item_id: item.item_id,
      scheduled_at: item.scheduled_at,
      sent_at: isOk ? new Date().toISOString() : null,
      status: isOk ? "sent" : "failed",
      error: isOk ? null : (ticket?.message ?? "unknown"),
    }).catch(console.error);

    if (isOk) sent++;
    else failed++;
  }

  return new Response(JSON.stringify({ sent, failed }), { status: 200 });
});
