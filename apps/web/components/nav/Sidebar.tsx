"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarCheck, Pill, BarChart2, NotebookPen, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/mi-dia", label: "Mi Día", icon: CalendarCheck },
  { href: "/medicamentos", label: "Rutina", icon: Pill },
  { href: "/historial", label: "Historial", icon: BarChart2 },
  { href: "/notas", label: "Notas", icon: NotebookPen },
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
      {/* Brand */}
      <div className="mb-8 flex items-center gap-3 px-3">
        <div className="flex size-8 items-center justify-center rounded-[10px] bg-primary">
          <span className="text-base">💊</span>
        </div>
        <h1 className="text-base font-bold text-[#1e293b]">Mi Día</h1>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary-subtle text-primary"
                : "text-[#64748b] hover:bg-surface hover:text-[#1e293b]"
            )}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={pathname === href ? 2 : 1.7} />
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#94a3b8] hover:bg-danger-subtle hover:text-danger transition-colors"
      >
        <LogOut className="size-[18px] shrink-0" strokeWidth={1.7} />
        Cerrar sesión
      </button>
    </aside>
  );
}
