"use client";
import type { Item } from "@mi-dia/types";
import { useState } from "react";
import { Pencil, Trash2, Pill, Activity } from "lucide-react";
import { deleteItem } from "@/lib/db/items";
import { ItemForm } from "./ItemForm";
import { cn } from "@/lib/utils";
import { getItemBlock } from "@mi-dia/core";

const blockLabels = { mañana: "Mañana", tarde: "Tarde", noche: "Noche" };
const DAY_LABELS = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function ItemCard({ item, onUpdated, onDeleted }: {
  item: Item;
  onUpdated: (i: Item) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    setDeleting(true);
    try { await deleteItem(item.id); onDeleted(item.id); }
    catch (e) { console.error(e); }
    finally { setDeleting(false); }
  }

  const recurrence = item.recurrence_type === "daily"
    ? "Diaria"
    : (item.recurrence_days ?? []).map(d => DAY_LABELS[d]).join(", ");

  if (editing) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-white p-5">
        <ItemForm
          initial={item}
          userId={item.user_id}
          onSaved={i => { onUpdated(i); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const isMed = item.type === "medication";
  const block = getItemBlock(item.specific_time);

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-subtle hover:shadow-md transition-shadow">
      {/* Icono */}
      <div className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl mt-0.5",
        isMed ? "bg-indigo-100" : "bg-orange-100"
      )}>
        {isMed
          ? <Pill className="size-[17px] text-indigo-500" strokeWidth={1.8} />
          : <Activity className="size-[17px] text-orange-500" strokeWidth={1.8} />
        }
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col min-w-0 gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-900 truncate">{item.name}</span>
          <span className={cn(
            "text-[10px] font-semibold rounded-full px-2 py-0.5",
            isMed ? "bg-indigo-50 text-indigo-600" : "bg-orange-50 text-orange-600"
          )}>
            {isMed ? "Medicamento" : "Actividad"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          <span>🕐 {item.specific_time.slice(0, 5)}</span>
          {item.dose && <span>· {item.dose}</span>}
          <span>· {recurrence}</span>
          <span>· {blockLabels[block]}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="rounded-xl p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Pencil className="size-[14px]" strokeWidth={1.8} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-xl p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 className="size-[14px]" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
