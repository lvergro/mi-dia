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
import { colors, radii, spacing } from "../../theme";
import type { ItemWithStatus, ItemBlock } from "@mi-dia/core";

const BLOCK_ORDER: ItemBlock[] = ["mañana", "tarde", "noche"];
const BLOCK_LABEL: Record<ItemBlock, string> = {
  mañana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
};

const MOOD_EMOJI: Record<number, string> = {
  1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄",
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

interface ChecklistItemCardProps {
  item: ItemWithStatus;
  onTap: (item: ItemWithStatus) => void;
  isPending: boolean;
}

function ChecklistItemCard({ item, onTap, isPending }: ChecklistItemCardProps) {
  const isDone = item.status === "done";
  const isOmitted = item.status === "omitted";

  const recurrenceLabel =
    item.recurrence_type === "daily"
      ? "Diaria"
      : (item.recurrence_days ?? [])
          .map((d) => ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][d])
          .join(", ");

  return (
    <Pressable onPress={() => onTap(item)} disabled={isPending}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 12,
          marginBottom: 8,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: isDone ? colors.successLight : isOmitted ? colors.gray200 : colors.cardBorder,
          backgroundColor: isDone ? colors.successSubtle : isOmitted ? colors.gray50 : colors.white,
          opacity: isOmitted ? 0.65 : 1,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <Text
              style={{
                fontWeight: "600",
                fontSize: 14,
                color: isDone ? colors.success : isOmitted ? colors.textMuted : colors.textPrimary,
              }}
            >
              {item.name}
            </Text>
            <View
              style={{
                borderRadius: radii.sm,
                paddingHorizontal: 6,
                paddingVertical: 2,
                backgroundColor: item.type === "medication" ? colors.infoSubtle : colors.primarySubtle,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: item.type === "medication" ? colors.info : colors.primary,
                }}
              >
                {item.type === "medication" ? "Med" : "Act"}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{formatTime(item.specific_time)}</Text>
            {item.dose !== null && (
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.dose}</Text>
            )}
            <View style={{ backgroundColor: colors.gray100, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, color: colors.textSecondary }}>{recurrenceLabel}</Text>
            </View>
          </View>
        </View>
        <View style={{ marginLeft: 12, width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
          {isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : isDone ? (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.success,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.white, fontSize: 13, fontWeight: "700" }}>✓</Text>
            </View>
          ) : isOmitted ? (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.gray200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "700" }}>–</Text>
            </View>
          ) : (
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.gray300 }} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

function ProgressBanner({
  done,
  total,
  mood,
  isToday,
}: {
  done: number;
  total: number;
  mood: number | null;
  isToday: boolean;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: radii.xl,
        backgroundColor: allDone ? colors.successSubtle : colors.primarySubtle,
        borderWidth: 1,
        borderColor: allDone ? colors.successLight : colors.primaryLight,
        padding: spacing.lg,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 13, fontWeight: "600", color: allDone ? colors.success : colors.primary, marginBottom: 2 }}>
            {isToday ? (allDone ? "¡Día completado!" : "Progreso de hoy") : "Resumen del día"}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "700", color: allDone ? colors.success : colors.textPrimary }}>
            {done}{" "}
            <Text style={{ fontSize: 14, fontWeight: "400", color: colors.textSecondary }}>de {total} completados</Text>
          </Text>
        </View>
        <View style={{ alignItems: "center", gap: 4 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: allDone ? colors.success : colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.white }}>{pct}%</Text>
          </View>
          {mood !== null && (
            <Text style={{ fontSize: 18 }}>{MOOD_EMOJI[mood]}</Text>
          )}
        </View>
      </View>
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
  const { mood } = useMood(viewDate);

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [pendingOmitItem, setPendingOmitItem] = useState<ItemWithStatus | null>(null);

  const displayDate = formatDisplayDate(viewDate);

  const totalItems = BLOCK_ORDER.reduce((sum, block) => sum + checklist[block].length, 0);
  const doneItems = BLOCK_ORDER.reduce(
    (sum, block) => sum + checklist[block].filter((i) => i.status === "done").length,
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
                { onError: () => Alert.alert("Error", "No se pudo guardar el cambio.") },
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
                  onError: () => Alert.alert("Error", "No se pudo revertir el cambio."),
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
      <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ color: colors.danger, textAlign: "center" }}>No se pudieron cargar los ítems del día.</Text>
      </View>
    );
  }

  const dateNavBar = (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm }}>
      <Pressable
        onPress={() => setViewDate(addDays(viewDate, -1))}
        style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: colors.gray100 }}
        hitSlop={8}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 18, lineHeight: 22 }}>‹</Text>
      </Pressable>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary }}>Mi Día</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, textTransform: "capitalize", marginTop: 2 }}>{displayDate}</Text>
        {!isToday && (
          <Pressable onPress={() => setViewDate(todayStr)} hitSlop={6}>
            <Text style={{ fontSize: 12, color: colors.primary, marginTop: 4, fontWeight: "500" }}>Volver a hoy</Text>
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={() => { if (!isToday) setViewDate(addDays(viewDate, 1)); }}
        style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: isToday ? colors.gray50 : colors.gray100 }}
        hitSlop={8}
        disabled={isToday}
      >
        <Text style={{ fontSize: 18, lineHeight: 22, color: isToday ? colors.gray300 : colors.textSecondary }}>›</Text>
      </Pressable>
    </View>
  );

  if (totalItems === 0) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.surface }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {dateNavBar}
        <View style={{ alignItems: "center", paddingHorizontal: 32, paddingTop: 32, paddingBottom: 32 }}>
          {isToday ? (
            <>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySubtle, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 32 }}>☀️</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary, textAlign: "center", marginBottom: 8 }}>Tu día está vacío</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
                Agrega medicamentos y actividades en la pestaña Rutina
              </Text>
              <Pressable
                style={{ backgroundColor: colors.primary, borderRadius: radii.lg, paddingHorizontal: 28, paddingVertical: 14 }}
                onPress={() => router.navigate("/(tabs)/medications")}
              >
                <Text style={{ color: colors.white, fontWeight: "600", fontSize: 15 }}>Ir a Rutina</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: "center" }}>Sin registros para este día</Text>
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.surface }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {dateNavBar}

        <ProgressBanner done={doneItems} total={totalItems} mood={mood} isToday={isToday} />

        {!isToday && (
          <View style={{ marginHorizontal: spacing.lg, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.warningSubtle, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.warningLight }}>
            <Text style={{ fontSize: 12, color: colors.warning, textAlign: "center" }}>Modo lectura — día pasado</Text>
          </View>
        )}

        {BLOCK_ORDER.map((block) => (
          checklist[block].length === 0 ? null : (
            <View key={block} style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.white, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.cardBorder, overflow: "hidden" }}>
              <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.6 }}>
                  {BLOCK_LABEL[block]}
                </Text>
              </View>
              <View style={{ paddingHorizontal: spacing.md, paddingBottom: 8 }}>
                {checklist[block].map((item) => (
                  <ChecklistItemCard
                    key={item.id}
                    item={item}
                    onTap={handleItemTap}
                    isPending={createLog.isPending || deleteLog.isPending}
                  />
                ))}
              </View>
            </View>
          )
        ))}
      </ScrollView>

      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <View style={{ backgroundColor: colors.white, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textPrimary, marginBottom: 4 }}>Motivo de omisión</Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>Opcional</Text>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="ej: no tenía el medicamento"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={{ borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.textPrimary, marginBottom: 16, textAlignVertical: "top" }}
              autoFocus
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                style={{ flex: 1, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radii.md, paddingVertical: 13, alignItems: "center" }}
                onPress={() => { setNoteModalVisible(false); setPendingOmitItem(null); }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: "500" }}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 13, alignItems: "center" }}
                onPress={handleConfirmOmit}
                disabled={createLog.isPending}
              >
                <Text style={{ color: colors.white, fontWeight: "600" }}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
