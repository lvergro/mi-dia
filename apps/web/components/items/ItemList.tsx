"use client";
import { useState, useMemo } from "react";
import type { Item } from "@mi-dia/types";
import { ItemCard } from "./ItemCard";
import { ItemForm } from "./ItemForm";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "medication" | "activity";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all",        label: "Todos"        },
  { key: "medication", label: "Medicamentos" },
  { key: "activity",  label: "Actividades"  },
];

export function ItemList({ initial, userId }: { initial: Item[]; userId: string }) {
  const [items, setItems]   = useState(initial);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

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

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchesType = filter === "all" || i.type === filter;
      const matchesSearch = !search.trim() || i.name.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [items, filter, search]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controles superiores */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Buscador */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" strokeWidth={1.8} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 transition-colors"
          />
        </div>

        {/* Botón agregar */}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Plus className="size-4" strokeWidth={2} />
            Agregar
          </button>
        )}
      </div>

      {/* Filtros pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
              filter === f.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 self-center">
          {filtered.length} ítem{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Formulario de agregar */}
      {adding && (
        <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-subtle">
          <ItemForm userId={userId} onSaved={handleAdded} onCancel={() => setAdding(false)} />
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 && !adding ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <span className="text-4xl">💊</span>
          <p className="font-semibold text-slate-800">
            {search ? "Sin resultados" : "Sin ítems registrados"}
          </p>
          <p className="text-sm text-slate-400">
            {search ? "Prueba con otro término" : "Agrega tu primer medicamento o actividad"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
