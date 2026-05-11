import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useChecklist } from "../../hooks/useChecklist";
import { useCreateLog, useDeleteLog } from "../../hooks/useLogMutations";
import { useMood } from "../../hooks/useMood";
import { useNotesForDate, useCreateNote, useDeleteNote } from "../../hooks/useNotes";
import { MoodCard } from "../../components/mood/MoodCard";
import type { ItemWithStatus, ItemBlock } from "@mi-dia/core";
import type { DailyNote } from "@mi-dia/types";

const BLOCK_ORDER: ItemBlock[] = ["mañana", "tarde", "noche"];
const BLOCK_LABEL: Record<ItemBlock, string> = {
  mañana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
};

function getTodayLocal(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
}

function formatTime(specificTime: string): string {
  return specificTime.slice(0, 5);
}

function formatNoteTime(isoString: string): string {
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

interface ChecklistItemCardProps {
  item: ItemWithStatus;
  onTap: (item: ItemWithStatus) => void;
  isPending: boolean;
}

function ChecklistItemCard({ item, onTap, isPending }: ChecklistItemCardProps) {
  const isDone = item.status === "done";
  const isOmitted = item.status === "omitted";

  const cardBg = isDone
    ? "bg-green-50 border-green-200"
    : isOmitted
      ? "bg-gray-100 border-gray-200"
      : "bg-white border-gray-100";

  const textColor = isOmitted ? "text-gray-400" : "text-gray-900";
  const subTextColor = isOmitted ? "text-gray-400" : "text-gray-500";

  const recurrenceLabel =
    item.recurrence_type === "daily"
      ? "Diaria"
      : (item.recurrence_days ?? [])
          .map((d) => ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][d])
          .join(", ");

  return (
    <Pressable onPress={() => onTap(item)} disabled={isPending}>
      <View className={`flex-row items-center py-3 px-3 mb-2 rounded-xl border ${cardBg}`}>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-0.5">
            <Text className={`font-semibold text-sm ${textColor} ${isDone ? "line-through" : ""}`}>
              {item.name}
            </Text>
            <View className={`rounded px-1.5 py-0.5 ${item.type === "medication" ? "bg-blue-100" : "bg-purple-100"}`}>
              <Text className={`text-xs font-medium ${item.type === "medication" ? "text-blue-700" : "text-purple-700"}`}>
                {item.type === "medication" ? "Med." : "Act."}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className={`text-xs ${subTextColor}`}>{formatTime(item.specific_time)}</Text>
            {item.dose !== null && (
              <Text className={`text-xs ${subTextColor}`}>{item.dose}</Text>
            )}
            <View className="bg-gray-100 rounded px-1.5 py-0.5">
              <Text className="text-xs text-gray-500">{recurrenceLabel}</Text>
            </View>
          </View>
        </View>
        <View className="ml-3 items-center justify-center w-7 h-7">
          {isPending ? (
            <ActivityIndicator size="small" color="#4f46e5" />
          ) : isDone ? (
            <Text className="text-green-600 text-lg font-bold">✓</Text>
          ) : isOmitted ? (
            <Text className="text-gray-400 text-lg">–</Text>
          ) : (
            <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
          )}
        </View>
      </View>
    </Pressable>
  );
}

interface DayNotesSectionProps {
  date: string;
  readonly: boolean;
}

function DayNotesSection({ date, readonly }: DayNotesSectionProps) {
  const { data: notes = [] } = useNotesForDate(date);
  const createNote = useCreateNote(date);
  const deleteNoteM = useDeleteNote(date);
  const [text, setText] = useState("");

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    createNote.mutate(trimmed, { onSuccess: () => setText("") });
  }

  function handleDelete(note: DailyNote) {
    Alert.alert("Eliminar nota", "¿Eliminar esta nota?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteNoteM.mutate(note.id) },
    ]);
  }

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 10 }}>
        Notas del día
      </Text>

      {!readonly && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
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
      )}

      {notes.length === 0 && (
        <Text style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
          {readonly ? "Sin notas para este día" : "Aún no hay notas para hoy"}
        </Text>
      )}

      {notes.map((note) => (
        <Pressable
          key={note.id}
          onLongPress={() => { if (!readonly) handleDelete(note); }}
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 12,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
            {formatNoteTime(note.created_at)}
          </Text>
          <Text style={{ fontSize: 13, color: "#374151" }}>{note.content}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function MiDiaScreen() {
  const router = useRouter();
  const todayStr = getTodayLocal();
  const [viewDate, setViewDate] = useState<string>(todayStr);
  const isToday = viewDate === todayStr;

  const { data: checklist, isLoading, error, refetch, isFetching } = useChecklist(viewDate);

  const createLog = useCreateLog(viewDate);
  const deleteLog = useDeleteLog(viewDate);

  const { mood, setMood, isSaving: isMoodSaving } = useMood(viewDate);

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [pendingOmitItem, setPendingOmitItem] = useState<ItemWithStatus | null>(null);

  const displayDate = formatDisplayDate(viewDate);

  const totalItems = BLOCK_ORDER.reduce(
    (sum, block) => sum + checklist[block].length,
    0,
  );

  function handleItemTap(item: ItemWithStatus): void {
    if (!isToday) return;
    if (item.status === "pending") {
      Alert.alert(
        item.name,
        "¿Qué deseas registrar?",
        [
          {
            text: "Hecho",
            onPress: () => {
              createLog.mutate(
                {
                  item_id: item.id,
                  date: viewDate,
                  status: "done",
                  completed_at: new Date().toISOString(),
                  note: null,
                },
                {
                  onError: () =>
                    Alert.alert("Error", "No se pudo guardar el cambio."),
                },
              );
            },
          },
          {
            text: "Omitido",
            onPress: () => {
              setPendingOmitItem(item);
              setNoteText("");
              setNoteModalVisible(true);
            },
          },
          { text: "Cancelar", style: "cancel" },
        ],
      );
    } else {
      Alert.alert(
        "Revertir",
        "¿Volver a marcar como pendiente?",
        [
          {
            text: "Sí",
            onPress: () => {
              if (item.log) {
                deleteLog.mutate(item.log.id, {
                  onError: () =>
                    Alert.alert("Error", "No se pudo revertir el cambio."),
                });
              }
            },
          },
          { text: "No", style: "cancel" },
        ],
      );
    }
  }

  function handleConfirmOmit(): void {
    if (!pendingOmitItem) return;
    createLog.mutate(
      {
        item_id: pendingOmitItem.id,
        date: viewDate,
        status: "omitted",
        completed_at: new Date().toISOString(),
        note: noteText.trim() || null,
      },
      {
        onError: () => Alert.alert("Error", "No se pudo guardar el cambio."),
        onSettled: () => {
          setNoteModalVisible(false);
          setPendingOmitItem(null);
          setNoteText("");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-6">
        <Text className="text-red-500 text-center">No se pudieron cargar los ítems del día.</Text>
      </View>
    );
  }

  const dateNavBar = (
    <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
      <Pressable
        onPress={() => setViewDate(addDays(viewDate, -1))}
        className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
        hitSlop={8}
      >
        <Text className="text-gray-700 text-lg">‹</Text>
      </Pressable>
      <View className="flex-1 items-center">
        <Text className="text-2xl font-bold text-gray-900">Mi Día</Text>
        <Text className="text-xs text-muted capitalize mt-0.5">{displayDate}</Text>
        {!isToday && (
          <Pressable onPress={() => setViewDate(todayStr)} hitSlop={6}>
            <Text className="text-xs text-primary mt-1 font-medium">Volver a hoy</Text>
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={() => { if (!isToday) setViewDate(addDays(viewDate, 1)); }}
        className={`w-10 h-10 items-center justify-center rounded-full ${isToday ? "bg-gray-50" : "bg-gray-100"}`}
        hitSlop={8}
        disabled={isToday}
      >
        <Text className={`text-lg ${isToday ? "text-gray-300" : "text-gray-700"}`}>›</Text>
      </Pressable>
    </View>
  );

  if (totalItems === 0) {
    return (
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor="#4f46e5" />
        }
      >
        {dateNavBar}
        <MoodCard mood={mood} onMoodChange={setMood} isSaving={isMoodSaving} readonly={!isToday} />
        <View className="items-center px-8 pt-8 pb-8">
          {isToday ? (
            <>
              <Text className="text-5xl mb-4">☀️</Text>
              <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                Tu día está vacío
              </Text>
              <Text className="text-sm text-muted text-center mb-8">
                Agrega medicamentos y actividades en la pestaña Medicamentos
              </Text>
              <Pressable
                className="bg-primary rounded-2xl px-8 py-4"
                onPress={() => router.navigate("/(tabs)/medications")}
              >
                <Text className="text-white font-semibold text-base">Ir a Medicamentos</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-5xl mb-4">📭</Text>
              <Text className="text-base text-gray-500 text-center">
                Sin registros para este día
              </Text>
            </>
          )}
        </View>
        <DayNotesSection date={viewDate} readonly={!isToday} />
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor="#4f46e5" />
        }
      >
        {dateNavBar}
        {!isToday && (
          <View className="mx-4 mb-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100">
            <Text className="text-xs text-amber-700 text-center">
              Modo lectura — día pasado
            </Text>
          </View>
        )}
        <MoodCard mood={mood} onMoodChange={setMood} isSaving={isMoodSaving} readonly={!isToday} />
        {BLOCK_ORDER.map((block) => (
          <View key={block} className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <View className="px-4 pt-4 pb-2">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wide">
                {BLOCK_LABEL[block]}
              </Text>
            </View>
            <View className="px-4 pb-2">
              {checklist[block].length === 0 ? (
                <Text className="text-sm text-gray-400 pb-2">Sin items</Text>
              ) : (
                checklist[block].map((item) => (
                  <ChecklistItemCard
                    key={item.id}
                    item={item}
                    onTap={handleItemTap}
                    isPending={createLog.isPending || deleteLog.isPending}
                  />
                ))
              )}
            </View>
          </View>
        ))}
        <DayNotesSection date={viewDate} readonly={!isToday} />
      </ScrollView>

      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View className="bg-white rounded-t-2xl p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              Motivo de omisión
            </Text>
            <Text className="text-sm text-gray-500 mb-4">Opcional</Text>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="ej: no tenía el medicamento"
              multiline
              numberOfLines={3}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-4"
              autoFocus
            />
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 border border-gray-200 rounded-xl py-3 items-center"
                onPress={() => {
                  setNoteModalVisible(false);
                  setPendingOmitItem(null);
                }}
              >
                <Text className="text-gray-700 font-medium">Cancelar</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-primary rounded-xl py-3 items-center"
                onPress={handleConfirmOmit}
                disabled={createLog.isPending}
              >
                <Text className="text-white font-medium">Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
