"use client";
import type { Medication } from "@mi-dia/types";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteMedication } from "@/lib/db/medications";
import { MedicationForm } from "./MedicationForm";

interface MedicationCardProps {
  medication: Medication;
  onUpdated: (med: Medication) => void;
  onDeleted: (id: string) => void;
}

export function MedicationCard({ medication, onUpdated, onDeleted }: MedicationCardProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${medication.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteMedication(medication.id);
      onDeleted(medication.id);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-white p-5">
        <MedicationForm
          initial={medication}
          userId={medication.user_id}
          onSaved={med => { onUpdated(med); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-card-border bg-white p-5">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-gray-900">{medication.name}</span>
        {medication.dose && <span className="text-sm text-muted">{medication.dose}</span>}
        {medication.instructions && <span className="text-xs text-muted">{medication.instructions}</span>}
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
