import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg">
      <Sidebar userEmail={user.email} weeklyPct={null} />
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-20 md:px-8 md:py-8 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
