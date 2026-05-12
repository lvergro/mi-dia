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
import { colors, radii, spacing, shadows } from "../../theme";
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
        marginHorizontal: 20,
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
          ...shadows.subtle,
        }}
      >
        <TrendingUp size={18} color={colors.primary} strokeWidth={1.8} />
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>{adherencia}%</Text>
        <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: "center" }}>adherencia</Text>
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
          ...shadows.subtle,
        }}
      >
        <Flame size={18} color="#f59e0b" strokeWidth={1.8} />
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>{racha}</Text>
        <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: "center" }}>Racha</Text>
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
          ...shadows.subtle,
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
        gap: 12,
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor:
            item.status === "done" ? colors.successSubtle : item.status === "omitted" ? colors.dangerSubtle : colors.gray100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: statusColor(item.status), fontSize: 12, fontWeight: "700" }}>
          {item.status === "done" ? "✓" : item.status === "omitted" ? "✗" : "○"}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: colors.textPrimary }}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>{formatTime(item.scheduled_time)}</Text>
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
        marginHorizontal: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: spacing.md,
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        overflow: "hidden",
        ...shadows.subtle,
      }}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.gray50 : colors.white,
          paddingLeft: 32,
          paddingRight: 20,
          paddingVertical: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>
            {formatDayLabel(item.date)}
          </Text>
          <View style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: radii.full,
            backgroundColor: pctBg(item.pct)
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: pctColor(item.pct) }}>
              {item.pct}%
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {expanded
            ? <ChevronUp size={18} color={colors.textMuted} />
            : <ChevronDown size={18} color={colors.textMuted} />
          }
        </View>
      </Pressable>

      {expanded && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 20,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
          }}
        >
          {item.items.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.textMuted }}>Sin ítems registrados</Text>
          ) : (
            <>
              {completados.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.success, marginBottom: 8 }}>
                    COMPLETADOS
                  </Text>
                  {completados.map((i) => <ItemRow key={i.item_id} item={i} />)}
                </View>
              )}
              {pendientes.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textMuted, marginBottom: 8 }}>
                    PENDIENTES
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
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <Text style={{ color: colors.danger }}>Error al cargar historial</Text>
      </View>
    );
  }

  const periodData = (data ?? []).slice(0, period === "week" ? 7 : 30);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <FlatList
        data={periodData}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
              <Text style={{ fontSize: 24, fontWeight: "800", color: colors.textPrimary }}>Historial</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>Progreso y adherencia diaria</Text>
            </View>

            <StatsHeader data={periodData} />

            <View style={{
              flexDirection: "row",
              marginHorizontal: 20,
              marginVertical: 20,
              backgroundColor: colors.gray100,
              borderRadius: radii.lg,
              padding: 4,
            }}>
              {(["week", "month"] as PeriodTab[]).map((tab) => {
                const active = period === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setPeriod(tab)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: radii.md,
                      backgroundColor: active ? colors.white : "transparent",
                      alignItems: "center",
                      ... (active ? shadows.subtle : {})
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontWeight: active ? "700" : "500",
                      color: active ? colors.textPrimary : colors.textMuted,
                    }}>
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
    </View>
  );
}
