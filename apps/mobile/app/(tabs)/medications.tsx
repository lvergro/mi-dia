import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import type { Medication } from "@mi-dia/types";
import { MedicationCard } from "../../components/medication/MedicationCard";
import { MedicationForm, type MedicationFormValues } from "../../components/medication/MedicationForm";
import { DeleteConfirmModal } from "../../components/medication/DeleteConfirmModal";
import { useMedications } from "../../hooks/useMedications";
import {
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication,
} from "../../hooks/useMedicationMutations";

export default function MedicationsScreen() {
  const { data: medications, isLoading, isError } = useMedications();
  const createMutation = useCreateMedication();
  const updateMutation = useUpdateMedication();
  const deleteMutation = useDeleteMedication();

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [deleting, setDeleting] = useState<Medication | null>(null);

  function openCreate() {
    setEditing(null);
    setFormVisible(true);
  }

  function openEdit(medication: Medication) {
    setEditing(medication);
    setFormVisible(true);
  }

  function handleFormSubmit(values: MedicationFormValues) {
    const payload = {
      name: values.name,
      dose: values.dose || null,
      instructions: values.instructions || null,
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: payload },
        { onSuccess: () => setFormVisible(false) },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setFormVisible(false) });
    }
  }

  function handleDeleteConfirm() {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  }

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-6 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Medicamentos</Text>
        <Pressable
          className="bg-primary rounded-xl px-4 py-2"
          onPress={openCreate}
          disabled={isMutating}
        >
          <Text className="text-white font-semibold">+ Nuevo</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-muted text-center">No se pudieron cargar los medicamentos.</Text>
        </View>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <MedicationCard
              medication={item}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          )}
          ListEmptyComponent={
            <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center mt-4">
              <Text className="text-4xl mb-3">💊</Text>
              <Text className="text-muted text-center">
                Aún no tienes medicamentos registrados.
              </Text>
              <Pressable className="mt-4 bg-primary rounded-xl px-5 py-3" onPress={openCreate}>
                <Text className="text-white font-semibold">Agregar el primero</Text>
              </Pressable>
            </View>
          }
        />
      )}

      <MedicationForm
        visible={formVisible}
        initial={editing}
        onClose={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmModal
        medication={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </View>
  );
}
