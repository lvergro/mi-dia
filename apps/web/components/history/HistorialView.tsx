"use client";
import type { DayHistory } from "@mi-dia/core";
import { HistoryStatCards } from "./HistoryStatCards";
import { DayHistoryCard } from "./DayHistoryCard";

interface Props {
  history: DayHistory[];
}

export function HistorialView({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
        <span className="text-4xl">📊</span>
        <p className="font-semibold text-slate-800">Sin historial todavía</p>
        <p className="text-sm text-slate-400">Comienza a marcar tus ítems diarios para ver tu adherencia</p>
      </div>
    );
  }

  return (
    <div>
      <HistoryStatCards history={history} />
      <div className="flex flex-col gap-2.5">
        {history.map(day => (
          <DayHistoryCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}
