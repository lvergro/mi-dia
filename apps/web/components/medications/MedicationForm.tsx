"use client";
import { useState } from "react";
import type { Medication, MedicationInsert, MedicationUpdate } from "@mi-dia/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createMedication, updateMedication } from "@/lib/db/medications";

interface MedicationFormProps {
  initial?: Medication;
  userId: string;
  onSaved: (med: Medication) => void;
  onCancel: () => void;
}

export function MedicationForm({ initial, userId, onSaved, onCancel }: MedicationFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [dose, setDose] = useState(initial?.dose ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (initial) {
        const payload: MedicationUpdate = { name, dose: dose || null, instructions: instructions || null };
        const updated = await updateMedication(initial.id, payload);
        onSaved(updated);
      } else {
        const payload: MedicationInsert = { user_id: userId, name, dose: dose || null, instructions: instructions || null, active: true };
        const created = await createMedication(payload);
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
      <Input id="name" label="Nombre" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Omeprazol" />
      <Input id="dose" label="Dosis" value={dose} onChange={e => setDose(e.target.value)} placeholder="Ej: 20mg" />
      <Input id="instructions" label="Indicaciones" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Ej: Tomar antes de las comidas" />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{initial ? "Guardar cambios" : "Agregar"}</Button>
      </div>
    </form>
  );
}
