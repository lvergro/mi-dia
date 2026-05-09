import { supabase } from "./client.js";

export interface PushToken {
  id: string;
  user_id: string;
  expo_token: string;
  platform: string;
  created_at: string;
  updated_at: string;
}

export async function upsertPushToken(expoToken: string): Promise<PushToken> {
  const { data, error } = await supabase
    .from("push_tokens")
    .upsert({ expo_token: expoToken, platform: "android" }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data as PushToken;
}

export async function getPushTokenByUserId(userId: string): Promise<PushToken | null> {
  const { data, error } = await supabase
    .from("push_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (data as PushToken) ?? null;
}
