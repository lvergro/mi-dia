"use client";
import type { DailyItem } from "@mi-dia/types";
import { groupItemsByTimeBlock } from "@mi-dia/core";
import { TimeBlock } from "./TimeBlock";

export function MiDiaView({ items }: { items: DailyItem[] }) {
  const groups = groupItemsByTimeBlock(items);
  const hasItems = Object.values(groups).some((g: DailyItem[]) => g.length > 0);

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-medium text-gray-900">No hay ítems para hoy</p>
        <p className="text-sm text-muted mt-1">Agrega medicamentos o actividades en la sección Medicamentos</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <TimeBlock block="morning" items={groups.morning} />
      <TimeBlock block="afternoon" items={groups.afternoon} />
      <TimeBlock block="night" items={groups.night} />
    </div>
  );
}
