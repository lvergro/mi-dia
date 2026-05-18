"use client";
import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { DailyNote, DailyMood, MoodValue } from "@mi-dia/types";
import { MoodCard } from "./MoodCard";
import {
  createNote,
  updateNote,
  deleteNote,
} from "@/lib/db/notes";
import { upsertMood } from "@/lib/db/moods";

type PeriodFilter = "today" | "week" | "all";

const MOOD_OPTIONS = [
  { value: 1 as MoodValue, emoji: "😢", label: "Muy mal",   color: "#ef4444", bg: "#fef2f2" },
  { value: 2 as MoodValue, emoji: "😕", label: "Mal",       color: "#f97316", bg: "#fff7ed" },
  { value: 3 as MoodValue, emoji: "😐", label: "Normal",    color: "#eab308", bg: "#fefce8" },
  { value: 4 as MoodValue, emoji: "🙂", label: "Bien",      color: "#22c55e", bg: "#f0fdf4" },
  { value: 5 as MoodValue, emoji: "😄", label: "Excelente", color: "#3b82f6", bg: "#eff6ff" },
];

function getTodayLocal(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDaysLocal(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function relativeDayLabel(dateStr: string): string {
  const today = getTodayLocal();
  if (dateStr === today) return "Hoy";
  if (dateStr === addDaysLocal(today, -1)) return "Ayer";
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString("es-ES", { month: "short" });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} ${month}`;
}

function formatNoteTime(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function dominantMood(notes: DailyNote[]): MoodValue | null {
  const counts = new Map<MoodValue, number>();
  for (const n of notes) {
    if (n.mood) counts.set(n.mood, (counts.get(n.mood) ?? 0) + 1);
  }
  let best: MoodValue | null = null;
  let bestCount = 0;
  for (const [m, c] of counts) {
    if (c > bestCount) { best = m; bestCount = c; }
  }
  return best;
}

function groupByDate(notes: DailyNote[]): { date: string; items: DailyNote[] }[] {
  const map = new Map<string, DailyNote[]>();
  for (const note of notes) {
    const existing = map.get(note.date) ?? [];
    existing.push(note);
    map.set(note.date, existing);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

function filterByPeriod(notes: DailyNote[], period: PeriodFilter): DailyNote[] {
  if (period === "all") return notes;
  const today = getTodayLocal();
  if (period === "today") return notes.filter((n) => n.date === today);
  const cutoff = addDaysLocal(today, -6);
  return notes.filter((n) => n.date >= cutoff);
}

function NoteRow({
  note,
  onDeleted,
  onUpdated,
}: {
  note: DailyNote;
  onDeleted: (id: string) => void;
  onUpdated: (n: DailyNote) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(note.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const moodOpt = note.mood ? MOOD_OPTIONS.find((o) => o.value === note.mood) : null;

  async function handleSave() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === note.content) { setEditing(false); return; }
    setSaving(true);
    try {
      const updated = await updateNote(note.id, trimmed);
      onUpdated(updated);
      setEditing(false);
    } catch { /* keep editing open */ }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta nota?")) return;
    setDeleting(true);
    try {
      await deleteNote(note.id);
      onDeleted(note.id);
    } catch { setDeleting(false); }
  }

  return (
    <div
      className="flex rounded-2xl border overflow-hidden shadow-subtle mt-2 transition-colors"
      style={{ borderColor: editing ? "#4f46e5" : "#e2e8f0", backgroundColor: "#ffffff" }}
    >
      <div className="w-1 shrink-0" style={{ backgroundColor: moodOpt?.color ?? "#e2e8f0" }} />
      <div className="flex-1 p-4">
        {editing ? (
          <div className="flex flex-col gap-3">
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-indigo-400 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setEditing(false); setEditText(note.content); }}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editText.trim() || editText.trim() === note.content}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400">{formatNoteTime(note.created_at)}</span>
              {moodOpt && (
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: moodOpt.bg, color: moodOpt.color }}
                >
                  {moodOpt.emoji} {moodOpt.label}
                </span>
              )}
              <div className="flex-1" />
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Pencil className="size-3.5" strokeWidth={1.8} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
              >
                <Trash2 className="size-3.5" strokeWidth={1.8} />
              </button>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{note.content}</p>
          </>
        )}
      </div>
    </div>
  );
}

interface Props {
  initialNotes: DailyNote[];
  initialMood: DailyMood | null;
}

export function NotesView({ initialNotes, initialMood }: Props) {
  const today = getTodayLocal();
  const [notes, setNotes] = useState<DailyNote[]>(initialNotes);
  const [mood, setMoodLocal] = useState<MoodValue | null>(initialMood?.mood ?? null);
  const [moodSaving, setMoodSaving] = useState(false);
  const [text, setText] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("week");
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  function handleMoodChange(v: MoodValue) {
    setMoodLocal(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setMoodSaving(true);
    debounceRef.current = setTimeout(async () => {
      try { await upsertMood({ date: today, mood: v, note: null }); }
      finally { setMoodSaving(false); }
    }, 500);
  }

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      const note = await createNote({ content: trimmed, date: today, mood });
      setNotes((prev) => [note, ...prev]);
      setText("");
    } catch { /* stay */ }
    finally { setAdding(false); }
  }

  function toggleCollapse(date: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date); else next.add(date);
      return next;
    });
  }

  const groups = useMemo(() => {
    const filtered = filterByPeriod(notes, period);
    return groupByDate(filtered);
  }, [notes, period]);

  const TABS: { key: PeriodFilter; label: string }[] = [
    { key: "today", label: "Hoy" },
    { key: "week", label: "7 días" },
    { key: "all", label: "Todas" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Mood card */}
      <MoodCard mood={mood} onMoodChange={handleMoodChange} isSaving={moodSaving} />

      {/* New note input */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-bold text-slate-900">Nueva nota</span>
          <button
            onClick={handleAdd}
            disabled={adding || !text.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {adding && <Loader2 className="size-3.5 animate-spin" />}
            Guardar
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="¿Qué tienes en mente hoy?"
          rows={3}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd(); }}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
        />
        <p className="mt-1.5 text-[11px] text-slate-400">⌘+Enter para guardar</p>
      </div>

      {/* Period filter / Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1">
        {TABS.map((tab) => {
          const active = period === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`flex-1 rounded-xl py-2 text-[13px] font-medium transition-colors ${
                active ? "bg-white text-slate-900 shadow-subtle font-semibold" : "text-slate-500"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notes list */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="text-4xl">📝</span>
          <p className="text-sm text-slate-400">
            {period === "today" ? "No hay notas hoy" : period === "week" ? "No hay notas en los últimos 7 días" : "Tus notas aparecerán aquí"}
          </p>
        </div>
      ) : (
        groups.map(({ date, items }) => {
          const isCollapsed = collapsedDates.has(date);
          const domMood = dominantMood(items);
          const moodOpt = domMood ? MOOD_OPTIONS.find((o) => o.value === domMood) : null;
          return (
            <div key={date}>
              <button
                onClick={() => toggleCollapse(date)}
                className="w-full flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3.5 shadow-subtle hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[15px] font-bold text-slate-900">{relativeDayLabel(date)}</span>
                  {moodOpt && <span className="text-base">{moodOpt.emoji}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-slate-400">{items.length} {items.length === 1 ? "nota" : "notas"}</span>
                  {isCollapsed ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronUp className="size-4 text-slate-400" />}
                </div>
              </button>
              {!isCollapsed && items.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  onDeleted={(id) => setNotes((prev) => prev.filter((n) => n.id !== id))}
                  onUpdated={(updated) => setNotes((prev) => prev.map((n) => n.id === updated.id ? updated : n))}
                />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
