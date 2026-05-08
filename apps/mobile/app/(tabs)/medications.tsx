import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import type { Item } from "@mi-dia/types";
import { ItemForm, type ItemFormValues } from "../../components/item/ItemForm";
import { useItems } from "../../hooks/useItems";
import {
  useCreateItem,
  useUpdateItem,
  useSoftDeleteItem,
} from "../../hooks/useItemMutations";

function getTimeBlock(specificTime: string): "mañana" | "tarde" | "noche" {
  const [h] = specificTime.split(":").map(Number);
  if (h >= 6 && h < 14) return "mañana";
  if (h >= 14 && h < 20) return "tarde";
  return "noche";
}

type TimeBlockKey = "mañana" | "tarde" | "noche";

interface GroupedItems {
  mañana: Item[];
  tarde: Item[];
  noche: Item[];
}

function groupItems(items: Item[]): GroupedItems {
  const grouped: GroupedItems = { mañana: [], tarde: [], noche: [] };
  for (const item of items) {
    grouped[getTimeBlock(item.specific_time)].push(item);
  }
  return grouped;
}

const RECURRENCE_LABEL: Record<string, string> = {
  daily: "Diaria",
  specific_days: "Días específicos",
};

const TYPE_LABEL: Record<string, string> = {
  medication: "Medicamento",
  activity: "Actividad",
};

const DAY_NAMES = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row items-start">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
            <View className="bg-primary/10 rounded-full px-2 py-0.5">
              <Text className="text-xs text-primary font-medium">
                {TYPE_LABEL[item.type]}
              </Text>
            </View>
          </View>
          {item.dose ? (
            <Text className="text-sm text-muted mt-0.5">{item.dose}</Text>
          ) : null}
          <Text className="text-xs text-gray-400 mt-1">
            {item.specific_time.slice(0, 5)} · {RECURRENCE_LABEL[item.recurrence_type]}
            {item.recurrence_type === "specific_days" && item.recurrence_days
              ? ` (${item.recurrence_days.map((d) => DAY_NAMES[d]).join(", ")})`
              : ""}
          </Text>
        </View>

        <View className="flex-row gap-2 ml-3">
          <Pressable
            onPress={() => onEdit(item)}
            className="bg-gray-100 rounded-xl px-3 py-2"
          >
            <Text className="text-sm text-gray-700">Editar</Text>
          </Pressable>
          <Pressable
            onPress={() => onDelete(item)}
            className="bg-red-50 rounded-xl px-3 py-2"
          >
            <Text className="text-sm text-red-600">Eliminar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

interface SectionData {
  title: string;
  key: TimeBlockKey;
  items: Item[];
}

export default function MedicationsScreen() {
  const { data: items = [], isLoading, isError, refetch, isFetching } = useItems();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const deleteMutation = useSoftDeleteItem();

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  function openCreate() {
    setEditing(null);
    setFormVisible(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    setFormVisible(true);
  }

  function handleDelete(item: Item) {
    Alert.alert(
      "Eliminar ítem",
      `¿Seguro que deseas eliminar "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteMutation.mutate(item.id),
        },
      ]
    );
  }

  function handleFormSubmit(values: ItemFormValues) {
    const payload = {
      type: values.type,
      name: values.name,
      dose: values.dose || null,
      specific_time: values.specific_time + ":00",
      recurrence_type: values.recurrence_type,
      recurrence_days:
        values.recurrence_type === "daily" ? null : values.recurrence_days,
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => setFormVisible(false),
          onError: (error: Error & { code?: string }) => {
            if (error.code === "23505") {
              Alert.alert("Conflicto", "Ya existe un item con ese nombre y hora.");
            }
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setFormVisible(false),
        onError: (error: Error & { code?: string }) => {
          if (error.code === "23505") {
            Alert.alert("Conflicto", "Ya existe un item con ese nombre y hora.");
          }
        },
      });
    }
  }

  const grouped = groupItems(items);
  const sections: SectionData[] = [
    { title: "Mañana", key: "mañana", items: grouped.mañana },
    { title: "Tarde", key: "tarde", items: grouped.tarde },
    { title: "Noche", key: "noche", items: grouped.noche },
  ];

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-6 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Items</Text>
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
          <Text className="text-muted text-center">No se pudieron cargar los items.</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(section) => section.key}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor="#4f46e5"
            />
          }
          renderItem={({ item: section }) =>
            section.items.length === 0 ? null : (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  {section.title}
                </Text>
                {section.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            )
          }
          ListEmptyComponent={
            items.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center mt-4">
                <Text className="text-4xl mb-3">📋</Text>
                <Text className="text-muted text-center">
                  Aún no tienes items registrados.
                </Text>
                <Pressable
                  className="mt-4 bg-primary rounded-xl px-5 py-3"
                  onPress={openCreate}
                >
                  <Text className="text-white font-semibold">Agregar el primero</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}

      <ItemForm
        visible={formVisible}
        initial={editing}
        onClose={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </View>
  );
}
