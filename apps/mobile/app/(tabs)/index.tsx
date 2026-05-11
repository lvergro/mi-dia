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
import Svg, { Circle, G } from "react-native-svg";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Activity, Pill } from "lucide-react-native";
import { useChecklist } from "../../hooks/useChecklist";
import { useCreateLog, useDeleteLog } from "../../hooks/useLogMutations";
import { useMood } from "../../hooks/useMood";
import { MoodCard } from "../../components/mood/MoodCard";
import { colors, radii, spacing } from "../../theme";
import type { ItemWithStatus, ItemBlock, GroupedChecklist } from "@mi-dia/core";
import type { MoodValue } from "@mi-dia/types";

const BLOCK_ORDER: ItemBlock[] = ["mañana", "tarde", "noche"];
const BLOCK_LABEL: Record<ItemBlock, string> = {
  mañana: "MAÑANA",
  tarde: "TARDE",
  noche: "NOCHE",
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

function getNextPending(checklist: GroupedChecklist, isToday: boolean): ItemWithStatus | null {
  if (!isToday) return null;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const all: ItemWithStatus[] = [
    ...checklist.mañana,
    ...checklist.tarde,
    ...checklist.noche,
  ].filter((i) => i.status === "pending");
  all.sort((a, b) => a.specific_time.localeCompare(b.specific_time));
  return (
    all.find((item) => {
      const [h, m] = item.specific_time.split(":").map(Number);
      return h * 60 + m >= nowMinutes;
    }) ??
    all[0] ??
    null
  );
}

function motivationalMsg(pct: number, allDone: boolean): string {
  if (allDone) return "¡Excelente! Día completado";
  if (pct >= 80) return "¡Casi listo! Sigue así";
  if (pct >= 50) return "¡Buen trabajo! Mantén tu rutina";
  if (pct > 0) return "Vas bien, continúa";
  return "Comienza tu rutina del día";
}

function ringColor(pct: number): string {
  if (pct >= 80) return colors.success;
  if (pct >= 50) return colors.warning;
  return colors.danger;
}

function ProgressBanner({
  done,
  total,
  checklist,
  isToday,
}: {
  done: number;
  total: number;
  checklist: GroupedChecklist;
  isToday: boolean;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;
  const next = getNextPending(checklist, isToday);

  const SIZE = 84;
  const STROKE = 8;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - pct / 100);
  const color = ringColor(pct);

  return (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: radii.xl,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
      }}
    >
      {/* Donut ring */}
      <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
        <Svg width={SIZE} height={SIZE} style={{ position: "absolute" }}>
          <G rotation="-90" origin={`${SIZE / 2},${SIZE / 2}`}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.gray200} strokeWidth={STROKE} fill="none" />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={color}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={`${CIRC}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <Text style={{ fontSize: 18, fontWeight: "700", color }}>{pct}%</Text>
      </View>

      {/* Progress text */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 }}>
          {done} de {total} completados
        </Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 17 }}>
          {motivationalMsg(pct, allDone)}
        </Text>
      </View>

      {/* Próxima toma */}
      {next !== null && (
        <View
          style={{
            backgroundColor: colors.primarySubtle,
            borderRadius: radii.md,
            paddingHorizontal: 10,
            paddingVertical: 8,
            alignItems: "center",
            minWidth: 76,
          }}
        >
          <Text style={{ fontSize: 10, color: colors.primary, fontWeight: "600", marginBottom: 2 }}>
            Próxima toma
          </Text>
          <Text
            style={{ fontSize: 11, fontWeight: "600", color: colors.textPrimary, textAlign: "center" }}
            numberOfLines={1}
          >
            {next.name}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primary, marginTop: 2 }}>
            {formatTime(next.specific_time)}
          </Text>
        </View>
      )}
    </View>
  );
}

function ItemIcon({ type }: { type: string }) {
  const isMed = type === "medication";
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: isMed ? colors.successLight : "#ffedd5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        flexShrink: 0,
      }}
    >
      {isMed ? (
        <Pill size={20} color={colors.success} strokeWidth={1.8} />
      ) : (
        <Activity size={20} color="#ea580c" strokeWidth={1.8} />
      )}
    </View>
  );
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
          paddingVertical: 10,
          paddingHorizontal: 12,
          marginBottom: 8,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: isDone ? colors.successLight : isOmitted ? colors.gray200 : colors.cardBorder,
          backgroundColor: isDone ? colors.successSubtle : isOmitted ? colors.gray50 : colors.white,
          opacity: isOmitted ? 0.65 : 1,
        }}
      >
        <ItemIcon type={item.type} />

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 14,
              color: isDone ? colors.success : isOmitted ? colors.textMuted : colors.textPrimary,
              marginBottom: 2,
            }}
          >
            {item.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{formatTime(item.specific_time)}</Text>
            {item.dose !== null && (
              <>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>·</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.dose}</Text>
              </>
            )}
            <Text style={{ fontSize: 12, color: colors.textMuted }}>·</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{recurrenceLabel}</Text>
          </View>
        </View>

        <View style={{ marginLeft: 8, width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
          {isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : isDone ? (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.success,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.white, fontSize: 14, fontWeight: "700" }}>✓</Text>
            </View>
          ) : isOmitted ? (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.gray200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: "700" }}>–</Text>
            </View>
          ) : (
            <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.gray300 }} />
          )}
        </View>
      </View>
    </Pressable>
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
  const { mood, setMood, isSaving: isSavingMood } = useMood(viewDate);

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
      Alert.alert(item.name, "¿Qué deseas registrar?", [
        {
          text: "Hecho",
          onPress: () => {
            createLog.mutate(
              { item_id: item.id, date: viewDate, status: "done", completed_at: new Date().toISOString(), note: null },
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
      ]);
    } else {
      Alert.alert("Revertir", "¿Volver a marcar como pendiente?", [
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
      ]);
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
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: colors.danger, textAlign: "center" }}>No se pudieron cargar los ítems del día.</Text>
      </View>
    );
  }

  const dateNavBar = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
      }}
    >
      <Pressable
        onPress={() => setViewDate(addDays(viewDate, -1))}
        style={{
          width: 36,
          height: 36,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
          backgroundColor: colors.gray100,
        }}
        hitSlop={8}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 18, lineHeight: 22 }}>‹</Text>
      </Pressable>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary }}>Mi Día</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, textTransform: "capitalize", marginTop: 2 }}>
          {displayDate}
        </Text>
        {!isToday && (
          <Pressable onPress={() => setViewDate(todayStr)} hitSlop={6}>
            <Text style={{ fontSize: 12, color: colors.primary, marginTop: 4, fontWeight: "500" }}>Volver a hoy</Text>
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={() => {
          if (!isToday) setViewDate(addDays(viewDate, 1));
        }}
        style={{
          width: 36,
          height: 36,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
          backgroundColor: isToday ? colors.gray50 : colors.gray100,
        }}
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
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colors.primarySubtle,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 32 }}>☀️</Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Tu día está vacío
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textMuted,
                  textAlign: "center",
                  marginBottom: 24,
                  lineHeight: 20,
                }}
              >
                Agrega medicamentos y actividades en la pestaña Rutina
              </Text>
              <Pressable
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: radii.lg,
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                }}
                onPress={() => router.navigate("/(tabs)/medications")}
              >
                <Text style={{ color: colors.white, fontWeight: "600", fontSize: 15 }}>Ir a Rutina</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: "center" }}>
                Sin registros para este día
              </Text>
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

        <ProgressBanner done={doneItems} total={totalItems} checklist={checklist} isToday={isToday} />

        {isToday && (
          <MoodCard mood={mood as MoodValue | null} onMoodChange={setMood} isSaving={isSavingMood} />
        )}

        {!isToday && (
          <View
            style={{
              marginHorizontal: spacing.lg,
              marginBottom: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: colors.warningSubtle,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.warningLight,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.warning, textAlign: "center" }}>
              Modo lectura — día pasado
            </Text>
          </View>
        )}

        {BLOCK_ORDER.map((block) =>
          checklist[block].length === 0 ? null : (
            <View key={block} style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: colors.textMuted,
                  letterSpacing: 0.8,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                {BLOCK_LABEL[block]}
              </Text>
              {checklist[block].map((item) => (
                <ChecklistItemCard
                  key={item.id}
                  item={item}
                  onTap={handleItemTap}
                  isPending={createLog.isPending || deleteLog.isPending}
                />
              ))}
            </View>
          ),
        )}
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
          <View
            style={{
              backgroundColor: colors.white,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textPrimary, marginBottom: 4 }}>
              Motivo de omisión
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>Opcional</Text>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="ej: no tenía el medicamento"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: radii.md,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                color: colors.textPrimary,
                marginBottom: 16,
                textAlignVertical: "top",
              }}
              autoFocus
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  borderRadius: radii.md,
                  paddingVertical: 13,
                  alignItems: "center",
                }}
                onPress={() => {
                  setNoteModalVisible(false);
                  setPendingOmitItem(null);
                }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: "500" }}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: radii.md,
                  paddingVertical: 13,
                  alignItems: "center",
                }}
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
