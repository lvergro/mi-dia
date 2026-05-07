import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import type { Medication, TimeBlock } from "@mi-dia/types";

export interface MedicationFormValues {
  name: string;
  dose: string;
  instructions: string;
  timeBlock: TimeBlock | null;
  scheduledTime: string;
}

interface MedicationFormProps {
  visible: boolean;
  initial?: Medication | null;
  onClose: () => void;
  onSubmit: (values: MedicationFormValues) => void;
  isPending: boolean;
}

const TIME_BLOCKS: { value: TimeBlock; label: string }[] = [
  { value: "morning", label: "Mañana" },
  { value: "afternoon", label: "Tarde" },
  { value: "night", label: "Noche" },
];

export function MedicationForm({ visible, initial, onClose, onSubmit, isPending }: MedicationFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [dose, setDose] = useState(initial?.dose ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [timeBlock, setTimeBlock] = useState<TimeBlock | null>(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [nameError, setNameError] = useState(false);
  const [timeError, setTimeError] = useState(false);

  function handleOpen() {
    setName(initial?.name ?? "");
    setDose(initial?.dose ?? "");
    setInstructions(initial?.instructions ?? "");
    setTimeBlock(null);
    setScheduledTime("");
    setNameError(false);
    setTimeError(false);
  }

  function validateTime(val: string): boolean {
    if (!val) return true;
    return /^\d{1,2}:\d{2}$/.test(val);
  }

  function handleSubmit() {
    let valid = true;
    if (!name.trim()) { setNameError(true); valid = false; }
    if (scheduledTime && !validateTime(scheduledTime)) { setTimeError(true); valid = false; }
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      dose: dose.trim(),
      instructions: instructions.trim(),
      timeBlock,
      scheduledTime: scheduledTime.trim(),
    });
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
          <Pressable className="bg-white rounded-t-2xl" onPress={() => {}}>
            <ScrollView
              contentContainerStyle={{ padding: 24 }}
              keyboardShouldPersistTaps="handled"
            >
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
                className="border border-gray-200 rounded-xl px-4 py-3 mb-5 text-gray-900"
                placeholder="Ej: Tomar con las comidas"
                value={instructions}
                onChangeText={setInstructions}
                multiline
                numberOfLines={2}
              />

              {/* Sección horario solo al crear */}
              {!initial && (
                <View className="border-t border-gray-100 pt-5 mb-4">
                  <Text className="text-sm font-semibold text-gray-800 mb-1">
                    Horario diario
                  </Text>
                  <Text className="text-xs text-muted mb-3">
                    Elige cuándo tomarlo para que aparezca en Mi Día.
                  </Text>

                  <View className="flex-row gap-2 mb-4">
                    {TIME_BLOCKS.map((tb) => (
                      <Pressable
                        key={tb.value}
                        onPress={() => setTimeBlock(timeBlock === tb.value ? null : tb.value)}
                        className={`flex-1 rounded-xl py-3 items-center border ${
                          timeBlock === tb.value
                            ? "bg-primary border-primary"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            timeBlock === tb.value ? "text-white" : "text-gray-600"
                          }`}
                        >
                          {tb.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {timeBlock && (
                    <>
                      <Text className="text-sm font-medium text-gray-700 mb-1">
                        Hora exacta (opcional)
                      </Text>
                      <TextInput
                        className={`border rounded-xl px-4 py-3 mb-1 text-gray-900 ${timeError ? "border-red-400" : "border-gray-200"}`}
                        placeholder="Ej: 8:00"
                        value={scheduledTime}
                        onChangeText={(v) => { setScheduledTime(v); setTimeError(false); }}
                        keyboardType="numbers-and-punctuation"
                      />
                      {timeError && (
                        <Text className="text-xs text-red-500 mb-2">
                          Formato válido: HH:MM (ej. 8:00)
                        </Text>
                      )}
                    </>
                  )}
                </View>
              )}

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
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
