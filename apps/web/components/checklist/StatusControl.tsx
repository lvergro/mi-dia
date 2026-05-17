"use client";
import { useState } from "react";
import type { ItemWithStatus } from "@mi-dia/core";
import { cn } from "@/lib/utils";
import { upsertLog, deleteLog } from "@/lib/db/logs";
import { Check, X, RotateCcw } from "lucide-react";

export function StatusControl({ item, date }: { item: ItemWithStatus; date: string }) {
  const [status, setStatus] = useState(item.status);
  const [logId, setLogId] = useState<string | null>(item.log?.id ?? null);
  const [saving, setSaving] = useState(false);

  async function handleDone() {
    if (saving) return;
    setSaving(true);
    try {
      if (status === "done") {
        if (logId) await deleteLog(logId);
        setStatus("pending");
        setLogId(null);
      } else {
        const log = await upsertLog({ user_id: item.user_id, item_id: item.id, date, status: "done" });
        setStatus("done");
        setLogId(log.id);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleOmitted() {
    if (saving) return;
    setSaving(true);
    try {
      if (status === "omitted") {
        if (logId) await deleteLog(logId);
        setStatus("pending");
        setLogId(null);
      } else {
        const log = await upsertLog({ user_id: item.user_id, item_id: item.id, date, status: "omitted" });
        setStatus("omitted");
        setLogId(log.id);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  if (status !== "pending") {
    return (
      <button
        onClick={status === "done" ? handleDone : handleOmitted}
        disabled={saving}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-gray-900 transition-colors disabled:opacity-50"
      >
        <RotateCcw className="size-3" />
        Revertir
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleDone}
        disabled={saving}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
          "text-done hover:bg-done-light"
        )}
      >
        <Check className="size-3.5" />
        <span className="hidden sm:inline">Hecho</span>
      </button>
      <button
        onClick={handleOmitted}
        disabled={saving}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
          "text-skipped hover:bg-pending"
        )}
      >
        <X className="size-3.5" />
        <span className="hidden sm:inline">Saltado</span>
      </button>
    </div>
  );
}
