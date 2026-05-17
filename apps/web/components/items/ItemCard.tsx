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
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-card-border bg-white p-5">
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          item.type === "medication" ? "bg-done-light" : "bg-orange-100"
        )}>
          {item.type === "medication"
            ? <Pill className="size-4 text-done" />
            : <Activity className="size-4 text-orange-600" />
          }
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-900">{item.name}</span>
          <span className="text-xs text-muted">
            {item.specific_time.slice(0, 5)}
            {item.dose && ` · ${item.dose}`}
            {" · "}{recurrence}
            {" · "}{blockLabels[getItemBlock(item.specific_time)]}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => setEditing(true)} className="rounded-lg p-2 text-muted hover:text-primary hover:bg-primary-subtle transition-colors">
          <Pencil className="size-4" />
        </button>
        <button onClick={handleDelete} disabled={deleting} className="rounded-lg p-2 text-muted hover:text-danger hover:bg-danger-subtle transition-colors disabled:opacity-50">
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
