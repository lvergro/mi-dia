import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { ChevronDown, ChevronUp, TrendingUp, Flame, CheckCircle2 } from "lucide-react-native";
import { useHistory } from "../../hooks/useHistory";
import { colors, radii, spacing } from "../../theme";
import type { DayHistory, DayHistoryItem, DayItemStatus } from "@mi-dia/core";

type PeriodTab = "week" | "month";

const MOOD_EMOJI: Record<number, string> = {
  1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄",
};

function pctColor(pct: number): string {
  if (pct >= 80) return colors.success;
  if (pct >= 50) return colors.warning;
  return colors.danger;
}

function pctBg(pct: number): string {
  if (pct >= 80) return colors.successSubtle;
  if (pct >= 50) return colors.warningSubtle;
  return colors.dangerSubtle;
}

function dotColor(pct: number): string {
  if (pct >= 80) return colors.success;
  if (pct >= 50) return "#eab308";
  return colors.danger;
}

function statusColor(status: DayItemStatus): string {
  if (status === "done") return colors.success;
  if (status === "omitted") return colors.danger;
  return colors.textMuted;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("es-ES", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString("es-ES", { month: "short" });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} ${month.charAt(0).toUpperCase()}${month.slice(1)}`;
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

// Compute stats from data
function computeStats(data: DayHistory[]) {
  if (data.length === 0) return { adherencia: 0, racha: 0, done: 0, total: 0 };
  const adherencia = Math.round(data.reduce((s, d) => s + d.pct, 0) / data.length);
  let racha = 0;
  for (const day of data) {
    if (day.pct >= 80) racha++;
    else break;
  }
  const done = data.reduce((s, d) => s + d.done, 0);
  const total = data.reduce((s, d) => s + d.total, 0);
  return { adherencia, racha, done, total };
}

function StatsHeader({ data }: { data: DayHistory[] }) {
  const { adherencia, racha, done, total } = computeStats(data);

  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: spacing.lg,
          alignItems: "center",
          gap: 4,
        }}
      >
        <TrendingUp size={18} color={colors.primary} strokeWidth={1.8} />
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>{adherencia}%</Text>
        <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: "center" }}>de adherencia</Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: spacing.lg,
          alignItems: "center",
          gap: 4,
        }}
      >
        <Flame size={18} color="#f59e0b" strokeWidth={1.8} />
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>{racha}</Text>
        <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: "center" }}>Racha actual</Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: spacing.lg,
          alignItems: "center",
          gap: 4,
        }}
      >
        <CheckCircle2 size={18} color={colors.success} strokeWidth={1.8} />
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>
          {done}/{total}
        </Text>
        <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: "center" }}>tomas</Text>
      </View>
    </View>
  );
}

function ItemRow({ item }: { item: DayHistoryItem }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 6,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor:
            item.status === "done" ? colors.successSubtle : item.status === "omitted" ? colors.dangerSubtle : colors.gray100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: statusColor(item.status), fontSize: 11, fontWeight: "700" }}>
          {item.status === "done" ? "✓" : item.status === "omitted" ? "✗" : "○"}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: colors.textPrimary }}>{item.name}</Text>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>{formatTime(item.scheduled_time)}</Text>
      </View>
    </View>
  );
}

function DayRow({ item }: { item: DayHistory }) {
  const [expanded, setExpanded] = useState(false);

  const completados = item.items.filter((i) => i.status === "done");
  const pendientes = item.items.filter((i) => i.status !== "done");

  return (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.xxl,
          paddingVertical: 18,
          backgroundColor: pressed ? colors.gray50 : colors.white,
          gap: 10,
        })}
      >
        {/* Color dot */}
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: dotColor(item.pct),
            flexShrink: 0,
          }}
        />

        {/* Day label + mood */}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: "500" }}>
            {formatDayLabel(item.date)}
          </Text>
          {item.mood !== null && item.mood !== undefined && (
            <Text style={{ fontSize: 14 }}>{MOOD_EMOJI[item.mood]}</Text>
          )}
        </View>

        {/* Score + badge + chevron */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>{item.done}/{item.total}</Text>
          <View
            style={{
              paddingHorizontal: 9,
              paddingVertical: 3,
              borderRadius: radii.full,
              backgroundColor: pctBg(item.pct),
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: pctColor(item.pct) }}>{item.pct}%</Text>
          </View>
          {expanded
            ? <ChevronUp size={16} color={colors.textMuted} strokeWidth={2} />
            : <ChevronDown size={16} color={colors.textMuted} strokeWidth={2} />
          }
        </View>
      </Pressable>

      {expanded && (
        <View
          style={{
            paddingHorizontal: spacing.xxl,
            paddingBottom: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
          }}
        >
          {item.items.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.textMuted, paddingVertical: spacing.sm }}>
              Sin ítems registrados
            </Text>
          ) : (
            <>
              {completados.length > 0 && (
                <View style={{ marginTop: spacing.md }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.success, marginBottom: 6 }}>
                    Completados ({completados.length})
                  </Text>
                  {completados.map((i) => <ItemRow key={i.item_id} item={i} />)}
                </View>
              )}
              {pendientes.length > 0 && (
                <View style={{ marginTop: completados.length > 0 ? spacing.md : spacing.md }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textMuted, marginBottom: 6 }}>
                    Pendientes ({pendientes.length})
                  </Text>
                  {pendientes.map((i) => <ItemRow key={i.item_id} item={i} />)}
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useHistory();
  const [period, setPeriod] = useState<PeriodTab>("week");

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>Cargando historial…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <Text style={{ color: colors.danger }}>Error al cargar el historial.</Text>
      </View>
    );
  }

  const periodData = (data ?? []).slice(0, period === "week" ? 7 : 30);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {!data || data.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary, marginBottom: 6 }}>
            Sin historial aún
          </Text>
          <Text style={{ color: colors.textMuted, textAlign: "center", fontSize: 14 }}>
            Completa ítems en Mi Día para ver tu progreso aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={periodData}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
          ListHeaderComponent={
            <View>
              {/* Page title */}
              <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}>Historial</Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  Revisa tu adherencia y tu registro diario
                </Text>
              </View>

              {/* Stats row */}
              <StatsHeader data={periodData} />

              {/* Period tabs */}
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: spacing.lg,
                  marginBottom: spacing.md,
                  backgroundColor: colors.gray100,
                  borderRadius: radii.lg,
                  padding: 3,
                }}
              >
                {(["week", "month"] as PeriodTab[]).map((tab) => {
                  const active = period === tab;
                  return (
                    <Pressable
                      key={tab}
                      onPress={() => setPeriod(tab)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: radii.md,
                        backgroundColor: active ? colors.white : "transparent",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: active ? "600" : "400",
                          color: active ? colors.textPrimary : colors.textMuted,
                        }}
                      >
                        {tab === "week" ? "Semana" : "Mes"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          }
          renderItem={({ item }) => <DayRow item={item} />}
        />
      )}
    </View>
  );
}
