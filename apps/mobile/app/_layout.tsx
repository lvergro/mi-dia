import "../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onAuthStateChange } from "@mi-dia/database";
import { useSessionStore } from "../hooks/useSession";
import { useRegisterPushToken } from "../hooks/useRegisterPushToken";
import { setupNotificationHandler } from "../lib/notifications";

setupNotificationHandler();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading } = useSessionStore();

  useRegisterPushToken();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on subscribe, so no
    // separate getSession() call is needed. A parallel getSession()
    // would race and overwrite a valid session with null.
    const listener = onAuthStateChange((_event, session) => {
      useSessionStore.getState().setSession(session);
    });
    return () => listener.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}
