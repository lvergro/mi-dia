import type { ItemWithStatus } from "@mi-dia/core";
import { Pill, Activity } from "lucide-react";

interface Props {
  item: ItemWithStatus | null;
}

export function NextDoseCard({ item }: Props) {
  if (!item) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-subtle">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Próxima toma</p>
        <p className="text-sm text-slate-400 text-center py-2">¡Todo al día! 🎉</p>
      </div>
    );
  }

  const isMed = item.type === "medication";

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-subtle">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">Próxima toma</p>
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100">
          {isMed
            ? <Pill className="size-7 text-indigo-500" strokeWidth={1.8} />
            : <Activity className="size-7 text-orange-400" strokeWidth={1.8} />}
        </div>
        <div>
          <p className="text-3xl font-bold text-indigo-700 leading-none">
            {item.specific_time.slice(0, 5)}
          </p>
          <p className="text-sm font-semibold text-slate-700 mt-1">{item.name}</p>
          {item.dose && <p className="text-xs text-slate-400">{item.dose}</p>}
        </div>
      </div>
    </div>
  );
}
