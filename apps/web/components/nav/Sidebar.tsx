"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarCheck, Pill, BarChart2, NotebookPen, UserCircle, LogOut, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/mi-dia",       label: "Mi Día",    icon: CalendarCheck },
  { href: "/medicamentos", label: "Rutina",    icon: Pill          },
  { href: "/historial",    label: "Historial", icon: BarChart2     },
  { href: "/notas",        label: "Notas",     icon: NotebookPen   },
  { href: "/mi-cuenta",   label: "Mi Cuenta", icon: UserCircle    },
];

interface SidebarProps {
  userEmail?: string | null;
  weeklyPct?: number | null;
}

export function Sidebar({ userEmail, weeklyPct }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : "U";

  return (
    <aside className="hidden md:flex h-full w-60 shrink-0 flex-col border-r border-slate-200/70 bg-white px-3 py-5">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
          <span className="text-sm">💊</span>
        </div>
        <span className="text-[15px] font-bold tracking-tight text-slate-900">Trazadía</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/mi-dia" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon
                className="size-[18px] shrink-0"
                strokeWidth={active ? 2.2 : 1.7}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Progreso semanal */}
      {weeklyPct !== null && weeklyPct !== undefined && (
        <div className="mx-1 mb-3 rounded-xl bg-indigo-50 px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-indigo-500" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-indigo-600">Progreso semanal</span>
            </div>
            <span className="text-[13px] font-bold text-indigo-700">{weeklyPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-indigo-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-0.5">
        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
            {initials}
          </div>
          <span className="truncate text-xs text-slate-500 flex-1">{userEmail ?? "Usuario"}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut className="size-[18px] shrink-0" strokeWidth={1.7} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
