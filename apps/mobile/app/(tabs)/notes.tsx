import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react-native";
import { useAllNotes, useNotesForDate, useCreateNote, useDeleteNote, useUpdateNote } from "../../hooks/useNotes";
import { useMood } from "../../hooks/useMood";
import { MoodCard } from "../../components/mood/MoodCard";
import { colors, radii, shadows, spacing } from "../../theme";
import type { DailyNote, MoodValue } from "@mi-dia/types";

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

type PeriodFilter = "today" | "week" | "all";

function filterNotesByPeriod(notes: DailyNote[], period: PeriodFilter): DailyNote[] {
  if (period === "all") return notes;
  const today = getTodayLocal();
  if (period === "today") return notes.filter((n) => n.date === today);
  // week = last 7 days including today
  const cutoff = addDaysLocal(today, -6);
  return notes.filter((n) => n.date >= cutoff);
}

function formatNoteTime(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

const MOOD_OPTIONS: { value: MoodValue; emoji: string; label: string; color: string; bg: string }[] = [
  { value: 1, emoji: "😢", label: "Muy mal",   color: colors.mood1, bg: colors.dangerSubtle },
  { value: 2, emoji: "😕", label: "Mal",       color: colors.mood2, bg: colors.warningSubtle },
  { value: 3, emoji: "😐", label: "Normal",    color: colors.mood3, bg: "#fefce8" },
  { value: 4, emoji: "🙂", label: "Bien",      color: colors.mood4, bg: colors.successSubtle },
  { value: 5, emoji: "😄", label: "Excelente", color: colors.mood5, bg: colors.infoSubtle },
];

function formatMoodNote(m: MoodValue): string {
  const opt = MOOD_OPTIONS.find((o) => o.value === m);
  return `Estado de ánimo: ${opt?.emoji ?? ""} ${opt?.label ?? ""}`.trim();
}

function groupByDate(notes: DailyNote[]): { title: string; data: DailyNote[] }[] {
  const map = new Map<string, DailyNote[]>();
  for (const note of notes) {
    const existing = map.get(note.date) ?? [];
    existing.push(note);
    map.set(note.date, existing);
  }
  return Array.from(map.entries()).map(([date, data]) => ({ title: date, data }));
}

function MiniMoodPicker({
  selected,
  onSelect,
}: {
  selected: MoodValue | null;
  onSelect: (v: MoodValue | null) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
      {MOOD_OPTIONS.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(isSelected ? null : opt.value)}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: 19,
              borderWidth: isSelected ? 2.5 : 1,
              borderColor: isSelected ? opt.color : colors.cardBorder,
              backgroundColor: isSelected ? opt.bg : colors.gray50,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text style={{ fontSize: 20 }}>{opt.emoji}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NoteRow({ note, onDelete }: { note: DailyNote; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(note.content);
  const updateNote = useUpdateNote(note.date);
  const moodOpt = note.mood ? MOOD_OPTIONS.find((o) => o.value === note.mood) : null;
  const stripeColor = moodOpt?.color ?? colors.gray200;

  function startEdit() {
    setEditText(note.content);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditText(note.content);
  }

  function saveEdit() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === note.content) {
      setEditing(false);
      return;
    }
    updateNote.mutate(
      { id: note.id, content: trimmed },
      {
        onSuccess: () => setEditing(false),
        onError: () => Alert.alert("Error", "No se pudo guardar la nota."),
      },
    );
  }

  return (
    <View
      style={{
        marginHorizontal: 0,
        marginTop: spacing.sm,
        flexDirection: "row",
        backgroundColor: colors.white,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: editing ? colors.primary : colors.cardBorder,
        overflow: "hidden",
        ...shadows.subtle,
      }}
    >
      <View style={{ width: 4, backgroundColor: stripeColor }} />

      <View style={{ flex: 1, padding: spacing.md }}>
        {editing ? (
          <>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
              style={{
                fontSize: 14,
                color: colors.textPrimary,
                lineHeight: 20,
                minHeight: 60,
                maxHeight: 120,
                textAlignVertical: "top",
                borderWidth: 1,
                borderColor: colors.primary,
                borderRadius: radii.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: 6,
                marginBottom: spacing.sm,
              }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
              <TouchableOpacity
                onPress={cancelEdit}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: 6,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: "600" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEdit}
                disabled={updateNote.isPending || !editText.trim() || editText.trim() === note.content}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: 6,
                  borderRadius: radii.md,
                  backgroundColor: colors.primary,
                  opacity: (updateNote.isPending || !editText.trim() || editText.trim() === note.content) ? 0.6 : 1,
                }}
              >
                <Text style={{ fontSize: 13, color: colors.white, fontWeight: "600" }}>
                  {updateNote.isPending ? "Guardando…" : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 8 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600" }}>
                {formatNoteTime(note.created_at)}
              </Text>
              {moodOpt && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.full, backgroundColor: moodOpt.bg }}>
                  <Text style={{ fontSize: 12 }}>{moodOpt.emoji}</Text>
                  <Text style={{ fontSize: 10, color: moodOpt.color, fontWeight: "600" }}>{moodOpt.label}</Text>
                </View>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={startEdit} hitSlop={8} activeOpacity={0.7}>
                <Pencil size={14} color={colors.textMuted} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
            <Pressable onLongPress={onDelete}>
              <Text style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 20 }}>{note.content}</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}


export default function NotesScreen() {
  const today = getTodayLocal();
  const { mood, setMood, isSaving: isMoodSaving } = useMood(today);
  const { refetch: refetchToday } = useNotesForDate(today);
  const { data: allNotes = [], isLoading, isError, refetch: refetchAll, isFetching } = useAllNotes();
  const createNote = useCreateNote(today);
  const deleteNoteM = useDeleteNote(today);

  const [text, setText] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("week");
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  function toggleCollapse(date: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date); else next.add(date);
      return next;
    });
  }

  function handleMoodChange(m: MoodValue) {
    if (m === mood) return; // evitar crear nota duplicada si tap el mismo mood
    setMood(m);
    createNote.mutate({ content: formatMoodNote(m), mood: m });
  }

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    createNote.mutate(
      { content: trimmed, mood: mood ?? null },
      { onSuccess: () => { setText(""); } },
    );
  }

  function handleDelete(note: DailyNote) {
    Alert.alert("Eliminar nota", "¿Eliminar esta nota?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteNoteM.mutate(note.id) },
    ]);
  }

  function handleRefresh() {
    void refetchAll();
    void refetchToday();
  }

  const { sections, sectionStats } = useMemo(() => {
    const filtered = filterNotesByPeriod(allNotes, period);
    const grouped = groupByDate(filtered);
    const stats = new Map<string, { count: number; mood: MoodValue | null }>();
    for (const s of grouped) {
      stats.set(s.title, { count: s.data.length, mood: dominantMood(s.data) });
    }
    // Si la sección está colapsada, ocultar items pero mantener el header
    const displaySections = grouped.map((s) => ({
      ...s,
      data: collapsedDates.has(s.title) ? [] : s.data,
    }));
    return { sections: displaySections, sectionStats: stats };
  }, [allNotes, period, collapsedDates]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.danger }}>Error al cargar las notas.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Input card FIJO arriba — fuera del SectionList → no afectado por auto-scroll del keyboard */}
      <View style={{
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: spacing.md,
        ...shadows.card,
      }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.md,
        }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>
            Nueva nota
          </Text>
          <TouchableOpacity
            onPress={handleAdd}
            disabled={createNote.isPending || !text.trim()}
            activeOpacity={0.7}
            style={{
              backgroundColor: colors.primary,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              paddingVertical: 8,
              alignItems: "center",
              justifyContent: "center",
              opacity: createNote.isPending || !text.trim() ? 0.6 : 1,
            }}
          >
            <Text style={{ color: colors.white, fontWeight: "600", fontSize: 14 }}>
              {createNote.isPending ? "Guardando…" : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>

        <MiniMoodPicker selected={mood ?? null} onSelect={(v) => v && handleMoodChange(v)} />

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="¿Qué tienes en mente hoy?"
          placeholderTextColor={colors.textMuted}
          multiline
          style={{
            borderWidth: 1,
            borderColor: text ? colors.primary : colors.cardBorder,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 10,
            fontSize: 14,
            color: colors.textPrimary,
            minHeight: 80,
            maxHeight: 120,
            textAlignVertical: "top",
            backgroundColor: colors.white,
          }}
        />
      </View>

      {/* Filter chips: Hoy / Últimos 7 días / Todas */}
      <View style={{
        flexDirection: "row",
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
        backgroundColor: colors.gray100,
        borderRadius: radii.lg,
        padding: 3,
      }}>
        {([
          { key: "today", label: "Hoy" },
          { key: "week", label: "7 días" },
          { key: "all", label: "Todas" },
        ] as const).map((tab) => {
          const active = period === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setPeriod(tab.key)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: radii.md,
                backgroundColor: active ? colors.white : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: active ? "600" : "400",
                color: active ? colors.textPrimary : colors.textMuted,
              }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionList
        style={{ flex: 1 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ backgroundColor: colors.surface }}>
            <MoodCard mood={mood} onMoodChange={handleMoodChange} isSaving={isMoodSaving} />

            {sections.length === 0 && (
              <View style={{ alignItems: "center", paddingTop: 32, paddingHorizontal: 32 }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📝</Text>
                <Text style={{ fontSize: 15, color: colors.textMuted, textAlign: "center" }}>
                  {period === "today" ? "No hay notas hoy" : period === "week" ? "No hay notas en los últimos 7 días" : "Tus notas aparecerán aquí"}
                </Text>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => {
          const stats = sectionStats.get(section.title);
          const isCollapsed = collapsedDates.has(section.title);
          const moodOpt = stats?.mood ? MOOD_OPTIONS.find((o) => o.value === stats.mood) : null;
          return (
            <View style={{ backgroundColor: colors.surface, paddingVertical: 10 }}>
              <TouchableOpacity
                onPress={() => toggleCollapse(section.title)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: colors.white,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  ...shadows.subtle,
                }}
              >
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>
                    {relativeDayLabel(section.title)}
                  </Text>
                  {moodOpt && <Text style={{ fontSize: 16 }}>{moodOpt.emoji}</Text>}
                </View>
                
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    {stats?.count ?? 0} {stats?.count === 1 ? "nota" : "notas"}
                  </Text>
                  {isCollapsed
                    ? <ChevronDown size={18} color={colors.textMuted} />
                    : <ChevronUp size={18} color={colors.textMuted} />
                  }
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        renderItem={({ item }) => (
          <NoteRow note={item} onDelete={() => handleDelete(item)} />
        )}
      />
    </View>
  );
}
