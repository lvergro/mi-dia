import { createClient } from "@supabase/supabase-js";

// Expo uses EXPO_PUBLIC_ prefix; Node scripts use SUPABASE_ prefix
const supabaseUrl =
  (typeof process !== "undefined" && process.env["EXPO_PUBLIC_SUPABASE_URL"]) ||
  (typeof process !== "undefined" && process.env["SUPABASE_URL"]) ||
  "";

const supabaseAnonKey =
  (typeof process !== "undefined" && process.env["EXPO_PUBLIC_SUPABASE_ANON_KEY"]) ||
  (typeof process !== "undefined" && process.env["SUPABASE_ANON_KEY"]) ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
