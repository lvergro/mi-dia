import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Metro inlines EXPO_PUBLIC_ vars with dot notation only (not bracket notation)
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as unknown as SupportedStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // Implicit flow avoids expo-crypto (PKCE) which requires native modules not available in Expo Go
    flowType: "implicit",
  },
});
