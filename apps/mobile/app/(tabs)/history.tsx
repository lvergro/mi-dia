import { View, Text, ScrollView } from "react-native";

export default function HistoryScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Historial</Text>
        <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center">
          <Text className="text-4xl mb-3">📋</Text>
          <Text className="text-gray-500 text-center">
            El historial de días anteriores aparecerá aquí.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
