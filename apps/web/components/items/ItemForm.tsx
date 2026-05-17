"use client";
import { useState } from "react";
import type { Item } from "@mi-dia/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createItem, updateItem } from "@/lib/db/items";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function ItemForm({ initial, userId, onSaved, onCancel }: {
  initial?: Item;
  userId: string;
  onSaved: (item: Item) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<"medication" | "activity">(initial?.type ?? "medication");
  const [dose, setDose] = useState(initial?.dose ?? "");
  const [specificTime, setSpecificTime] = useState(initial?.specific_time?.slice(0, 5) ?? "08:00");
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "specific_days">(initial?.recurrence_type ?? "daily");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(initial?.recurrence_days ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: number) {
    setRecurrenceDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (recurrenceType === "specific_days" && recurrenceDays.length === 0) {
      setError("Selecciona al menos un día");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        type,
        name,
        dose: dose || null,
        specific_time: specificTime + ":00",
        recurrence_type: recurrenceType,
        recurrence_days: recurrenceType === "specific_days" ? recurrenceDays : null,
        deleted_at: null,
      };
      if (initial) {
        const updated = await updateItem(initial.id, payload);
        onSaved(updated);
      } else {
        const created = await createItem(payload as Parameters<typeof createItem>[0]);
        onSaved(created);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Type selector */}
      <div className="flex gap-2">
        {(["medication", "activity"] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium border transition-colors ${
              type === t
                ? "border-primary bg-primary-subtle text-primary"
                : "border-card-border text-muted hover:border-primary/40"
            }`}
          >
            {t === "medication" ? "💊 Medicamento" : "⚡ Actividad"}
          </button>
        ))}
      </div>

      <Input id="name" label="Nombre" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Omeprazol" />
      <Input id="dose" label="Dosis (opcional)" value={dose} onChange={e => setDose(e.target.value)} placeholder="Ej: 20mg" />
      <Input id="time" label="Hora" type="time" required value={specificTime} onChange={e => setSpecificTime(e.target.value)} />

      {/* Recurrence */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Recurrencia</label>
        <div className="flex gap-2">
          {(["daily", "specific_days"] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRecurrenceType(r)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium border transition-colors ${
                recurrenceType === r
                  ? "border-primary bg-primary-subtle text-primary"
                  : "border-card-border text-muted hover:border-primary/40"
              }`}
            >
              {r === "daily" ? "Diaria" : "Días específicos"}
            </button>
          ))}
        </div>
        {recurrenceType === "specific_days" && (
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.map((label, i) => {
              const day = i + 1;
              const active = recurrenceDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                    active ? "border-primary bg-primary text-white" : "border-card-border text-muted hover:border-primary/40"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? "Guardar cambios" : "Agregar"}</Button>
      </div>
    </form>
  );
}
