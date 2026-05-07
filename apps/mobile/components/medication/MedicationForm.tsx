import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View, KeyboardAvoidingView, Platform } from "react-native";
import type { Medication } from "@mi-dia/types";

export interface MedicationFormValues {
  name: string;
  dose: string;
  instructions: string;
}

interface MedicationFormProps {
  visible: boolean;
  initial?: Medication | null;
  onClose: () => void;
  onSubmit: (values: MedicationFormValues) => void;
  isPending: boolean;
}

export function MedicationForm({ visible, initial, onClose, onSubmit, isPending }: MedicationFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [dose, setDose] = useState(initial?.dose ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [nameError, setNameError] = useState(false);

  function handleOpen() {
    setName(initial?.name ?? "");
    setDose(initial?.dose ?? "");
    setInstructions(initial?.instructions ?? "");
    setNameError(false);
  }

  function handleSubmit() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onSubmit({ name: name.trim(), dose: dose.trim(), instructions: instructions.trim() });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
          <Pressable className="bg-white rounded-t-2xl p-6" onPress={() => {}}>
            <Text className="text-lg font-semibold text-center mb-6">
              {initial ? "Editar medicamento" : "Nuevo medicamento"}
            </Text>

            <Text className="text-sm font-medium text-gray-700 mb-1">
              Nombre <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={`border rounded-xl px-4 py-3 mb-1 text-gray-900 ${nameError ? "border-red-400" : "border-gray-200"}`}
              placeholder="Ej: Metformina"
              value={name}
              onChangeText={(v) => { setName(v); setNameError(false); }}
              autoCapitalize="words"
            />
            {nameError ? (
              <Text className="text-xs text-red-500 mb-3">El nombre es requerido</Text>
            ) : (
              <View className="mb-3" />
            )}

            <Text className="text-sm font-medium text-gray-700 mb-1">Dosis</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-900"
              placeholder="Ej: 500 mg"
              value={dose}
              onChangeText={setDose}
            />

            <Text className="text-sm font-medium text-gray-700 mb-1">Instrucciones</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 mb-6 text-gray-900"
              placeholder="Ej: Tomar con las comidas"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={2}
            />

            <Pressable
              className="bg-primary rounded-xl py-4 items-center mb-3"
              onPress={handleSubmit}
              disabled={isPending}
            >
              <Text className="text-white font-semibold text-base">
                {isPending ? "Guardando…" : "Guardar"}
              </Text>
            </Pressable>

            <Pressable className="items-center py-2" onPress={onClose}>
              <Text className="text-muted">Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
