import type { DailyItem } from "@mi-dia/types";
import { ChecklistItem } from "./ChecklistItem";

const blockLabels = { morning: "Mañana", afternoon: "Tarde", night: "Noche" };
const blockEmoji = { morning: "☀️", afternoon: "🌤", night: "🌙" };

interface TimeBlockProps {
  block: "morning" | "afternoon" | "night";
  items: DailyItem[];
}

export function TimeBlock({ block, items }: TimeBlockProps) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted uppercase tracking-wide">
        <span>{blockEmoji[block]}</span>
        {blockLabels[block]}
        <span className="ml-auto text-xs font-normal normal-case">{items.length} ítem{items.length > 1 ? "s" : ""}</span>
      </h2>
      <div className="flex flex-col gap-2">
        {items.map(item => <ChecklistItem key={item.id} item={item} />)}
      </div>
    </section>
  );
}
