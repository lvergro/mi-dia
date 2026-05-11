import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useHistory } from "../../hooks/useHistory";
import { colors, radii, shadows, spacing } from "../../theme";
import type { DayHistory, DayHistoryItem, DayItemStatus } from "@mi-dia/core";

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

function statusIcon(status: DayItemStatus): string {
  if (status === "done") return "✓";
  if (status === "omitted") return "✗";
  return "○";
}

function statusColor(status: DayItemStatus): string {
  if (status === "done") return colors.success;
  if (status === "omitted") return colors.danger;
  return colors.textMuted;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

const MOOD_COLORS: Record<number, string> = {
  1: colors.mood1,
  2: colors.mood2,
  3: colors.mood3,
  4: colors.mood4,
  5: colors.mood5,
};

function WeeklySummaryCard({ data }: { data: DayHistory[] }) {
  const last7 = data.slice(0, 7);
  const avgPct = last7.length > 0
    ? Math.round(last7.reduce((s, d) => s + d.pct, 0) / last7.length)
    : 0;

  let streak = 0;
  for (const day of data) {
    if (day.pct >= 80) streak++;
    else break;
  }

  const bestDay = last7.reduce((best, d) => d.pct > best.pct ? d : best, last7[0]);

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
        ...shadows.card,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: spacing.md }}>
        Últimos 7 días
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: pctBg(avgPct),
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: pctColor(avgPct) }}>{avgPct}%</Text>
          </View>
          <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: "center" }}>Promedio</Text>
        </View>
        <View style={{ alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: streak > 0 ? colors.primarySubtle : colors.gray100,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: streak > 0 ? colors.primary : colors.textMuted }}>{streak}</Text>
          </View>
          <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: "center" }}>Racha ≥80%</Text>
        </View>
        {bestDay && (
          <View style={{ alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.successSubtle,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: colors.success, textAlign: "center" }}>
                {bestDay.pct}%
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: "center" }}>Mejor día</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ItemRow({ item }: { item: DayHistoryItem }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray100 }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: item.status === "done" ? colors.successSubtle : item.status === "omitted" ? colors.dangerSubtle : colors.gray100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: statusColor(item.status), fontSize: 12, fontWeight: "700" }}>
          {statusIcon(item.status)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: colors.textPrimary }}>{item.name}</Text>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>{formatTime(item.scheduled_time)}</Text>
      </View>
    </View>
  );
}

function DayRow({ item }: { item: DayHistory }) {
  const [expanded, setExpanded] = useState(false);

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
        ...shadows.subtle,
      }}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: pressed ? colors.gray50 : colors.white,
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          {item.mood !== null && item.mood !== undefined ? (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: MOOD_COLORS[item.mood] ?? colors.gray300,
              }}
            />
          ) : (
            <View style={{ width: 8 }} />
          )}
          <Text style={{ fontSize: 14, color: colors.textPrimary, textTransform: "capitalize" }}>
            {formatDate(item.date)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>{item.done}/{item.total}</Text>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
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
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, borderTopWidth: 1, borderTopColor: colors.cardBorder }}>
          {item.items.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.textMuted, paddingVertical: spacing.sm }}>Sin ítems registrados</Text>
          ) : (
            item.items.map((i) => <ItemRow key={i.item_id} item={i} />)
          )}
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useHistory();

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {!data || data.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary, marginBottom: 6 }}>Sin historial aún</Text>
          <Text style={{ color: colors.textMuted, textAlign: "center", fontSize: 14 }}>
            Completa ítems en Mi Día para ver tu progreso aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
          ListHeaderComponent={data.length >= 2 ? <WeeklySummaryCard data={data} /> : null}
          renderItem={({ item }) => <DayRow item={item} />}
        />
      )}
    </View>
  );
}
