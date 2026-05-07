import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { DayHistory } from "../../hooks/useHistory";
import { useHistory } from "../../hooks/useHistory";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  done: "Hecho",
  skipped: "Saltado",
  not_sure: "No recuerdo",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-pending",
  done: "bg-done",
  skipped: "bg-skipped",
  not_sure: "bg-not_sure",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function AdherenceBadge({ pct }: { pct: number }) {
  const color = pct >= 80 ? "bg-done" : pct >= 50 ? "bg-not_sure" : "bg-skipped";
  return (
    <View className={`${color} rounded-full px-3 py-1`}>
      <Text className="text-white text-xs font-bold">{pct}%</Text>
    </View>
  );
}

function DayDetailModal({ day, onClose }: { day: DayHistory; onClose: () => void }) {
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-t-2xl max-h-[80%]" onPress={() => {}}>
          <View className="px-6 pt-6 pb-3 border-b border-gray-100 flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold text-gray-900 capitalize">
                {formatDate(day.date)}
              </Text>
              <Text className="text-sm text-muted mt-0.5">
                {day.adherence.done}/{day.adherence.total} completados
              </Text>
            </View>
            <AdherenceBadge pct={day.adherence.pct} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            {day.items.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
              >
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-medium text-gray-900">{item.title}</Text>
                  {item.scheduled_time && (
                    <Text className="text-xs text-muted mt-0.5">
                      {item.scheduled_time.slice(0, 5)}
                    </Text>
                  )}
                </View>
                <View className={`rounded-full px-3 py-1 ${STATUS_COLOR[item.status] ?? "bg-gray-200"}`}>
                  <Text className="text-xs text-white font-semibold">
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <Pressable className="mx-6 mb-8 bg-gray-100 rounded-xl py-4 items-center" onPress={onClose}>
            <Text className="text-gray-700 font-medium">Cerrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function HistoryScreen() {
  const { data: history = [], isLoading, isError } = useHistory(30);
  const [selectedDay, setSelectedDay] = useState<DayHistory | null>(null);

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-6 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Historial</Text>
        <Text className="text-sm text-muted mt-0.5">Últimos 30 días</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-muted text-center">No se pudo cargar el historial.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <Pressable
              className="bg-white rounded-2xl px-4 py-4 mb-3 border border-gray-100 flex-row items-center active:opacity-70"
              onPress={() => setSelectedDay(item)}
            >
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 capitalize">
                  {formatDate(item.date)}
                </Text>
                <Text className="text-xs text-muted mt-0.5">
                  {item.adherence.done}/{item.adherence.total} ítems completados
                </Text>
              </View>
              <AdherenceBadge pct={item.adherence.pct} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center mt-4">
              <Text className="text-4xl mb-3">📋</Text>
              <Text className="text-muted text-center">
                El historial de días anteriores aparecerá aquí una vez que empieces a registrar tu rutina diaria.
              </Text>
            </View>
          }
        />
      )}

      {selectedDay && (
        <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </View>
  );
}
