import { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { Activity, Pill, Search } from "lucide-react-native";
import type { Item } from "@mi-dia/types";
import { ItemForm, type ItemFormValues } from "../../components/item/ItemForm";
import { useItems } from "../../hooks/useItems";
import { useCreateItem, useUpdateItem, useSoftDeleteItem } from "../../hooks/useItemMutations";
import { colors, radii, spacing } from "../../theme";

type FilterTab = "all" | "medication" | "activity";
type TimeBlockKey = "mañana" | "tarde" | "noche";

function getTimeBlock(specificTime: string): TimeBlockKey {
  const [h] = specificTime.split(":").map(Number);
  if (h >= 6 && h < 14) return "mañana";
  if (h >= 14 && h < 20) return "tarde";
  return "noche";
}

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

function ItemIcon({ type }: { type: string }) {
  const isMed = type === "medication";
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: isMed ? colors.successLight : "#ffedd5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        flexShrink: 0,
      }}
    >
      {isMed ? (
        <Pill size={20} color={colors.success} strokeWidth={1.8} />
      ) : (
        <Activity size={20} color="#ea580c" strokeWidth={1.8} />
      )}
    </View>
  );
}

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const isMed = item.type === "medication";

  function showMenu() {
    Alert.alert(item.name, undefined, [
      { text: "Editar", onPress: () => onEdit(item) },
      { text: "Eliminar", style: "destructive", onPress: () => onDelete(item) },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: radii.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <ItemIcon type={item.type} />

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>{item.name}</Text>
          <View
            style={{
              borderRadius: radii.full,
              paddingHorizontal: 7,
              paddingVertical: 2,
              backgroundColor: isMed ? colors.successLight : "#ffedd5",
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "600", color: isMed ? colors.success : "#ea580c" }}>
              {isMed ? "Medicamento" : "Actividad"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.specific_time.slice(0, 5)}</Text>
          {item.dose ? (
            <>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>·</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.dose}</Text>
            </>
          ) : null}
          <Text style={{ fontSize: 12, color: colors.textMuted }}>·</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>
            {RECURRENCE_LABEL[item.recurrence_type]}
            {item.recurrence_type === "specific_days" && item.recurrence_days
              ? ` · ${item.recurrence_days.map((d) => DAY_NAMES[d]).join(" ")}`
              : ""}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginLeft: spacing.sm }}>
        <Pressable
          onPress={() => onEdit(item)}
          style={({ pressed }) => ({
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: radii.sm,
            backgroundColor: pressed ? colors.primarySubtle : colors.gray100,
          })}
          hitSlop={4}
        >
          <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "500" }}>Editar</Text>
        </Pressable>
        <Pressable
          onPress={showMenu}
          style={({ pressed }) => ({
            width: 32,
            height: 32,
            borderRadius: radii.sm,
            backgroundColor: pressed ? colors.gray200 : colors.gray100,
            alignItems: "center",
            justifyContent: "center",
          })}
          hitSlop={4}
        >
          <Text style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 18 }}>···</Text>
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

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "medication", label: "Medicamentos" },
  { key: "activity", label: "Actividades" },
];

export default function MedicationsScreen() {
  const { data: items = [], isLoading, isError, refetch, isFetching } = useItems();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const deleteMutation = useSoftDeleteItem();

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  function openCreate() {
    setEditing(null);
    setFormVisible(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    setFormVisible(true);
  }

  function handleDelete(item: Item) {
    Alert.alert("Eliminar ítem", `¿Seguro que deseas eliminar "${item.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate(item.id) },
    ]);
  }

  function handleFormSubmit(values: ItemFormValues) {
    const payload = {
      type: values.type,
      name: values.name,
      dose: values.dose || null,
      specific_time: values.specific_time + ":00",
      recurrence_type: values.recurrence_type,
      recurrence_days: values.recurrence_type === "daily" ? null : values.recurrence_days,
    };

    function handleError(error: Error & { code?: string }) {
      if (error.code === "23505") {
        Alert.alert("Conflicto", "Ya existe un item con ese nombre y hora.");
      } else {
        Alert.alert("Error", error.message || "No se pudo guardar el item.");
      }
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload }, { onSuccess: () => setFormVisible(false), onError: handleError });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setFormVisible(false), onError: handleError });
    }
  }

  const filtered = useMemo(() => {
    let result = items;
    if (filter !== "all") result = result.filter((i) => i.type === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, filter, search]);

  const grouped = groupItems(filtered);
  const sections: SectionData[] = [
    { title: "MAÑANA", key: "mañana", items: grouped.mañana },
    { title: "TARDE", key: "tarde", items: grouped.tarde },
    { title: "NOCHE", key: "noche", items: grouped.noche },
  ];

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const listHeader = (
    <View style={{ backgroundColor: colors.surface }}>
      {/* Title row */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
          paddingBottom: spacing.sm,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        }}
      >
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}>Rutina</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
            Organiza tus medicamentos y actividades
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primaryDark : colors.primary,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 8,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
            opacity: isMutating ? 0.6 : 1,
          })}
          onPress={openCreate}
          disabled={isMutating}
        >
          <Text style={{ color: colors.white, fontWeight: "600", fontSize: 14 }}>+ Nuevo ítem</Text>
        </Pressable>
      </View>

      {/* Search bar */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
          backgroundColor: colors.white,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.gray100,
            borderRadius: radii.lg,
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === "android" ? 6 : 8,
            gap: 8,
          }}
        >
          <Search size={16} color={colors.textMuted} strokeWidth={1.8} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar ítem..."
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, fontSize: 14, color: colors.textPrimary, padding: 0 }}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Filter tabs */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.white,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        }}
      >
        {TABS.map((tab) => {
          const active = filter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: radii.full,
                backgroundColor: active ? colors.success : colors.gray100,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: active ? "600" : "400",
                  color: active ? colors.white : colors.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Empty state */}
      {!isLoading && !isError && items.length === 0 && (
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: radii.xl,
            padding: 28,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            alignItems: "center",
            margin: spacing.lg,
            marginTop: spacing.xl,
          }}
        >
          <Text style={{ fontSize: 40, marginBottom: 12 }}>💊</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary, marginBottom: 6 }}>
            Sin rutina configurada
          </Text>
          <Text
            style={{ color: colors.textMuted, textAlign: "center", fontSize: 14, marginBottom: 20, lineHeight: 20 }}
          >
            Agrega medicamentos y actividades para que aparezcan en tu checklist diario.
          </Text>
          <Pressable
            style={{ backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 20, paddingVertical: 12 }}
            onPress={openCreate}
          >
            <Text style={{ color: colors.white, fontWeight: "600" }}>Agregar el primero</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && items.length > 0 && filtered.length === 0 && (
        <View style={{ alignItems: "center", paddingTop: 32 }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>Sin resultados para tu búsqueda</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        {listHeader}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        {listHeader}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: colors.textMuted, textAlign: "center" }}>No se pudieron cargar los items.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <FlatList
        data={sections}
        keyExtractor={(section) => section.key}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item: section }) =>
          section.items.length === 0 ? null : (
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: colors.textMuted,
                  letterSpacing: 0.8,
                  marginBottom: spacing.sm,
                  marginLeft: 4,
                }}
              >
                {section.title}
              </Text>
              {section.items.map((item) => (
                <ItemCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </View>
          )
        }
      />

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
