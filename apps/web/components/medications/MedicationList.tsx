"use client";
import { useState } from "react";
import type { Medication } from "@mi-dia/types";
import { MedicationCard } from "./MedicationCard";
import { MedicationForm } from "./MedicationForm";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function MedicationList({ initial, userId }: { initial: Medication[]; userId: string }) {
  const [medications, setMedications] = useState(initial);
  const [adding, setAdding] = useState(false);

  function handleUpdated(updated: Medication) {
    setMedications(prev => prev.map(m => m.id === updated.id ? updated : m));
  }

  function handleDeleted(id: string) {
    setMedications(prev => prev.filter(m => m.id !== id));
  }

  function handleAdded(med: Medication) {
    setMedications(prev => [...prev, med]);
    setAdding(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">{medications.length} medicamento{medications.length !== 1 ? "s" : ""}</h2>
        {!adding && (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Agregar
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl border border-primary/30 bg-white p-5">
          <MedicationForm userId={userId} onSaved={handleAdded} onCancel={() => setAdding(false)} />
        </div>
      )}

      {medications.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-3">💊</p>
          <p className="font-medium text-gray-900">Sin medicamentos registrados</p>
          <p className="text-sm text-muted mt-1">Agrega tu primer medicamento para comenzar</p>
        </div>
      )}

      {medications.map(med => (
        <MedicationCard key={med.id} medication={med} onUpdated={handleUpdated} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}
