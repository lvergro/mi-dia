"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAccount } from "@/lib/db/account";

type Step = "idle" | "confirm1" | "confirm2" | "deleting";

export function DangerZone() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setStep("deleting");
    try {
      await deleteAccount();
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStep("idle");
    }
  }

  if (step === "deleting") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-subtle flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-red-500 shrink-0" />
        <p className="text-sm text-red-600 font-medium">Eliminando cuenta…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-subtle">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Zona de peligro</h2>

      {step === "idle" && (
        <button
          onClick={() => setStep("confirm1")}
          className="flex items-center gap-3 w-full rounded-xl px-4 py-3.5 text-left hover:bg-red-50 transition-colors"
        >
          <div className="flex size-8 items-center justify-center rounded-xl bg-red-50 shrink-0">
            <Trash2 className="size-4 text-red-500" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-medium text-red-600">Eliminar cuenta</p>
            <p className="text-xs text-slate-400 mt-0.5">Esta acción es permanente</p>
          </div>
        </button>
      )}

      {step === "confirm1" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-700">
            Esta acción es permanente. Se borrarán todos tus datos y no podrás recuperarlos.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setStep("idle")}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setStep("confirm2")}
              className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {step === "confirm2" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-red-600">
            ¿Estás seguro? Confirma que deseas eliminar tu cuenta definitivamente.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setStep("idle")}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => void handleDelete()}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-500">{error}</p>
      )}
    </div>
  );
}
