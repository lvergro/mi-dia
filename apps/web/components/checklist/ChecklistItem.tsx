import type { DailyItem } from "@mi-dia/types";
import { StatusControl } from "./StatusControl";
import { Badge } from "@/components/ui/Badge";
import type { DailyItemStatus } from "@mi-dia/types";

export function ChecklistItem({ item }: { item: DailyItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-card-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-900 text-sm">{item.title}</span>
          {item.scheduled_time && (
            <span className="text-xs text-muted">{item.scheduled_time.slice(0, 5)}</span>
          )}
        </div>
        <Badge variant={item.status as DailyItemStatus} />
      </div>
      <StatusControl itemId={item.id} initialStatus={item.status} />
    </div>
  );
}
