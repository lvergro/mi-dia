"use client";
import type { MoodValue } from "@mi-dia/types";
import { cn } from "@/lib/utils";

const MOODS = [
  { value: 1 as MoodValue, emoji: "😢", label: "Muy mal",   color: "#ef4444", bg: "#fef2f2", border: "#ef4444" },
  { value: 2 as MoodValue, emoji: "😕", label: "Mal",       color: "#f97316", bg: "#fff7ed", border: "#f97316" },
  { value: 3 as MoodValue, emoji: "😐", label: "Normal",    color: "#eab308", bg: "#fefce8", border: "#eab308" },
  { value: 4 as MoodValue, emoji: "🙂", label: "Bien",      color: "#22c55e", bg: "#f0fdf4", border: "#22c55e" },
  { value: 5 as MoodValue, emoji: "😄", label: "Excelente", color: "#3b82f6", bg: "#eff6ff", border: "#3b82f6" },
];

interface Props {
  mood: MoodValue | null;
  onMoodChange: (v: MoodValue) => void;
  isSaving?: boolean;
}

export function MoodCard({ mood, onMoodChange, isSaving }: Props) {
  const selected = MOODS.find((m) => m.value === mood);

  return (
    <div
      className="rounded-[20px] border-2 p-4 mb-4 transition-colors duration-300"
      style={{
        borderColor: selected?.border ?? "#e5e7eb",
        backgroundColor: selected?.bg ?? "#ffffff",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-[#6b7280]">¿Cómo te sientes hoy?</span>
        {isSaving && <span className="text-[11px] text-[#9ca3af]">Guardando…</span>}
      </div>
      <div className="flex justify-between">
        {MOODS.map((opt) => {
          const isSelected = mood === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onMoodChange(opt.value)}
              className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80 active:opacity-60"
            >
              <div
                className="flex size-[52px] items-center justify-center rounded-full transition-all"
                style={{
                  borderWidth: isSelected ? 3 : 1.5,
                  borderStyle: "solid",
                  borderColor: isSelected ? opt.border : "#e5e7eb",
                  backgroundColor: isSelected ? opt.bg : "#f9fafb",
                }}
              >
                <span className="text-[26px] leading-none">{opt.emoji}</span>
              </div>
              <span
                className="text-[10px] w-14 text-center"
                style={{
                  color: isSelected ? opt.color : "#9ca3af",
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
