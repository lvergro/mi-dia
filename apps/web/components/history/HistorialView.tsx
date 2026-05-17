import type { DayHistory } from "@mi-dia/core";
import { AdherenceBar } from "./AdherenceBar";

export function HistorialView({ history }: { history: DayHistory[] }) {
  if (history.length === 0) {
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
      {history.map(day => (
        <AdherenceBar key={day.date} date={day.date} pct={day.pct} done={day.done} total={day.total} />
      ))}
    </div>
  );
}
