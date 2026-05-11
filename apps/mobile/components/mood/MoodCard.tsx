import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";
import type { MoodValue } from "@mi-dia/types";

interface MoodOption {
  value: MoodValue;
  emoji: string;
  label: string;
  color: string;
  bg: string;
}

const MOODS: MoodOption[] = [
  { value: 1, emoji: "😢", label: "Muy mal",    color: "#ef4444", bg: "#fef2f2" },
  { value: 2, emoji: "😕", label: "Mal",        color: "#f97316", bg: "#fff7ed" },
  { value: 3, emoji: "😐", label: "Normal",     color: "#eab308", bg: "#fefce8" },
  { value: 4, emoji: "🙂", label: "Bien",       color: "#22c55e", bg: "#f0fdf4" },
  { value: 5, emoji: "😄", label: "Excelente",  color: "#3b82f6", bg: "#eff6ff" },
];

interface MoodCardProps {
  mood: MoodValue | null;
  note: string;
  onMoodChange: (value: MoodValue) => void;
  onNoteChange: (value: string) => void;
  isSaving: boolean;
  readonly?: boolean;
}

export function MoodCard({ mood, note, onMoodChange, onNoteChange, isSaving, readonly }: MoodCardProps) {
  const selectedOption = MOODS.find((m) => m.value === mood);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const prevColor = useRef<string>("#e5e7eb");

  useEffect(() => {
    const target = selectedOption?.color ?? "#e5e7eb";
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: false,
    }).start(() => {
      prevColor.current = target;
      borderAnim.setValue(0);
    });
  }, [mood]); // eslint-disable-line react-hooks/exhaustive-deps

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [prevColor.current, selectedOption?.color ?? "#e5e7eb"],
  });

  return (
    <Animated.View
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor,
        backgroundColor: selectedOption?.bg ?? "#ffffff",
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 12 }}>
        ¿Cómo te sientes hoy?
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
        {MOODS.map((option) => {
          const isSelected = mood === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => { if (!readonly) onMoodChange(option.value); }}
              disabled={readonly}
              style={({ pressed }) => ({
                alignItems: "center",
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  borderWidth: isSelected ? 3 : 1.5,
                  borderColor: isSelected ? option.color : "#e5e7eb",
                  backgroundColor: isSelected ? option.bg : "#f9fafb",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 26 }}>{option.emoji}</Text>
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: isSelected ? option.color : "#9ca3af",
                  fontWeight: isSelected ? "600" : "400",
                  textAlign: "center",
                  width: 56,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!readonly && (
        <>
          <TextInput
            value={note}
            onChangeText={onNoteChange}
            placeholder="Añade una nota sobre tu día…"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            editable={!readonly}
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 13,
              color: "#111827",
              minHeight: 72,
              textAlignVertical: "top",
              backgroundColor: "#ffffff",
            }}
          />
          {isSaving && (
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, textAlign: "right" }}>
              Guardando…
            </Text>
          )}
        </>
      )}

      {readonly && note.length > 0 && (
        <Text style={{ fontSize: 13, color: "#374151", fontStyle: "italic" }}>
          {note}
        </Text>
      )}
    </Animated.View>
  );
}
