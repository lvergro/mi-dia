import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAllNotes, useNotesForDate, useCreateNote, useDeleteNote } from "../../hooks/useNotes";
import { useMood } from "../../hooks/useMood";
import { MoodCard } from "../../components/mood/MoodCard";
import type { DailyNote, MoodValue } from "@mi-dia/types";

function getTodayLocal(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatSectionDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatNoteTime(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

const MOOD_OPTIONS: { value: MoodValue; emoji: string; color: string }[] = [
  { value: 1, emoji: "😢", color: "#ef4444" },
  { value: 2, emoji: "😕", color: "#f97316" },
  { value: 3, emoji: "😐", color: "#eab308" },
  { value: 4, emoji: "🙂", color: "#22c55e" },
  { value: 5, emoji: "😄", color: "#3b82f6" },
];

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
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
      {MOOD_OPTIONS.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(isSelected ? null : opt.value)}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: isSelected ? 2.5 : 1,
              borderColor: isSelected ? opt.color : "#e5e7eb",
              backgroundColor: isSelected ? `${opt.color}18` : "#f9fafb",
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
  const moodOpt = note.mood ? MOOD_OPTIONS.find((o) => o.value === note.mood) : null;
  return (
    <Pressable
      onLongPress={onDelete}
      style={{
        marginHorizontal: 16,
        marginTop: 8,
        padding: 14,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 6 }}>
        <Text style={{ fontSize: 11, color: "#9ca3af" }}>{formatNoteTime(note.created_at)}</Text>
        {moodOpt && <Text style={{ fontSize: 16 }}>{moodOpt.emoji}</Text>}
      </View>
      <Text style={{ fontSize: 14, color: "#1f2937", lineHeight: 20 }}>{note.content}</Text>
    </Pressable>
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
  const [noteMood, setNoteMood] = useState<MoodValue | null>(null);

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    createNote.mutate(
      { content: trimmed, mood: noteMood },
      { onSuccess: () => { setText(""); setNoteMood(null); } },
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

  const sections = groupByDate(allNotes);

  const header = (
    <View style={{ backgroundColor: "#f8fafc" }}>
      <MoodCard mood={mood} onMoodChange={setMood} isSaving={isMoodSaving} />

      <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 10 }}>
          Nueva nota
        </Text>
        <MiniMoodPicker selected={noteMood} onSelect={setNoteMood} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escribe una nota…"
            placeholderTextColor="#9ca3af"
            multiline
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 13,
              color: "#111827",
              minHeight: 60,
              textAlignVertical: "top",
              backgroundColor: "#ffffff",
            }}
          />
          <Pressable
            onPress={handleAdd}
            disabled={createNote.isPending || !text.trim()}
            style={({ pressed }) => ({
              backgroundColor: text.trim() ? "#4f46e5" : "#e5e7eb",
              borderRadius: 12,
              paddingHorizontal: 14,
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: text.trim() ? "#ffffff" : "#9ca3af", fontWeight: "600", fontSize: 13 }}>
              + Agregar
            </Text>
          </Pressable>
        </View>
      </View>

      {sections.length === 0 && !isLoading && (
        <View style={{ alignItems: "center", paddingTop: 32, paddingBottom: 20 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📝</Text>
          <Text style={{ color: "#9ca3af", textAlign: "center" }}>Aún no tienes notas.</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#ef4444" }}>Error al cargar las notas.</Text>
      </View>
    );
  }

  return (
    <SectionList
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      sections={sections}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isFetching && !isLoading} onRefresh={handleRefresh} tintColor="#4f46e5" />
      }
      contentContainerStyle={{ paddingBottom: 40 }}
      ListHeaderComponent={header}
      renderSectionHeader={({ section }) => (
        <View style={{ backgroundColor: "#f0f4ff", paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginTop: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#4f46e5", textTransform: "capitalize" }}>
            {formatSectionDate(section.title)}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <NoteRow note={item} onDelete={() => handleDelete(item)} />
      )}
    />
  );
}
