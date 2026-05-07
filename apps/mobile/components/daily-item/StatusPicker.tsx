import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import type { DailyItem, DailyItemStatus } from "@mi-dia/types";
import { useUpdateDailyItemStatus } from "../../hooks/useUpdateDailyItemStatus";

const NOT_SURE_WARNING =
  "No hay confirmación de toma. Revisa tu pastillero o consulta tus indicaciones médicas antes de repetir una dosis.";

interface StatusPickerProps {
  item: DailyItem;
  visible: boolean;
  onClose: () => void;
}

type PickerStep = "options" | "not_sure_warning" | "undo_done_confirm";

export function StatusPicker({ item, visible, onClose }: StatusPickerProps) {
  const [step, setStep] = useState<PickerStep>("options");
  const { mutate, isPending } = useUpdateDailyItemStatus();

  function reset() {
    setStep("options");
    onClose();
  }

  function handleOptionPress(status: DailyItemStatus) {
    if (item.status === "done" && step === "options") {
      setStep("undo_done_confirm");
      return;
    }
    if (status === "not_sure") {
      setStep("not_sure_warning");
      return;
    }
    mutate({ id: item.id, status, date: item.date }, { onSuccess: reset });
  }

  function confirmNotSure() {
    mutate({ id: item.id, status: "not_sure", date: item.date }, { onSuccess: reset });
  }

  function confirmUndoDone(status: DailyItemStatus) {
    if (status === "not_sure") {
      setStep("not_sure_warning");
      return;
    }
    mutate({ id: item.id, status, date: item.date }, { onSuccess: reset });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={reset}>
        <Pressable className="bg-white rounded-t-2xl p-6" onPress={() => {}}>
          {step === "options" && (
            <>
              <Text className="text-lg font-semibold text-center mb-1">{item.title}</Text>
              <Text className="text-sm text-gray-500 text-center mb-6">¿Cómo resultó?</Text>

              <Pressable
                className="bg-done rounded-xl py-4 mb-3 items-center"
                onPress={() => handleOptionPress("done")}
                disabled={isPending}
              >
                <Text className="text-white font-semibold text-base">✓ Hecho</Text>
              </Pressable>

              <Pressable
                className="bg-gray-200 rounded-xl py-4 mb-3 items-center"
                onPress={() => handleOptionPress("skipped")}
                disabled={isPending}
              >
                <Text className="text-gray-700 font-semibold text-base">— Saltado</Text>
              </Pressable>

              <Pressable
                className="bg-amber-100 rounded-xl py-4 mb-4 items-center"
                onPress={() => handleOptionPress("not_sure")}
                disabled={isPending}
              >
                <Text className="text-amber-800 font-semibold text-base">? No recuerdo</Text>
              </Pressable>

              <Pressable className="items-center py-2" onPress={reset}>
                <Text className="text-muted">Cancelar</Text>
              </Pressable>
            </>
          )}

          {step === "not_sure_warning" && (
            <>
              <Text className="text-base font-semibold text-amber-800 mb-3">⚠ Atención</Text>
              <Text className="text-sm text-gray-700 mb-6 leading-5">{NOT_SURE_WARNING}</Text>

              <Pressable
                className="bg-not_sure rounded-xl py-4 mb-3 items-center"
                onPress={confirmNotSure}
                disabled={isPending}
              >
                <Text className="text-white font-semibold">Confirmar: No recuerdo</Text>
              </Pressable>

              <Pressable className="items-center py-2" onPress={() => setStep("options")}>
                <Text className="text-muted">Volver</Text>
              </Pressable>
            </>
          )}

          {step === "undo_done_confirm" && (
            <>
              <Text className="text-base font-semibold text-center mb-2">Cambiar estado</Text>
              <Text className="text-sm text-muted text-center mb-6">
                Este ítem ya estaba marcado como hecho. ¿Seguro que quieres cambiar el estado?
              </Text>

              <Pressable
                className="bg-gray-200 rounded-xl py-4 mb-3 items-center"
                onPress={() => confirmUndoDone("skipped")}
                disabled={isPending}
              >
                <Text className="text-gray-700 font-semibold">— Saltado</Text>
              </Pressable>

              <Pressable
                className="bg-amber-100 rounded-xl py-4 mb-4 items-center"
                onPress={() => confirmUndoDone("not_sure")}
                disabled={isPending}
              >
                <Text className="text-amber-800 font-semibold">? No recuerdo</Text>
              </Pressable>

              <Pressable className="items-center py-2" onPress={reset}>
                <Text className="text-muted">Cancelar</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
