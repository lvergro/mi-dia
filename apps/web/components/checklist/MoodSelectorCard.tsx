"use client";
import { useState, useRef, useEffect } from "react";
import type { MoodValue } from "@mi-dia/types";
import { upsertMood } from "@/lib/db/moods";

const MOODS = [
  { value: 1 as MoodValue, emoji: "😢", label: "Muy mal",   color: "#ef4444", bg: "#fef2f2" },
  { value: 2 as MoodValue, emoji: "😕", label: "Mal",       color: "#f97316", bg: "#fff7ed" },
  { value: 3 as MoodValue, emoji: "😐", label: "Normal",    color: "#eab308", bg: "#fefce8" },
  { value: 4 as MoodValue, emoji: "🙂", label: "Bien",      color: "#22c55e", bg: "#f0fdf4" },
  { value: 5 as MoodValue, emoji: "😄", label: "Excelente", color: "#3b82f6", bg: "#eff6ff" },
];

function getTodayLocal() {
  const d = new Date();
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

interface Props {
  initialMood: MoodValue | null;
}

export function MoodSelectorCard({ initialMood }: Props) {
  const [mood, setMood] = useState<MoodValue | null>(initialMood);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  function handleMood(v: MoodValue) {
    setMood(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaving(true);
    debounceRef.current = setTimeout(async () => {
      try { await upsertMood({ date: getTodayLocal(), mood: v, note: null }); }
      finally { setSaving(false); }
    }, 500);
  }

  const selected = MOODS.find(m => m.value === mood);

  return (
    <div
      className="rounded-2xl border-2 p-4 transition-all duration-300"
      style={{
        borderColor: selected?.color ?? "#e2e8f0",
        backgroundColor: selected?.bg ?? "#ffffff",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700">¿Cómo te sientes hoy?</span>
        {saving && <span className="text-[11px] text-slate-400">Guardando…</span>}
      </div>
      <div className="flex justify-between gap-1">
        {MOODS.map(opt => {
          const isSelected = mood === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleMood(opt.value)}
              className="flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
            >
              <div
                className="flex size-12 items-center justify-center rounded-full border-2 transition-all"
                style={{
                  borderColor: isSelected ? opt.color : "#e2e8f0",
                  backgroundColor: isSelected ? opt.bg : "#f8fafc",
                }}
              >
                <span className="text-[24px] leading-none">{opt.emoji}</span>
              </div>
              <span
                className="text-[10px] w-12 text-center font-medium"
                style={{ color: isSelected ? opt.color : "#94a3b8" }}
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
