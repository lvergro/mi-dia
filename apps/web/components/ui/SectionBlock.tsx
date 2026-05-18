import { cn } from "@/lib/utils";

interface SectionBlockProps {
  title: string;
  emoji?: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
}

export function SectionBlock({ title, emoji, count, children, className }: SectionBlockProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        {emoji && <span className="text-sm">{emoji}</span>}
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{title}</h3>
        {count !== undefined && (
          <span className="ml-auto text-xs text-slate-400 font-normal">{count} ítem{count !== 1 ? "s" : ""}</span>
        )}
      </div>
      {children}
    </section>
  );
}
