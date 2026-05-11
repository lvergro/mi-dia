import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  TextInput,
  View,
} from "react-native";
import { Send } from "lucide-react-native";
import { useAllNotes, useNotesForDate, useCreateNote, useDeleteNote } from "../../hooks/useNotes";
import { useMood } from "../../hooks/useMood";
import { MoodCard } from "../../components/mood/MoodCard";
import { colors, radii, shadows, spacing } from "../../theme";
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

const MOOD_OPTIONS: { value: MoodValue; emoji: string; color: string; bg: string }[] = [
  { value: 1, emoji: "😢", color: colors.mood1, bg: colors.dangerSubtle },
  { value: 2, emoji: "😕", color: colors.mood2, bg: colors.warningSubtle },
  { value: 3, emoji: "😐", color: colors.mood3, bg: "#fefce8" },
  { value: 4, emoji: "🙂", color: colors.mood4, bg: colors.successSubtle },
  { value: 5, emoji: "😄", color: colors.mood5, bg: colors.infoSubtle },
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
  const moodOpt = note.mood ? MOOD_OPTIONS.find((o) => o.value === note.mood) : null;
  return (
    <Pressable
      onLongPress={onDelete}
      style={({ pressed }) => ({
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        padding: spacing.md,
        backgroundColor: moodOpt ? moodOpt.bg : colors.white,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: moodOpt ? `${moodOpt.color}30` : colors.cardBorder,
        opacity: pressed ? 0.85 : 1,
        ...shadows.subtle,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 6 }}>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>{formatNoteTime(note.created_at)}</Text>
        {moodOpt && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Text style={{ fontSize: 14 }}>{moodOpt.emoji}</Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 20 }}>{note.content}</Text>
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.surface }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <SectionList
        style={{ flex: 1 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        ListHeaderComponent={
          <View style={{ backgroundColor: colors.surface }}>
            <MoodCard mood={mood} onMoodChange={setMood} isSaving={isMoodSaving} />
            {sections.length === 0 && (
              <View style={{ alignItems: "center", paddingTop: 48, paddingBottom: 20, paddingHorizontal: 32 }}>
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySubtle, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Text style={{ fontSize: 32 }}>📝</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 8 }}>
                  Empieza a escribir
                </Text>
                <Text style={{ color: colors.textMuted, textAlign: "center", fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                  Registra cómo te sentiste hoy. Tus notas te ayudarán a reconocer patrones con el tiempo.
                </Text>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={{ backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, marginTop: spacing.sm }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary, textTransform: "capitalize" }}>
              {formatSectionDate(section.title)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <NoteRow note={item} onDelete={() => handleDelete(item)} />
        )}
      />

      <View style={{
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
        backgroundColor: colors.white,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: Platform.OS === "ios" ? 24 : spacing.md,
        ...shadows.subtle,
      }}>
        <MiniMoodPicker selected={noteMood} onSelect={setNoteMood} />
        <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "flex-end" }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="¿Qué tienes en mente hoy?"
            placeholderTextColor={colors.textMuted}
            multiline
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: text ? colors.primary : colors.cardBorder,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              paddingVertical: 10,
              fontSize: 14,
              color: colors.textPrimary,
              maxHeight: 100,
              textAlignVertical: "top",
              backgroundColor: colors.white,
            }}
          />
          <Pressable
            onPress={handleAdd}
            disabled={createNote.isPending || !text.trim()}
            style={({ pressed }) => ({
              backgroundColor: text.trim() ? colors.primary : colors.gray200,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              paddingVertical: 11,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Send size={14} color={text.trim() ? colors.white : colors.textMuted} strokeWidth={2} />
            <Text style={{ color: text.trim() ? colors.white : colors.textMuted, fontWeight: "700", fontSize: 13 }}>
              Guardar
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
