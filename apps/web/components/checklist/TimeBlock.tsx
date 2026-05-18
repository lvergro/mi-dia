import type { ItemWithStatus, ItemBlock } from "@mi-dia/core";
import { ChecklistItem } from "./ChecklistItem";

const blockLabels: Record<ItemBlock, string> = { mañana: "Mañana", tarde: "Tarde", noche: "Noche" };
const blockEmoji: Record<ItemBlock, string> = { mañana: "☀️", tarde: "🌤", noche: "🌙" };

interface TimeBlockProps {
  block: ItemBlock;
  items: ItemWithStatus[];
  date: string;
}

export function TimeBlock({ block, items, date }: TimeBlockProps) {
  if (items.length === 0) return null;
  const done = items.filter(i => i.status === "done").length;
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span className="text-sm">{blockEmoji[block]}</span>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {blockLabels[block]}
        </h3>
        <div className="flex-1 h-px bg-slate-100 mx-1" />
        <span className="text-[11px] text-slate-400">{done}/{items.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map(item => <ChecklistItem key={item.id} item={item} date={date} />)}
      </div>
    </section>
  );
}
