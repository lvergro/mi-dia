import { View, Text, ScrollView } from "react-native";

export default function MedicationsScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Medicamentos</Text>
        <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center">
          <Text className="text-4xl mb-3">💊</Text>
          <Text className="text-gray-500 text-center">
            Aún no tienes medicamentos registrados.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
