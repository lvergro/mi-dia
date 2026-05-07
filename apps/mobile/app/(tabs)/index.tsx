import { useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { groupItemsByTimeBlock, calculateAdherence } from "@mi-dia/core";
import type { DailyItem } from "@mi-dia/types";
import { useDailyChecklist } from "../../hooks/useDailyChecklist";
import { useSessionStore } from "../../hooks/useSession";
import { DailyItemCard } from "../../components/daily-item/DailyItemCard";
import { StatusPicker } from "../../components/daily-item/StatusPicker";

const BLOCK_LABEL: Record<string, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  night: "Noche",
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function MiDiaScreen() {
  const router = useRouter();
  const { session } = useSessionStore();
  const userId = session?.user.id ?? "";
  const date = today();

  const { data: items = [], isLoading, error, refetch, isFetching } = useDailyChecklist(userId, date);
  const [selectedItem, setSelectedItem] = useState<DailyItem | null>(null);

  const grouped = groupItemsByTimeBlock(items);
  const adherence = calculateAdherence(items);

  const displayDate = new Date().toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

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

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-8">
        <Text className="text-5xl mb-4">☀️</Text>
        <Text className="text-xl font-bold text-gray-900 text-center mb-2">
          Aún no tienes rutinas
        </Text>
        <Text className="text-sm text-muted text-center mb-8">
          Agrega tus medicamentos y configura a qué hora tomarlos para que aparezcan aquí cada día.
        </Text>
        <Pressable
          className="bg-primary rounded-2xl px-8 py-4"
          onPress={() => router.navigate("/(tabs)/medications")}
        >
          <Text className="text-white font-semibold text-base">Ir a Medicamentos</Text>
        </Pressable>
      </View>
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
        {/* Header con fecha y badge de adherencia */}
        <View className="px-4 pt-6 pb-4 flex-row items-start justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Mi Día</Text>
            <Text className="text-sm text-muted capitalize mt-0.5">{displayDate}</Text>
          </View>
          {items.length > 0 && (
            <View className="bg-primary rounded-2xl px-4 py-2 items-center">
              <Text className="text-white font-bold text-lg">{adherence.pct}%</Text>
              <Text className="text-white text-xs opacity-80">completado</Text>
            </View>
          )}
        </View>

        {/* Bloques horarios */}
        {(["morning", "afternoon", "night"] as const).map((block) => (
          <View key={block} className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <View className="px-4 pt-4 pb-2">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wide">
                {BLOCK_LABEL[block]}
              </Text>
            </View>
            {grouped[block].length === 0 ? (
              <View className="px-4 pb-4">
                <Text className="text-sm text-gray-400">Sin ítems para este bloque</Text>
              </View>
            ) : (
              <View className="px-4 pb-2">
                {grouped[block].map((item) => (
                  <DailyItemCard key={item.id} item={item} onPress={setSelectedItem} />
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Ítems sin bloque horario */}
        {items.filter((i) => i.time_block === null).length > 0 && (
          <View className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <View className="px-4 pt-4 pb-2">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wide">Sin horario</Text>
            </View>
            <View className="px-4 pb-2">
              {items
                .filter((i) => i.time_block === null)
                .map((item) => (
                  <DailyItemCard key={item.id} item={item} onPress={setSelectedItem} />
                ))}
            </View>
          </View>
        )}
      </ScrollView>

      {selectedItem && (
        <StatusPicker
          item={selectedItem}
          visible={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
