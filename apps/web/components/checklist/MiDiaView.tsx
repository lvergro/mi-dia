"use client";
import { useState } from "react";
import type { GroupedChecklist, ItemWithStatus } from "@mi-dia/core";
import type { DailyNote, DailyMood, MoodValue } from "@mi-dia/types";
import { TimeBlock } from "./TimeBlock";
import { MoodSelectorCard } from "./MoodSelectorCard";
import { NextDoseCard } from "./NextDoseCard";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { createNote, deleteNote } from "@/lib/db/notes";

const BLOCKS: Array<keyof GroupedChecklist> = ["mañana", "tarde", "noche"];

const MOOD_OPTIONS = [
  { value: 1 as MoodValue, emoji: "😢", label: "Muy mal",   color: "#ef4444", bg: "#fef2f2" },
  { value: 2 as MoodValue, emoji: "😕", label: "Mal",       color: "#f97316", bg: "#fff7ed" },
  { value: 3 as MoodValue, emoji: "😐", label: "Normal",    color: "#eab308", bg: "#fefce8" },
  { value: 4 as MoodValue, emoji: "🙂", label: "Bien",      color: "#22c55e", bg: "#f0fdf4" },
  { value: 5 as MoodValue, emoji: "😄", label: "Excelente", color: "#3b82f6", bg: "#eff6ff" },
];

function getNextPending(checklist: GroupedChecklist): ItemWithStatus | null {
  const allItems = [...checklist["mañana"], ...checklist["tarde"], ...checklist["noche"]];
  const pending = allItems
    .filter(i => i.status === "pending")
    .sort((a, b) => a.specific_time.localeCompare(b.specific_time));
  if (pending.length === 0) return null;
  const now = new Date();
  const nowStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:00`;
  return pending.find(i => i.specific_time >= nowStr) ?? pending[pending.length - 1];
}

function formatNoteTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}

function getTodayLocal() {
  const d = new Date();
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

interface Props {
  checklist: GroupedChecklist;
  date: string;
  initialMood: DailyMood | null;
  initialNotes: DailyNote[];
  done: number;
  total: number;
}

export function MiDiaView({ checklist, date, initialMood, initialNotes, done, total }: Props) {
  const hasItems = BLOCKS.some(b => checklist[b].length > 0);
  const [notes, setNotes] = useState<DailyNote[]>(initialNotes);
  const [newText, setNewText] = useState("");
  const [noteMood, setNoteMood] = useState<MoodValue | null>(initialMood?.mood ?? null);
  const [adding, setAdding] = useState(false);

  const nextPending = getNextPending(checklist);

  async function handleAddNote() {
    const trimmed = newText.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      const note = await createNote({ content: trimmed, date: getTodayLocal(), mood: noteMood });
      setNotes(prev => [note, ...prev]);
      setNewText("");
    } catch { /* stay */ }
    finally { setAdding(false); }
  }

  async function handleDeleteNote(id: string) {
    if (!confirm("¿Eliminar esta nota?")) return;
    await deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  const recentNotes = notes.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Columna izquierda */}
      <div className="flex flex-col gap-4">
        {/* Mood selector */}
        <MoodSelectorCard initialMood={initialMood?.mood ?? null} />

        {/* Checklist card */}
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Tus tomas de hoy</h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {done} de {total} completados
            </span>
          </div>
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <span className="text-4xl">✅</span>
              <p className="font-semibold text-slate-700">No hay ítems para hoy</p>
              <p className="text-sm text-slate-400">Agrega medicamentos en la sección Rutina</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {BLOCKS.map(block => (
                <TimeBlock key={block} block={block} items={checklist[block]} date={date} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Columna derecha */}
      <div className="flex flex-col gap-4">
        {/* Próxima toma */}
        <NextDoseCard item={nextPending} />

        {/* Nueva nota */}
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-subtle">
          <h3 className="font-bold text-slate-900 mb-3 text-sm">Nueva nota</h3>
          {/* Mini mood selector */}
          <div className="flex gap-1.5 mb-3">
            {MOOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setNoteMood(noteMood === opt.value ? null : opt.value)}
                className="flex-1 flex flex-col items-center gap-0.5 transition-transform hover:scale-105"
              >
                <div
                  className="size-8 flex items-center justify-center rounded-full border-2 text-lg transition-all"
                  style={{
                    borderColor: noteMood === opt.value ? opt.color : "#e2e8f0",
                    backgroundColor: noteMood === opt.value ? opt.bg : "#f8fafc",
                  }}
                >
                  {opt.emoji}
                </div>
              </button>
            ))}
          </div>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="¿Cómo fue tu día?"
            rows={3}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote(); }}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
          />
          <button
            onClick={handleAddNote}
            disabled={adding || !newText.trim()}
            className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {adding && <Loader2 className="size-3.5 animate-spin" />}
            Guardar nota
          </button>
        </div>

        {/* Notas recientes */}
        {recentNotes.length > 0 && (
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-subtle">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">Notas recientes</h3>
            <div className="flex flex-col gap-2">
              {recentNotes.map(note => {
                const moodOpt = note.mood ? MOOD_OPTIONS.find(o => o.value === note.mood) : null;
                return (
                  <div
                    key={note.id}
                    className="flex overflow-hidden rounded-xl border border-slate-200"
                  >
                    <div className="w-1 shrink-0" style={{ backgroundColor: moodOpt?.color ?? "#e2e8f0" }} />
                    <div className="flex-1 px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] text-slate-400 font-medium">{formatNoteTime(note.created_at)}</span>
                        {moodOpt && (
                          <span
                            className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                            style={{ backgroundColor: moodOpt.bg, color: moodOpt.color }}
                          >
                            {moodOpt.emoji} {moodOpt.label}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="ml-auto rounded p-1 text-slate-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="size-3" strokeWidth={2} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2">{note.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
