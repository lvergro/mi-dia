"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Pill, BarChart2, NotebookPen, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/mi-dia",       label: "Mi Día",    icon: CalendarCheck },
  { href: "/medicamentos", label: "Rutina",    icon: Pill          },
  { href: "/historial",    label: "Historial", icon: BarChart2     },
  { href: "/notas",        label: "Notas",     icon: NotebookPen   },
  { href: "/mi-cuenta",   label: "Cuenta",    icon: UserCircle    },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/mi-dia" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
              active ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <Icon className="size-5 shrink-0" strokeWidth={active ? 2.2 : 1.7} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
