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
import { Edit2, Trash2 } from "lucide-react-native";
import type { Item } from "@mi-dia/types";
import { ItemForm, type ItemFormValues } from "../../components/item/ItemForm";
import { useItems } from "../../hooks/useItems";
import {
  useCreateItem,
  useUpdateItem,
  useSoftDeleteItem,
} from "../../hooks/useItemMutations";
import { colors, radii, shadows, spacing } from "../../theme";

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

const DAY_NAMES = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const isMed = item.type === "medication";
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: radii.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        flexDirection: "row",
        alignItems: "center",
        ...shadows.subtle,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>{item.name}</Text>
          <View
            style={{
              borderRadius: radii.full,
              paddingHorizontal: 7,
              paddingVertical: 2,
              backgroundColor: isMed ? colors.infoSubtle : colors.primarySubtle,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "600", color: isMed ? colors.info : colors.primary }}>
              {isMed ? "Med" : "Act"}
            </Text>
          </View>
        </View>
        {item.dose ? (
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 2 }}>{item.dose}</Text>
        ) : null}
        <Text style={{ fontSize: 12, color: colors.textMuted }}>
          {item.specific_time.slice(0, 5)}
          {" · "}
          {RECURRENCE_LABEL[item.recurrence_type]}
          {item.recurrence_type === "specific_days" && item.recurrence_days
            ? ` · ${item.recurrence_days.map((d) => DAY_NAMES[d]).join(" ")}`
            : ""}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 4, marginLeft: spacing.sm }}>
        <Pressable
          onPress={() => onEdit(item)}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: radii.md,
            backgroundColor: pressed ? colors.primarySubtle : colors.gray100,
            alignItems: "center",
            justifyContent: "center",
          })}
          hitSlop={4}
        >
          <Edit2 size={16} color={colors.textSecondary} strokeWidth={1.8} />
        </Pressable>
        <Pressable
          onPress={() => onDelete(item)}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: radii.md,
            backgroundColor: pressed ? colors.dangerSubtle : colors.gray100,
            alignItems: "center",
            justifyContent: "center",
          })}
          hitSlop={4}
        >
          <Trash2 size={16} color={colors.danger} strokeWidth={1.8} />
        </Pressable>
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

    function handleError(error: Error & { code?: string }) {
      if (error.code === "23505") {
        Alert.alert("Conflicto", "Ya existe un item con ese nombre y hora.");
      } else {
        Alert.alert("Error", error.message || "No se pudo guardar el item.");
      }
    }

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: payload },
        { onSuccess: () => setFormVisible(false), onError: handleError }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setFormVisible(false),
        onError: handleError,
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
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}>Rutina</Text>
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primaryDark : colors.primary,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 8,
          })}
          onPress={openCreate}
          disabled={isMutating}
        >
          <Text style={{ color: colors.white, fontWeight: "600", fontSize: 14 }}>+ Nuevo</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: colors.textMuted, textAlign: "center" }}>No se pudieron cargar los items.</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(section) => section.key}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 4, paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item: section }) =>
            section.items.length === 0 ? null : (
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: spacing.sm }}>
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
              <View style={{ backgroundColor: colors.white, borderRadius: radii.xl, padding: 28, borderWidth: 1, borderColor: colors.cardBorder, alignItems: "center", marginTop: spacing.xl }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>💊</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary, marginBottom: 6 }}>Sin rutina configurada</Text>
                <Text style={{ color: colors.textMuted, textAlign: "center", fontSize: 14, marginBottom: 20, lineHeight: 20 }}>
                  Agrega medicamentos y actividades para que aparezcan en tu checklist diario.
                </Text>
                <Pressable
                  style={{ backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 20, paddingVertical: 12 }}
                  onPress={openCreate}
                >
                  <Text style={{ color: colors.white, fontWeight: "600" }}>Agregar el primero</Text>
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
