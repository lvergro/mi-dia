import { Modal, Pressable, Text, View } from "react-native";
import type { Medication } from "@mi-dia/types";

interface DeleteConfirmModalProps {
  medication: Medication | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteConfirmModal({ medication, onClose, onConfirm, isPending }: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={!!medication}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40 justify-center px-6" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-6" onPress={() => {}}>
          <Text className="text-base font-semibold text-gray-900 mb-2">Eliminar medicamento</Text>
          <Text className="text-sm text-muted mb-6">
            ¿Seguro que quieres eliminar <Text className="font-semibold text-gray-900">{medication?.name}</Text>? Esta acción no se puede deshacer.
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 border border-gray-200 rounded-xl py-3 items-center"
              onPress={onClose}
              disabled={isPending}
            >
              <Text className="text-gray-700 font-medium">Cancelar</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-red-500 rounded-xl py-3 items-center"
              onPress={onConfirm}
              disabled={isPending}
            >
              <Text className="text-white font-medium">
                {isPending ? "Eliminando…" : "Eliminar"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
