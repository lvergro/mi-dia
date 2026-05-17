import type { ItemWithStatus } from "@mi-dia/core";
import { StatusControl } from "./StatusControl";
import { cn } from "@/lib/utils";
import { Pill, Activity } from "lucide-react";

export function ChecklistItem({ item, date }: { item: ItemWithStatus; date: string }) {
  const isDone = item.status === "done";
  const isOmitted = item.status === "omitted";

  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-xl border p-4",
      isDone && "border-done-light bg-done-subtle",
      isOmitted && "border-pending bg-surface opacity-60",
      !isDone && !isOmitted && "border-card-border bg-white"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            item.type === "medication" ? "bg-done-light" : "bg-orange-100"
          )}>
            {item.type === "medication"
              ? <Pill className="size-4 text-done" />
              : <Activity className="size-4 text-orange-600" />
            }
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={cn("font-medium text-sm", isDone ? "text-done" : isOmitted ? "text-muted line-through" : "text-gray-900")}>
              {item.name}
            </span>
            <span className="text-xs text-muted">
              {item.specific_time.slice(0, 5)}
              {item.dose && ` · ${item.dose}`}
            </span>
          </div>
        </div>
      </div>
      <StatusControl item={item} date={date} />
    </div>
  );
}
