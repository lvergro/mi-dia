"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarCheck, Pill, BarChart2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/mi-dia", label: "Mi Día", icon: CalendarCheck },
  { href: "/medicamentos", label: "Medicamentos", icon: Pill },
  { href: "/historial", label: "Historial", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r border-card-border bg-white px-3 py-6">
      <div className="mb-8 px-3">
        <h1 className="text-lg font-bold text-primary">Mi Día</h1>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary-subtle text-primary"
                : "text-muted hover:bg-surface hover:text-gray-900"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-danger-subtle hover:text-danger transition-colors"
      >
        <LogOut className="size-4 shrink-0" />
        Cerrar sesión
      </button>
    </aside>
  );
}
