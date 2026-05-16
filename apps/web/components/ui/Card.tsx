import { cn } from "@/lib/utils";
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-card-border bg-white p-5 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}
