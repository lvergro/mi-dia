import { cn } from "@/lib/utils";
type Variant = "done" | "skipped" | "not_sure" | "pending";
const styles: Record<Variant, string> = {
  done: "bg-done-light text-done",
  skipped: "bg-pending text-skipped",
  not_sure: "bg-warning-subtle text-not_sure",
  pending: "bg-pending text-muted",
};
const labels: Record<Variant, string> = {
  done: "Hecho",
  skipped: "Saltado",
  not_sure: "No recuerdo",
  pending: "Pendiente",
};
export function Badge({ variant }: { variant: Variant }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[variant])}>
      {labels[variant]}
    </span>
  );
}
