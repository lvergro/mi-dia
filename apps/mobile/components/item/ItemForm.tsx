import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Item, ItemType, RecurrenceType } from "@mi-dia/types";

export interface ItemFormValues {
  type: ItemType;
  name: string;
  dose: string;
  specific_time: string;
  recurrence_type: RecurrenceType;
  recurrence_days: number[];
}

interface ItemFormProps {
  visible: boolean;
  initial?: Item | null;
  onClose: () => void;
  onSubmit: (values: ItemFormValues) => void;
  isPending: boolean;
}

const DAY_LABELS: { value: number; label: string }[] = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 7, label: "D" },
];

function buildInitialValues(initial: Item | null | undefined): ItemFormValues {
  if (!initial) {
    return {
      type: "medication",
      name: "",
      dose: "",
      specific_time: "",
      recurrence_type: "daily",
      recurrence_days: [],
    };
  }
  return {
    type: initial.type,
    name: initial.name,
    dose: initial.dose ?? "",
    specific_time: initial.specific_time.slice(0, 5),
    recurrence_type: initial.recurrence_type,
    recurrence_days: initial.recurrence_days ?? [],
  };
}

function validateTime(val: string): boolean {
  return /^\d{1,2}:\d{2}$/.test(val);
}

export function ItemForm({ visible, initial, onClose, onSubmit, isPending }: ItemFormProps) {
  const [type, setType] = useState<ItemType>("medication");
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [specificTime, setSpecificTime] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("daily");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);

  const [nameError, setNameError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [daysError, setDaysError] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  function handleOpen() {
    const vals = buildInitialValues(initial);
    setType(vals.type);
    setName(vals.name);
    setDose(vals.dose);
    setSpecificTime(vals.specific_time);
    setRecurrenceType(vals.recurrence_type);
    setRecurrenceDays(vals.recurrence_days);
    setNameError(false);
    setTimeError(false);
    setDaysError(false);
    setIsDirty(false);
  }

  function handleClose() {
    if (isDirty) {
      Alert.alert(
        "¿Descartar cambios?",
        "Tienes cambios sin guardar.",
        [
          { text: "Seguir editando", style: "cancel" },
          { text: "Descartar", style: "destructive", onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  }

  function toggleDay(day: number) {
    setIsDirty(true);
    setDaysError(false);
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit() {
    let valid = true;
    if (!name.trim()) {
      setNameError(true);
      valid = false;
    }
    if (!specificTime || !validateTime(specificTime)) {
      setTimeError(true);
      valid = false;
    }
    if (recurrenceType === "specific_days" && recurrenceDays.length === 0) {
      setDaysError(true);
      valid = false;
    }
    if (!valid) return;

    onSubmit({
      type,
      name: name.trim(),
      dose: dose.trim(),
      specific_time: specificTime.trim(),
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceType === "daily" ? [] : recurrenceDays,
    });
  }

  const saveDisabled =
    isPending ||
    !name.trim() ||
    !specificTime ||
    !validateTime(specificTime) ||
    (recurrenceType === "specific_days" && recurrenceDays.length === 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onShow={handleOpen}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={handleClose}>
          <Pressable className="bg-white rounded-t-2xl" onPress={() => {}}>
            <ScrollView
              contentContainerStyle={{ padding: 24 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-lg font-semibold text-center mb-6">
                {initial ? "Editar ítem" : "Nuevo ítem"}
              </Text>

              {/* Tipo */}
              <Text className="text-sm font-medium text-gray-700 mb-2">Tipo</Text>
              <View className="flex-row gap-2 mb-5">
                {(["medication", "activity"] as ItemType[]).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => {
                      setType(t);
                      setIsDirty(true);
                    }}
                    className={`flex-1 rounded-xl py-3 items-center border ${
                      type === t ? "bg-primary border-primary" : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        type === t ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {t === "medication" ? "Medicamento" : "Actividad"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Nombre */}
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Nombre <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 mb-1 text-gray-900 ${
                  nameError ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="Ej: Metformina"
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setNameError(false);
                  setIsDirty(true);
                }}
                autoCapitalize="words"
              />
              {nameError ? (
                <Text className="text-xs text-red-500 mb-3">El nombre es requerido</Text>
              ) : (
                <View className="mb-3" />
              )}

              {/* Dosis (solo medication) */}
              {type === "medication" && (
                <>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Dosis</Text>
                  <TextInput
                    className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-900"
                    placeholder="ej: 500mg"
                    value={dose}
                    onChangeText={(v) => {
                      setDose(v);
                      setIsDirty(true);
                    }}
                  />
                </>
              )}

              {/* Hora */}
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Hora <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 mb-1 text-gray-900 ${
                  timeError ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="HH:MM"
                value={specificTime}
                onChangeText={(v) => {
                  setSpecificTime(v);
                  setTimeError(false);
                  setIsDirty(true);
                }}
                keyboardType="numbers-and-punctuation"
              />
              {timeError ? (
                <Text className="text-xs text-red-500 mb-3">
                  Formato válido: HH:MM (ej. 8:00)
                </Text>
              ) : (
                <View className="mb-3" />
              )}

              {/* Recurrencia */}
              <Text className="text-sm font-medium text-gray-700 mb-2">Recurrencia</Text>
              <View className="flex-row gap-2 mb-4">
                {(["daily", "specific_days"] as RecurrenceType[]).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => {
                      setRecurrenceType(r);
                      setDaysError(false);
                      setIsDirty(true);
                    }}
                    className={`flex-1 rounded-xl py-3 items-center border ${
                      recurrenceType === r
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        recurrenceType === r ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {r === "daily" ? "Diaria" : "Días específicos"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Días */}
              {recurrenceType === "specific_days" && (
                <>
                  <View className="flex-row gap-2 mb-1 justify-between">
                    {DAY_LABELS.map(({ value, label }) => (
                      <Pressable
                        key={value}
                        onPress={() => toggleDay(value)}
                        className={`w-10 h-10 rounded-full items-center justify-center border ${
                          recurrenceDays.includes(value)
                            ? "bg-primary border-primary"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            recurrenceDays.includes(value) ? "text-white" : "text-gray-600"
                          }`}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {daysError ? (
                    <Text className="text-xs text-red-500 mb-3">
                      Selecciona al menos un día
                    </Text>
                  ) : (
                    <View className="mb-3" />
                  )}
                </>
              )}

              <Pressable
                className={`rounded-xl py-4 items-center mb-3 ${
                  saveDisabled ? "bg-gray-300" : "bg-primary"
                }`}
                onPress={handleSubmit}
                disabled={saveDisabled}
              >
                <Text className="text-white font-semibold text-base">
                  {isPending ? "Guardando…" : "Guardar"}
                </Text>
              </Pressable>

              <Pressable className="items-center py-2" onPress={handleClose}>
                <Text className="text-muted">Cancelar</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
