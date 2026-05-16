"use client";
import { useState } from "react";
import type { DailyItemStatus } from "@mi-dia/types";
import { cn } from "@/lib/utils";
import { updateDailyItemStatus } from "@/lib/db/daily-items";
import { NotSureWarning } from "./NotSureWarning";
import { Check, X, HelpCircle } from "lucide-react";

interface StatusControlProps {
  itemId: string;
  initialStatus: DailyItemStatus;
}

const buttons: { status: DailyItemStatus; label: string; icon: React.ElementType; active: string; idle: string }[] = [
  { status: "done", label: "Hecho", icon: Check, active: "bg-done text-white", idle: "text-done hover:bg-done-light" },
  { status: "skipped", label: "Saltar", icon: X, active: "bg-skipped text-white", idle: "text-skipped hover:bg-pending" },
  { status: "not_sure", label: "No recuerdo", icon: HelpCircle, active: "bg-not_sure text-white", idle: "text-not_sure hover:bg-warning-subtle" },
];

export function StatusControl({ itemId, initialStatus }: StatusControlProps) {
  const [status, setStatus] = useState<DailyItemStatus>(initialStatus);
  const [showWarning, setShowWarning] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleClick(newStatus: DailyItemStatus) {
    if (saving) return;
    setSaving(true);
    try {
      const completedAt = newStatus === "done" ? new Date().toISOString() : undefined;
      await updateDailyItemStatus(itemId, newStatus, completedAt);
      setStatus(newStatus);
      setShowWarning(newStatus === "not_sure");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {buttons.map(({ status: s, label, icon: Icon, active, idle }) => (
          <button
            key={s}
            onClick={() => handleClick(s)}
            disabled={saving}
            title={label}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
              status === s ? active : idle
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      {showWarning && <NotSureWarning />}
    </div>
  );
}
