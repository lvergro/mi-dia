import { cn } from "@/lib/utils";

interface AdherenceBarProps {
  date: string;
  pct: number;
  done: number;
  total: number;
}

function pctColor(pct: number) {
  if (pct >= 80) return "bg-done";
  if (pct >= 50) return "bg-not_sure";
  return "bg-danger";
}

export function AdherenceBar({ date, pct, done, total }: AdherenceBarProps) {
  const d = new Date(date + "T12:00:00");
  const label = d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="flex items-center gap-4">
      <span className="w-28 text-xs text-muted capitalize">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-pending overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", pctColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 text-right text-xs font-medium text-gray-900">
        {total === 0 ? "—" : `${done}/${total}`}
      </span>
      <span className="w-10 text-right text-xs font-bold text-gray-900">
        {total === 0 ? "—" : `${pct}%`}
      </span>
    </div>
  );
}
