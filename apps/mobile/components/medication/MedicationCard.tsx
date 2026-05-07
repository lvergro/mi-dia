import { Pressable, Text, View } from "react-native";
import type { Medication } from "@mi-dia/types";
import { useRoutinesByMedication } from "../../hooks/useRoutines";

const BLOCK_LABEL: Record<string, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  night: "Noche",
};

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
}

export function MedicationCard({ medication, onEdit, onDelete }: MedicationCardProps) {
  const { data: routines = [] } = useRoutinesByMedication(medication.id);

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row items-start">
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

      {routines.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100 flex-row flex-wrap gap-2">
          {routines.map((r) => (
            <View key={r.id} className="bg-primary/10 rounded-full px-3 py-1 flex-row items-center">
              <Text className="text-xs text-primary font-medium">
                {r.time_block ? BLOCK_LABEL[r.time_block] : "Sin horario"}
                {r.scheduled_time ? ` · ${r.scheduled_time.slice(0, 5)}` : ""}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
