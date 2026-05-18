import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "indigo" | "green" | "amber" | "red" | "slate";
  className?: string;
}

const colorMap = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", icon: "bg-indigo-100" },
  green:  { bg: "bg-green-50",  text: "text-green-600",  icon: "bg-green-100"  },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600",  icon: "bg-amber-100"  },
  red:    { bg: "bg-red-50",    text: "text-red-600",    icon: "bg-red-100"    },
  slate:  { bg: "bg-slate-50",  text: "text-slate-600",  icon: "bg-slate-100"  },
};

export function StatCard({ label, value, icon, color = "indigo", className }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("rounded-2xl border border-slate-200/70 bg-white p-4 shadow-subtle flex items-center gap-3", className)}>
      {icon && (
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", c.icon)}>
          <span className={c.text}>{icon}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className={cn("text-xl font-bold leading-tight", c.text)}>{value}</p>
      </div>
    </div>
  );
}
