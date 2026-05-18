"use client";
import { useState } from "react";
import type { ItemWithStatus } from "@mi-dia/core";
import { cn } from "@/lib/utils";
import { Pill, Activity, Check, X, Loader2 } from "lucide-react";
import { upsertLog, deleteLog } from "@/lib/db/logs";

export function ChecklistItem({ item, date }: { item: ItemWithStatus; date: string }) {
  const [status, setStatus] = useState(item.status);
  const [logId, setLogId] = useState<string | null>(item.log?.id ?? null);
  const [saving, setSaving] = useState(false);

  const isDone = status === "done";
  const isOmitted = status === "omitted";
  const isPending = status === "pending";

  async function toggle(next: "done" | "omitted") {
    if (saving) return;
    setSaving(true);
    try {
      if (status === next) {
        if (logId) await deleteLog(logId);
        setStatus("pending");
        setLogId(null);
      } else {
        const log = await upsertLog({ user_id: item.user_id, item_id: item.id, date, status: next });
        setStatus(next);
        setLogId(log.id);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
      isDone    && "border-green-200 bg-green-50",
      isOmitted && "border-slate-200 bg-slate-50 opacity-60",
      isPending && "border-slate-200/70 bg-white shadow-subtle",
    )}>
      {/* Icono tipo */}
      <div className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl",
        isDone
          ? "bg-green-100"
          : item.type === "medication" ? "bg-indigo-100" : "bg-orange-100",
      )}>
        {item.type === "medication"
          ? <Pill className={cn("size-[16px]", isDone ? "text-green-500" : "text-indigo-500")} strokeWidth={1.8} />
          : <Activity className={cn("size-[16px]", isDone ? "text-green-500" : "text-orange-500")} strokeWidth={1.8} />}
      </div>

      {/* Nombre + hora */}
      <div className="flex flex-1 flex-col min-w-0">
        <span className={cn(
          "truncate text-sm font-semibold",
          isDone    ? "text-green-600" :
          isOmitted ? "text-slate-400 line-through" :
                      "text-slate-800",
        )}>
          {item.name}
        </span>
        <span className="text-xs text-slate-400">
          {item.specific_time.slice(0, 5)}{item.dose ? ` · ${item.dose}` : ""}
        </span>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isPending && (
          <button
            onClick={() => toggle("omitted")}
            disabled={saving}
            title="Saltar"
            className="flex size-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>
        )}

        <button
          onClick={() => toggle(isOmitted ? "omitted" : "done")}
          disabled={saving}
          title={isDone ? "Revertir" : isOmitted ? "Revertir" : "Marcar hecho"}
          className={cn(
            "flex size-7 items-center justify-center rounded-full border-2 transition-all disabled:opacity-40",
            isDone    && "border-green-500 bg-green-500 text-white",
            isOmitted && "border-slate-300 bg-slate-200 text-slate-400",
            isPending && "border-slate-300 bg-white hover:border-green-400 hover:bg-green-50",
          )}
        >
          {saving
            ? <Loader2 className="size-3.5 animate-spin" />
            : isDone
              ? <Check className="size-3.5" strokeWidth={2.5} />
              : isOmitted
                ? <span className="text-[11px] font-bold leading-none">–</span>
                : null}
        </button>
      </div>
    </div>
  );
}
