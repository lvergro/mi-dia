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

  return (
    <div className="flex items-center gap-3 rounded-3xl border border-card-border bg-white p-4 shadow-subtle">
      <div className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-[12px]",
        item.type === "medication" ? "bg-done-light" : "bg-orange-100"
      )}>
        {item.type === "medication"
          ? <Pill className="size-[18px] text-done" strokeWidth={1.8} />
          : <Activity className="size-[18px] text-orange-500" strokeWidth={1.8} />
        }
      </div>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="truncate text-sm font-semibold text-[#1e293b]">{item.name}</span>
        <span className="text-xs text-[#94a3b8]">
          {item.specific_time.slice(0, 5)}
          {item.dose ? ` · ${item.dose}` : ""}
          {" · "}{recurrence}
          {" · "}{blockLabels[getItemBlock(item.specific_time)]}
        </span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={() => setEditing(true)} className="rounded-xl p-2 text-[#94a3b8] hover:text-primary hover:bg-primary-subtle transition-colors">
          <Pencil className="size-[15px]" strokeWidth={1.8} />
        </button>
        <button onClick={handleDelete} disabled={deleting} className="rounded-xl p-2 text-[#94a3b8] hover:text-danger hover:bg-danger-subtle transition-colors disabled:opacity-50">
          <Trash2 className="size-[15px]" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
