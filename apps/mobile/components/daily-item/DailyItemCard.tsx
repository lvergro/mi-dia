import { Pressable, Text, View } from "react-native";
import type { DailyItem } from "@mi-dia/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  done: "Hecho",
  skipped: "Saltado",
  not_sure: "No recuerdo",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-pending",
  done: "bg-done",
  skipped: "bg-skipped",
  not_sure: "bg-not_sure",
};

const STATUS_TEXT_CLASS: Record<string, string> = {
  pending: "text-gray-500",
  done: "text-white",
  skipped: "text-white",
  not_sure: "text-white",
};

interface DailyItemCardProps {
  item: DailyItem;
  onPress: (item: DailyItem) => void;
}

export function DailyItemCard({ item, onPress }: DailyItemCardProps) {
  return (
    <Pressable
      className="flex-row items-center justify-between py-3 px-1 border-b border-gray-100 active:opacity-70"
      onPress={() => onPress(item)}
    >
      <View className="flex-1 mr-3">
        <Text className="text-base text-gray-900 font-medium">{item.title}</Text>
        {item.scheduled_time && (
          <Text className="text-xs text-muted mt-0.5">{item.scheduled_time.slice(0, 5)}</Text>
        )}
      </View>
      <View className={`rounded-full px-3 py-1 ${STATUS_CLASS[item.status] ?? "bg-gray-200"}`}>
        <Text className={`text-xs font-semibold ${STATUS_TEXT_CLASS[item.status] ?? "text-gray-600"}`}>
          {STATUS_LABEL[item.status] ?? item.status}
        </Text>
      </View>
    </Pressable>
  );
}
