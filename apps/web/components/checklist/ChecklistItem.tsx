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
      "flex items-center gap-3 rounded-3xl border p-4 transition-all shadow-subtle",
      isDone   && "border-done-light bg-done-subtle",
      isOmitted && "border-pending bg-surface opacity-60",
      isPending && "border-card-border bg-white",
    )}>
      {/* Icono tipo */}
      <div className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-[12px]",
        item.type === "medication" ? "bg-done-light" : "bg-orange-100",
      )}>
        {item.type === "medication"
          ? <Pill className="size-[18px] text-done" strokeWidth={1.8} />
          : <Activity className="size-[18px] text-orange-500" strokeWidth={1.8} />}
      </div>

      {/* Nombre + hora */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className={cn(
          "truncate text-sm font-semibold",
          isDone ? "text-done" : isOmitted ? "text-[#94a3b8] line-through" : "text-[#1e293b]",
        )}>
          {item.name}
        </span>
        <span className="text-xs text-[#94a3b8]">
          {item.specific_time.slice(0, 5)}
          {item.dose ? ` · ${item.dose}` : ""}
        </span>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isPending && (
          <button
            onClick={() => toggle("omitted")}
            disabled={saving}
            title="Saltar"
            className="flex size-7 items-center justify-center rounded-full border border-pending bg-white text-[#94a3b8] hover:border-skipped hover:text-skipped transition-colors disabled:opacity-40"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        )}

        <button
          onClick={() => toggle(isOmitted ? "omitted" : "done")}
          disabled={saving}
          title={isDone ? "Revertir" : isOmitted ? "Revertir" : "Marcar hecho"}
          className={cn(
            "flex size-7 items-center justify-center rounded-full border-2 transition-all disabled:opacity-40",
            isDone    && "border-done bg-done text-white",
            isOmitted && "border-pending bg-[#e2e8f0] text-[#94a3b8]",
            isPending && "border-[#cbd5e1] bg-white hover:border-done hover:bg-done-light",
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
