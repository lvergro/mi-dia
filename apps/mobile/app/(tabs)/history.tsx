import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useHistory } from "../../hooks/useHistory";
import type { DayHistory, DayHistoryItem, DayItemStatus } from "@mi-dia/core";

const RANGE_OPTIONS: (7 | 30)[] = [7, 30];

function pctColor(pct: number): string {
  if (pct >= 80) return "#22c55e";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

function statusIcon(status: DayItemStatus): string {
  if (status === "done") return "✓";
  if (status === "omitted") return "✗";
  return "○";
}

function statusColor(status: DayItemStatus): string {
  if (status === "done") return "#22c55e";
  if (status === "omitted") return "#ef4444";
  return "#9ca3af";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00"); // mediodía para evitar desfase UTC
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(time: string): string {
  return time.slice(0, 5); // 'HH:MM'
}

function DayRow({ item, onPress }: { item: DayHistory; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
    >
      <Text className="text-gray-800 capitalize">{formatDate(item.date)}</Text>
      <View className="flex-row items-center gap-3">
        <Text className="text-gray-500 text-sm">{item.done}/{item.total}</Text>
        <View
          style={{ backgroundColor: pctColor(item.pct) }}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Text className="text-white text-xs font-bold">{item.pct}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ItemRow({ item }: { item: DayHistoryItem }) {
  return (
    <View className="flex-row items-center gap-3 py-2 border-b border-gray-50">
      <Text style={{ color: statusColor(item.status), fontSize: 18 }}>
        {statusIcon(item.status)}
      </Text>
      <View>
        <Text className="text-gray-800">{item.name}</Text>
        <Text className="text-gray-400 text-xs">{formatTime(item.scheduled_time)}</Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const [range, setRange] = useState<7 | 30>(30);
  const [selected, setSelected] = useState<DayHistory | null>(null);
  const { data, isLoading, isError, refetch, isFetching } = useHistory(range);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">Error al cargar el historial.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Toggle rango */}
      <View className="flex-row justify-center gap-2 pt-4 pb-2">
        {RANGE_OPTIONS.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRange(r)}
            className={`px-4 py-2 rounded-full ${range === r ? "bg-blue-600" : "bg-gray-100"}`}
          >
            <Text className={range === r ? "text-white font-semibold" : "text-gray-700"}>
              {r} días
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {!data || data.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Sin historial para este rango.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.date}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <DayRow item={item} onPress={() => setSelected(item)} />
          )}
        />
      )}

      {/* Modal detalle */}
      <Modal
        visible={selected !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-2xl p-4 max-h-[70%]">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold capitalize">
                {selected ? formatDate(selected.date) : ""}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text className="text-gray-500 text-base">Cerrar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={selected?.items ?? []}
              keyExtractor={(item) => item.item_id}
              renderItem={({ item }) => <ItemRow item={item} />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
