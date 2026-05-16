import type { DailyItem } from "@mi-dia/types";
import { calculateAdherence } from "@mi-dia/core";
import { AdherenceBar } from "./AdherenceBar";

interface DayData {
  date: string;
  items: DailyItem[];
}

export function HistorialView({ days }: { days: DayData[] }) {
  if (days.length === 0 || days.every(d => d.items.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-medium text-gray-900">Sin historial todavía</p>
        <p className="text-sm text-muted mt-1">Comienza a marcar tus ítems diarios para ver tu adherencia</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {days.map(({ date, items }) => {
        const { done, total, pct } = calculateAdherence(items);
        return <AdherenceBar key={date} date={date} pct={pct} done={done} total={total} />;
      })}
    </div>
  );
}
