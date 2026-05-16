import { AlertTriangle } from "lucide-react";
export function NotSureWarning() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-warning-subtle border border-not_sure/30 px-4 py-3 text-sm text-gray-700">
      <AlertTriangle className="size-4 shrink-0 text-not_sure mt-0.5" />
      <p>No hay confirmación de toma. Revisa tu pastillero o consulta tus indicaciones médicas antes de repetir una dosis.</p>
    </div>
  );
}
