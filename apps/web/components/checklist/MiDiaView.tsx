"use client";
import type { GroupedChecklist } from "@mi-dia/core";
import { TimeBlock } from "./TimeBlock";

const BLOCKS: Array<keyof GroupedChecklist> = ["mañana", "tarde", "noche"];

export function MiDiaView({ checklist, date }: { checklist: GroupedChecklist; date: string }) {
  const hasItems = BLOCKS.some(b => checklist[b].length > 0);

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-medium text-gray-900">No hay ítems para hoy</p>
        <p className="text-sm text-muted mt-1">Agrega medicamentos o actividades en la sección Rutina</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {BLOCKS.map(block => (
        <TimeBlock key={block} block={block} items={checklist[block]} date={date} />
      ))}
    </div>
  );
}
