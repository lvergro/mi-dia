import { View, Text, ScrollView } from "react-native";

export default function MiDiaScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Mi Día</Text>
        <Text className="text-muted mb-6">Hoy</Text>

        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Mañana</Text>
          <Text className="text-gray-400 text-sm">Sin ítems por ahora</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Tarde</Text>
          <Text className="text-gray-400 text-sm">Sin ítems por ahora</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Noche</Text>
          <Text className="text-gray-400 text-sm">Sin ítems por ahora</Text>
        </View>
      </View>
    </ScrollView>
  );
}
