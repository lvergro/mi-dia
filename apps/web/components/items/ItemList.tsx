"use client";
import { useState } from "react";
import type { Item } from "@mi-dia/types";
import { ItemCard } from "./ItemCard";
import { ItemForm } from "./ItemForm";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function ItemList({ initial, userId }: { initial: Item[]; userId: string }) {
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);

  function handleUpdated(updated: Item) {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  }

  function handleDeleted(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function handleAdded(item: Item) {
    setItems(prev => [...prev, item].sort((a, b) => a.specific_time.localeCompare(b.specific_time)));
    setAdding(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          {items.length} ítem{items.length !== 1 ? "s" : ""}
        </h2>
        {!adding && (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Agregar
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl border border-primary/30 bg-white p-5">
          <ItemForm userId={userId} onSaved={handleAdded} onCancel={() => setAdding(false)} />
        </div>
      )}

      {items.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-3">💊</p>
          <p className="font-medium text-gray-900">Sin ítems registrados</p>
          <p className="text-sm text-muted mt-1">Agrega tu primer medicamento o actividad</p>
        </div>
      )}

      {items.map(item => (
        <ItemCard key={item.id} item={item} onUpdated={handleUpdated} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}
