import type { DayHistory } from "@mi-dia/core";
import { TrendingUp, Flame, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

function calcStreak(history: DayHistory[]): number {
  let streak = 0;
  for (const day of history) {
    if (day.pct >= 80) streak++;
    else break;
  }
  return streak;
}

interface Props {
  history: DayHistory[];
}

export function HistoryStatCards({ history }: Props) {
  const avgPct = history.length === 0
    ? 0
    : Math.round(history.reduce((s, d) => s + d.pct, 0) / history.length);

  const totalDone = history.reduce((s, d) => s + d.done, 0);
  const streak = calcStreak(history);

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <StatCard
        label="Adherencia promedio"
        value={`${avgPct}%`}
        icon={<TrendingUp className="size-5" strokeWidth={1.8} />}
        color={avgPct >= 80 ? "green" : avgPct >= 50 ? "amber" : "red"}
      />
      <StatCard
        label="Racha (días)"
        value={streak}
        icon={<Flame className="size-5" strokeWidth={1.8} />}
        color="amber"
      />
      <StatCard
        label="Tomas completadas"
        value={totalDone}
        icon={<CheckCircle2 className="size-5" strokeWidth={1.8} />}
        color="green"
      />
    </div>
  );
}
