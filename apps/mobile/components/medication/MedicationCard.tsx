import { Pressable, Text, View } from "react-native";
import type { Medication } from "@mi-dia/types";

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
}

export function MedicationCard({ medication, onEdit, onDelete }: MedicationCardProps) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 flex-row items-center">
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{medication.name}</Text>
        {medication.dose ? (
          <Text className="text-sm text-muted mt-0.5">{medication.dose}</Text>
        ) : null}
        {medication.instructions ? (
          <Text className="text-xs text-gray-400 mt-1" numberOfLines={2}>
            {medication.instructions}
          </Text>
        ) : null}
      </View>

      <View className="flex-row gap-2 ml-3">
        <Pressable
          onPress={() => onEdit(medication)}
          className="bg-gray-100 rounded-xl px-3 py-2"
        >
          <Text className="text-sm text-gray-700">Editar</Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(medication)}
          className="bg-red-50 rounded-xl px-3 py-2"
        >
          <Text className="text-sm text-red-600">Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}
