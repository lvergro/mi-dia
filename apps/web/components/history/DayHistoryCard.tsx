"use client";
import { useState } from "react";
import type { DayHistory } from "@mi-dia/core";
import { ChevronDown, ChevronUp, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const MOOD_EMOJI: Record<number, string> = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

function pctVariant(pct: number) {
  if (pct >= 80) return { bar: "bg-green-500",  text: "text-green-600",  bg: "bg-green-50",  border: "border-green-200"  };
  if (pct >= 50) return { bar: "bg-amber-400",  text: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200"  };
  return               { bar: "bg-red-400",    text: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"    };
}

export function DayHistoryCard({ day }: { day: DayHistory }) {
  const [open, setOpen] = useState(false);
  const d = new Date(day.date + "T12:00:00");
  const label = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" });
  const v = pctVariant(day.pct);

  return (
    <div className={cn("rounded-2xl border overflow-hidden shadow-subtle transition-shadow hover:shadow-md", v.border)}>
      {/* Header de la card */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn("w-full flex items-center gap-3 px-4 py-3.5 transition-colors", v.bg)}
      >
        {/* Fecha */}
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-sm font-semibold text-slate-800 capitalize">{label}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1.5 w-24 rounded-full bg-white/70 overflow-hidden">
              <div className={cn("h-full rounded-full", v.bar)} style={{ width: `${day.pct}%` }} />
            </div>
            <span className={cn("text-xs font-bold", v.text)}>{day.pct}%</span>
            <span className="text-xs text-slate-400">({day.done}/{day.total})</span>
            {day.mood && <span className="text-sm">{MOOD_EMOJI[day.mood]}</span>}
          </div>
        </div>
        {open ? <ChevronUp className="size-4 text-slate-400 shrink-0" /> : <ChevronDown className="size-4 text-slate-400 shrink-0" />}
      </button>

      {/* Detalle colapsable */}
      {open && (
        <div className="bg-white px-4 pb-4 pt-2 border-t border-slate-100">
          <div className="flex flex-col gap-1.5">
            {day.items.map(item => (
              <div key={item.item_id} className="flex items-center gap-2.5 py-1">
                <div className={cn(
                  "size-5 rounded-full flex items-center justify-center shrink-0",
                  item.status === "done"    && "bg-green-100",
                  item.status === "omitted" && "bg-slate-100",
                  item.status === "pending" && "bg-slate-100",
                )}>
                  {item.status === "done"
                    ? <Check className="size-3 text-green-500" strokeWidth={2.5} />
                    : <Minus className="size-3 text-slate-400" strokeWidth={2} />}
                </div>
                <span className={cn(
                  "text-sm",
                  item.status === "done"    ? "text-slate-700" :
                  item.status === "omitted" ? "text-slate-400 line-through" :
                                              "text-slate-500"
                )}>
                  {item.name}
                </span>
                <span className="ml-auto text-xs text-slate-400">{item.scheduled_time.slice(0, 5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
