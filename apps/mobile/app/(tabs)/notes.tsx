import { ActivityIndicator, FlatList, RefreshControl, SectionList, Text, View } from "react-native";
import { useAllNotes } from "../../hooks/useNotes";
import type { DailyNote } from "@mi-dia/types";

function formatSectionDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatNoteTime(isoString: string): string {
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function groupByDate(notes: DailyNote[]): { title: string; data: DailyNote[] }[] {
  const map = new Map<string, DailyNote[]>();
  for (const note of notes) {
    const existing = map.get(note.date) ?? [];
    existing.push(note);
    map.set(note.date, existing);
  }
  return Array.from(map.entries()).map(([date, data]) => ({
    title: date,
    data,
  }));
}

export default function NotesScreen() {
  const { data: notes = [], isLoading, isError, refetch, isFetching } = useAllNotes();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-gray-400 text-sm mt-3">Cargando notas…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">Error al cargar las notas.</Text>
      </View>
    );
  }

  const sections = groupByDate(notes);

  if (sections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-5xl mb-4">📝</Text>
        <Text className="text-gray-400 text-center">Aún no tienes notas.</Text>
        <Text className="text-gray-400 text-sm text-center mt-2">
          Agrega notas desde la pantalla Mi Día.
        </Text>
      </View>
    );
  }

  return (
    <SectionList
      className="flex-1 bg-white"
      sections={sections}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor="#4f46e5" />
      }
      contentContainerStyle={{ paddingBottom: 32 }}
      renderSectionHeader={({ section }) => (
        <View style={{ backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#4f46e5", textTransform: "capitalize" }}>
            {formatSectionDate(section.title)}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={{ marginHorizontal: 16, marginTop: 10, padding: 14, backgroundColor: "#f9fafb", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}>
          <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>
            {formatNoteTime(item.created_at)}
          </Text>
          <Text style={{ fontSize: 14, color: "#1f2937", lineHeight: 20 }}>
            {item.content}
          </Text>
        </View>
      )}
    />
  );
}
